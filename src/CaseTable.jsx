import React from "react";

function CaseTable({ cases }) {
  return (
    <div className="table-container">
      <table className="case-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Child</th>
            <th>Age</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Police</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.id}</strong></td>
              <td>{item.child}</td>
              <td>{item.age}</td>
              <td>{item.location}</td>
              <td>
                <span className={`priority ${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
              </td>
              <td><span className="case-status">{item.status}</span></td>
              <td>{item.police}</td>
              <td><button className="view-button">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CaseTable;