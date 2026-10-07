import React, { useEffect, useState } from "react";

function CaseVerification() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch pending cases from backend
  const fetchCases = async () => {
    try {
      const response = await fetch(
        "/api/admin/cases/pending"
      );

      const data = await response.json();

      setCases(data);
    } catch (error) {
      console.error("Error fetching pending cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load cases when page opens
  useEffect(() => {
    fetchCases();
  }, []);

  // Verify case
  const handleVerify = async (id) => {
    setProcessingId(id);

    try {
      const response = await fetch(
        `/api/admin/cases/${id}/verify`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        // Remove verified case from pending list
        setCases((prevCases) =>
          prevCases.filter((item) => item.id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error verifying case:", error);
      alert("Failed to verify case");
    } finally {
      setProcessingId(null);
    }
  };

  // Reject case
  const handleReject = async (id) => {
    setProcessingId(id);

    try {
      const response = await fetch(
        `/api/admin/cases/${id}/reject`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        // Remove rejected case from pending list
        setCases((prevCases) =>
          prevCases.filter((item) => item.id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error rejecting case:", error);
      alert("Failed to reject case");
    } finally {
      setProcessingId(null);
    }
  };

  // Change priority
  const handlePriorityChange = async (id, priority) => {
    try {
      const response = await fetch(
        `/api/admin/cases/${id}/priority`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: priority,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update priority on screen
        setCases((prevCases) =>
          prevCases.map((item) =>
            item.id === id
              ? { ...item, priority: priority }
              : item
          )
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority");
    }
  };

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">CASE MANAGEMENT</span>

          <h1>Case Verification</h1>

          <p>
            Review and verify missing child reports submitted by users.
          </p>
        </div>

        <div className="pending-number">
          {cases.length} Pending
        </div>
      </div>

      <div className="dashboard-card">
        <div className="table-container">
          {loading ? (
            <p style={{ padding: "20px" }}>
              Loading pending cases...
            </p>
          ) : cases.length === 0 ? (
            <p style={{ padding: "20px" }}>
              No pending cases found.
            </p>
          ) : (
            <table className="case-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Child</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.case_id}</strong>
                    </td>

                    <td>{item.child_name}</td>

                    <td>{item.age}</td>

                    <td>{item.gender}</td>

                    <td>{item.location}</td>

                    <td>
                      <select
                        value={item.priority}
                        onChange={(e) =>
                          handlePriorityChange(
                            item.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>

                    <td>
                      <span className="pending-status">
                        Pending Verification
                      </span>
                    </td>

                    <td>
                      <button
                        className="verify-button"
                        onClick={() =>
                          handleVerify(item.id)
                        }
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id
                          ? "Processing..."
                          : "Verify"}
                      </button>

                      <button
                        className="reject-button"
                        onClick={() =>
                          handleReject(item.id)
                        }
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseVerification;