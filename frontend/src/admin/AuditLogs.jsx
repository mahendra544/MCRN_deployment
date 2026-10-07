import React, { useEffect, useState } from "react";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH AUDIT LOGS FROM BACKEND
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        "/api/admin/audit-logs"
      );

      const data = await response.json();

      if (data.success) {
        setLogs(data.auditLogs);
      } else {
        console.error("Failed to fetch audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // FORMAT DATE & TIME
  const formatDateTime = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">SECURITY</span>
          <h1>Audit Logs</h1>
          <p>Track important actions performed in the system.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-container">
          <table className="case-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3">
                    Loading audit logs...
                  </td>
                </tr>
              )}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan="3">
                    No audit logs available.
                  </td>
                </tr>
              )}

              {!loading &&
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {formatDateTime(log.created_at)}
                    </td>

                    <td>
                      <strong>
                        {log.performed_by}
                      </strong>
                    </td>

                    <td>
                      {log.description}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;