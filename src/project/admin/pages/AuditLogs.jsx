import React from "react";

function AuditLogs() {

  const logs = [
    {
      date: "21 Aug 2026, 04:10 PM",
      user: "Admin",
      action: "Verified case MCN-003"
    },
    {
      date: "21 Aug 2026, 03:42 PM",
      user: "Admin",
      action: "Assigned MCN-004 to Officer Sita Devi"
    },
    {
      date: "21 Aug 2026, 03:15 PM",
      user: "Officer Ravi Kumar",
      action: "Updated investigation for MCN-001"
    },
    {
      date: "21 Aug 2026, 02:30 PM",
      user: "Admin",
      action: "Closed case MCN-005"
    }
  ];

  return (

    <div>

      <div className="page-title">

        <div>

          <span className="section-label">
            SECURITY
          </span>

          <h1>
            Audit Logs
          </h1>

          <p>
            Track important actions performed in the system.
          </p>

        </div>

      </div>


      <div className="dashboard-card">

        <div className="table-container">

          <table className="case-table">

            <thead>

              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {logs.map((log, index) => (

                <tr key={index}>

                  <td>
                    {log.date}
                  </td>

                  <td>
                    <strong>
                      {log.user}
                    </strong>
                  </td>

                  <td>
                    {log.action}
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

export default AuditLogs;