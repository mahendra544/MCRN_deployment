import React, { useEffect, useState } from "react";

function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [search, setSearch] = useState("");

  // Get cases from backend
  useEffect(() => {
    fetch("/api/admin/cases")
      .then((response) => response.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
        setLoading(false);
      });
  }, []);

  // Filter cases
  const filteredCases = cases.filter((item) => {
    const matchesStatus =
      statusFilter === "All Status" ||
      item.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priority" ||
      item.priority === priorityFilter;

    const matchesSearch =
      item.case_id.toLowerCase().includes(search.toLowerCase()) ||
      item.child_name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">CASE MANAGEMENT</span>
          <h1>All Cases</h1>
          <p>Monitor and manage all missing child cases.</p>
        </div>
      </div>

      <div className="dashboard-card">

        {/* Filters */}
        <div className="filter-row">

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Pending Verification</option>
            <option>Verified</option>
            <option>Assigned</option>
            <option>Investigation</option>
            <option>Child Located</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Cases */}
        {loading ? (
          <div className="case-management-message">
            <div>⏳</div>
            <h2>Loading Cases...</h2>
            <p>Please wait while cases are loaded from the database.</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="case-management-message">
            <div>📁</div>
            <h2>No Cases Found</h2>
            <p>No cases match your search or filters.</p>
          </div>
        ) : (
          <div className="table-container">
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
                </tr>
              </thead>

              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.case_id}</strong>
                    </td>

                    <td>
                      <strong>{item.child_name}</strong>
                    </td>

                    <td>{item.age}</td>

                    <td>{item.gender}</td>

                    <td>{item.location}</td>

                    <td>
                      <span
                        className={`priority ${item.priority.toLowerCase()}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td>
                      <span className="case-status">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default CaseManagement;