import { useEffect, useState } from "react";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        return response.json();
      })
      .then((data) => {
        setReports(data.reports);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("Failed to load reports.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="container">
          <p className="reports-message">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="container">
          <p className="reports-message error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="container">

        <div className="reports-header">
          <p className="reports-eyebrow">Missing Child Rescue Network</p>
          <h2>Reported Missing Children</h2>
          <p>
            View submitted missing child reports and their current status.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="no-reports">
            <h3>No reports found</h3>
            <p>No missing child reports have been submitted yet.</p>
          </div>
        ) : (
          <div className="reports-grid">

            {reports.map((report) => (
              <div className="report-card" key={report.id}>

                {/* Child Photo */}
                <div className="report-photo-container">
                  {report.photo ? (
                    <img
                      src={`http://localhost:5000/uploads/${report.photo}`}
                      alt={report.child_name}
                      className="report-photo"
                    />
                  ) : (
                    <div className="no-photo">
                      No Photo
                    </div>
                  )}
                </div>

                {/* Child Information */}
                <div className="report-content">

                  <div className="report-card-header">
                    <div>
                      <h3>{report.child_name}</h3>
                      <p className="report-id">
                        Report ID: #{report.id}
                      </p>
                    </div>

                    <span className="status-badge">
                      {report.status}
                    </span>
                  </div>

                  <div className="report-details">

                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span>{report.age} years</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Gender</span>
                      <span>{report.gender}</span>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">
                        Last Seen Location
                      </span>
                      <span>{report.last_seen_location}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Date Missing</span>
                      <span>{report.date_missing?.split("T")[0]}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Time Missing</span>
                      <span>{report.time_missing}</span>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">
                        Identification Marks
                      </span>
                      <span>{report.identifying_marks || "Not provided"}</span>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">Clothing</span>
                      <span>
                        {report.clothing_description || "Not provided"}
                      </span>
                    </div>

                  </div>

                  {/* Parent / Guardian */}
                  <div className="guardian-section">
                    <h4>Parent / Guardian</h4>

                    <p>
                      <strong>Name:</strong> {report.parent_name}
                    </p>

                    <p>
                      <strong>Phone:</strong> {report.parent_phone}
                    </p>

                    {report.parent_email && (
                      <p>
                        <strong>Email:</strong> {report.parent_email}
                      </p>
                    )}

                    <p>
                      <strong>Address:</strong> {report.address}
                    </p>
                  </div>

                  {/* Additional Information */}
                  {report.additional_information && (
                    <div className="additional-info">
                      <h4>Additional Information</h4>
                      <p>{report.additional_information}</p>
                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Reports;