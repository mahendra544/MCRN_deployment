import React, { useEffect, useState } from "react";

function PoliceManagement() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedOfficer, setSelectedOfficer] = useState(null);
  useEffect(() => {
    fetchPolice();
  }, []);

  const fetchPolice = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/police"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch police officers"
        );
      }

      setOfficers(data.police || []);

    } catch (err) {
      console.error("Error fetching police:", err);
      setError(err.message || "Failed to load police officers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">
            SYSTEM MANAGEMENT
          </span>

          <h1>Police Management</h1>

          <p>
            Manage police officers and their assigned cases.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-container">

          {loading && (
            <p>Loading police officers...</p>
          )}

          {error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}

          {!loading && !error && (
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
                      <strong>
                        {officer.name}
                      </strong>

                      <small className="table-small">
                        {officer.police_id}
                      </small>
                    </td>

                    <td>
                      {officer.police_rank}
                    </td>

                    <td>
                      {officer.station}
                    </td>

                    <td>
                      0
                    </td>

                    <td>
                      <span
                        className={
                          officer.status === "Active"
                            ? "active-status"
                            : "inactive-status"
                        }
                      >
                        ● {officer.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-button"
                        onClick={() => setSelectedOfficer(officer)}
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </div>
      </div>
           
      {/* OFFICER DETAILS POPUP */}
      {selectedOfficer && (
        <div className="officer-modal-overlay">

          <div className="officer-modal">

            <div className="officer-modal-header">

              <div>
                <span className="section-label">
                  POLICE OFFICER DETAILS
                </span>

                <h2>{selectedOfficer.name}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedOfficer(null)}
              >
                ×
              </button>

            </div>
              <div className="officer-details">

              <div>
                <strong>Police ID:</strong>
                <span>{selectedOfficer.police_id}</span>
              </div>

              <div>
                <strong>Name:</strong>
                <span>{selectedOfficer.name}</span>
              </div>

              <div>
                          <strong>Rank:</strong>
              <span>{selectedOfficer.police_rank}</span>
            </div>

            <div>
              <strong>Police Station:</strong>
              <span>{selectedOfficer.station}</span>
            </div>

            <div>
              <strong>Email:</strong>
              <span>{selectedOfficer.email}</span>
            </div>

            <div>
              <strong>Phone:</strong>
              <span>{selectedOfficer.phone}</span>
            </div>

            <div>
              <strong>Badge Number:</strong>
              <span>{selectedOfficer.badge_number}</span>
            </div>

            <div>
              <strong>Username:</strong>
              <span>{selectedOfficer.username}</span>
            </div>

            <div>
              <strong>Status:</strong>
              <span>{selectedOfficer.status}</span>
            </div>

            <div>
              <strong>Active Cases:</strong>
              <span>0</span>
            </div>

          </div>
                      
               
             
            <div className="officer-modal-footer">

              <button
                className="primary-button"
                onClick={() => setSelectedOfficer(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PoliceManagement;