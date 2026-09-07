import React from "react";

function PoliceManagement() {
  const officers = [
    { id: "PO-001", name: "Ravi Kumar", rank: "Inspector", station: "MVP Colony PS", cases: 4, status: "Active" },
    { id: "PO-002", name: "Sita Devi", rank: "Sub Inspector", station: "Kakinada PS", cases: 3, status: "Active" },
    { id: "PO-003", name: "Arun Kumar", rank: "Inspector", station: "Dwaraka Nagar PS", cases: 2, status: "Active" }
  ];

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">SYSTEM MANAGEMENT</span>
          <h1>Police Management</h1>
          <p>Manage police officers and their assigned cases.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-container">
          <table className="case-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Rank</th>
                <th>Station</th>
                <th>Active Cases</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer.id}>
                  <td>
                    <strong>{officer.name}</strong>
                    <small className="table-small">{officer.id}</small>
                  </td>
                  <td>{officer.rank}</td>
                  <td>{officer.station}</td>
                  <td>{officer.cases}</td>
                  <td><span className="active-status">● Active</span></td>
                  <td><button className="view-button">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PoliceManagement;