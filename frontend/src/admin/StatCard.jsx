/*import React, { useState, useEffect } from "react";

function StatCard({ title, value, icon, type }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const timer = setInterval(() => {
      start += 1;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <p>{title}</p>
        <h2>{count}</h2>
      </div>
    </div>
  );
}

export default StatCard;*/
import React, { useState, useEffect } from "react";

function StatCard({ title, value, icon, type }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const timer = setInterval(() => {
      start += 1;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <p>{title}</p>
        <h2 className="stat-number">{count}</h2>
      </div>
    </div>
  );
}

export default StatCard;
