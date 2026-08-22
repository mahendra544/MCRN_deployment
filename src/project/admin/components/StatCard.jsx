import React from "react";

function StatCard({
  title,
  value,
  icon,
  type
}) {

  return (
    <div className={`stat-card ${type}`}>

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

export default StatCard;