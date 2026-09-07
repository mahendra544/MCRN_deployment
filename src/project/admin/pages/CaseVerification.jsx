import React from "react";

function CaseVerification() {

  const cases = [
    {
      id: "MCN-006",
      child: "Pooja",
      age: 7,
      gender: "Female",
      location: "Nellore",
      date: "21 Aug 2026",
      priority: "High",
      status: "Pending"
    },
    {
      id: "MCN-007",
      child: "Ravi",
      age: 11,
      gender: "Male",
      location: "Vizag",
      date: "21 Aug 2026",
      priority: "Medium",
      status: "Pending"
    },
    {
      id: "MCN-008",
      child: "Meena",
      age: 9,
      gender: "Female",
      location: "Guntur",
      date: "20 Aug 2026",
      priority: "High",
      status: "Pending"
    }
  ];

  return (

    <div>

      <div className="page-title">

        <div>
          <span className="section-label">
            CASE MANAGEMENT
          </span>

          <h1>
            Case Verification
          </h1>

          <p>
            Review and verify missing child reports
            submitted by users.
          </p>
        </div>

        <div className="pending-number">
          3 Pending
        </div>

      </div>


      <div className="dashboard-card">

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
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {cases.map((item) => (

                <tr key={item.id}>

                  <td>
                    <strong>
                      {item.id}
                    </strong>
                  </td>

                  <td>
                    {item.child}
                  </td>

                  <td>
                    {item.age}
                  </td>

                  <td>
                    {item.gender}
                  </td>

                  <td>
                    {item.location}
                  </td>

                  <td>
                    <span
                      className={`priority ${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td>
                    <span className="pending-status">
                      Pending
                    </span>
                  </td>

                  <td>

                    <button className="verify-button">
                      Review
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default CaseVerification;