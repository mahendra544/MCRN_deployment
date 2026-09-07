import React from "react";

function CaseManagement() {

  return (

    <div>

      <div className="page-title">

        <div>

          <span className="section-label">
            CASE MANAGEMENT
          </span>

          <h1>
            All Cases
          </h1>

          <p>
            Monitor and manage all missing child cases.
          </p>

        </div>

      </div>


      <div className="dashboard-card">

        <div className="filter-row">

          <select>
            <option>All Status</option>
            <option>Pending Verification</option>
            <option>Verified</option>
            <option>Assigned</option>
            <option>Investigation</option>
            <option>Child Located</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select>
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="text"
            placeholder="Search cases..."
          />

        </div>


        <div className="case-management-message">

          <div>
            📁
          </div>

          <h2>
            All Case Records
          </h2>

          <p>
            Case records will appear here once
            connected to the backend database.
          </p>

        </div>

      </div>

    </div>
  );
}

export default CaseManagement;