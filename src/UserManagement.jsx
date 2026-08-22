import React from "react";

function UserManagement() {
  const users = [
    { id: "USR-001", name: "Ravi Kumar", email: "ravi@example.com", reports: 2, status: "Active" },
    { id: "USR-002", name: "Lakshmi Devi", email: "lakshmi@example.com", reports: 1, status: "Active" },
    { id: "USR-003", name: "Suresh Rao", email: "suresh@example.com", reports: 3, status: "Active" }
  ];

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">SYSTEM MANAGEMENT</span>
          <h1>User Management</h1>
          <p>Manage registered users and their reports.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-container">
          <table className="case-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Reports</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.reports}</td>
                  <td><span className="active-status">● {user.status}</span></td>
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

export default UserManagement;