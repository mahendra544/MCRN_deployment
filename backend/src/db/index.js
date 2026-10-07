const { Pool, types } = require("pg");
require("dotenv").config();

types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));

function convertSql(sql) {
  let paramIndex = 1;
  let inString = false;
  let stringChar = "";
  let out = "";
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (inString) {
      out += c;
      if (c === stringChar) {
        if (sql[i + 1] === stringChar) {
          out += sql[++i];
        } else {
          inString = false;
        }
      }
    } else if (c === "'" || c === '"') {
      inString = true;
      stringChar = c;
      out += c;
    } else if (c === "?") {
      out += `$${paramIndex++}`;
    } else {
      out += c;
    }
  }

  out = out.replace(/\bUTC_TIMESTAMP\(\)/gi, "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')");
  out = out.replace(/\bDATE_ADD\s*\(\s*([^,]+)\s*,\s*INTERVAL\s+([^\)]+)\)/gi, "($1 + INTERVAL '$2')");
  out = out.replace(/INFORMATION_SCHEMA\.COLUMNS\s+WHERE\s+TABLE_SCHEMA\s*=\s*DATABASE\(\)/gi,
    "information_schema.columns WHERE table_schema = current_schema()");
  return out;
}

function formatResult(res) {
  const cmd = (res && res.command) || "";
  let result;
  if (cmd === "SELECT" || cmd === "SHOW") {
    result = res ? res.rows : [];
  } else if (cmd === "INSERT") {
    const first = res && res.rows && res.rows[0];
    const insertId = first ? Number((first.id !== undefined && first.id !== null) ? first.id : ((first.user_id !== undefined && first.user_id !== null) ? first.user_id : 0)) : 0;
    result = {
      insertId,
      affectedRows: res.rowCount || 0,
      rowCount: res.rowCount || 0,
      rows: res.rows || []
    };
  } else {
    result = {
      affectedRows: res ? (res.rowCount || 0) : 0,
      rowCount: res ? (res.rowCount || 0) : 0,
      changedRows: res ? (res.rowCount || 0) : 0,
      rows: res ? (res.rows || []) : []
    };
  }

  const tuple = [result, res ? res.fields : []];
  tuple.rows = res ? res.rows : [];
  tuple.rowCount = res ? res.rowCount : 0;
  tuple.command = cmd;
  tuple.insertId = result.insertId;
  tuple.affectedRows = result.affectedRows;
  return tuple;
}

function wrapClient(client) {
  if (client._isWrapped) return client;
  client._isWrapped = true;
  const origQuery = client.query.bind(client);

  client.query = function(sql, values, callback) {
    if (typeof values === "function") {
      callback = values;
      values = [];
    }
    if (!values) values = [];

    let convertedSql = typeof sql === "string" ? convertSql(sql) : sql;
    if (typeof convertedSql === "string") {
      const trimmed = convertedSql.trim();
      if (/^INSERT\s+INTO\b/i.test(trimmed) && !/\bRETURNING\b/i.test(trimmed)) {
        if (trimmed.endsWith(";")) {
          convertedSql = trimmed.slice(0, -1) + " RETURNING *;";
        } else {
          convertedSql = trimmed + " RETURNING *";
        }
      }
    }

    if (typeof callback === "function") {
      return origQuery(convertedSql, values, (err, res) => {
        if (err) return callback(err);
        const tuple = formatResult(res);
        callback(null, tuple[0], tuple[1]);
      });
    }

    return origQuery(convertedSql, values).then((res) => formatResult(res));
  };

  client.promise = () => client;
  client.beginTransaction = async () => client.query("BEGIN");
  client.commit = async () => client.query("COMMIT");
  client.rollback = async () => client.query("ROLLBACK");
  return client;
}

const connectionString = process.env.DATABASE_URL || (
  process.env.DB_HOST
    ? `postgresql://${encodeURIComponent(process.env.DB_USER || "postgres")}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "mcrn"}`
    : "postgresql://localhost:5432/mcrn"
);

const isSsl = String(process.env.PG_SSL || process.env.DB_SSL || "false").toLowerCase() === "true";

const pool = new Pool({
  connectionString,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

pool.promise = () => pool;

pool.query = function(sql, values, callback) {
  if (typeof values === "function") {
    callback = values;
    values = [];
  }
  if (typeof callback === "function") {
    return pool.connect().then((client) => {
      wrapClient(client);
      client.query(sql, values, (err, res, fields) => {
        client.release();
        if (err) return callback(err);
        callback(null, res, fields);
      });
    }).catch(callback);
  }
  return pool.connect().then((client) => {
    wrapClient(client);
    return client.query(sql, values).finally(() => {
      client.release();
    });
  });
};

const origConnect = pool.connect.bind(pool);
pool.connect = function(cb) {
  if (typeof cb === "function") {
    return origConnect((err, client, release) => {
      if (err) return cb(err);
      wrapClient(client);
      cb(null, client, release);
    });
  }
  return origConnect().then((client) => wrapClient(client));
};

pool.getConnection = async function() {
  return pool.connect();
};

pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("Reporting database connection error:", err.message);
  } else {
    console.log("Reporting PostgreSQL connected");
  }
});

module.exports = pool;
