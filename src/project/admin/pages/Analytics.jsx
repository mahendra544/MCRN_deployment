import React from "react";

function Analytics() {

  return (

    <div>

      <div className="page-title">

        <div>

          <span className="section-label">
            REPORTING
          </span>

          <h1>
            Analytics & Reports
          </h1>

          <p>
            Monitor missing child cases and rescue performance.
          </p>

        </div>

      </div>


      <div className="analytics-cards">

        <div>
          <span>Total Cases</span>
          <strong>120</strong>
          <small>+12% this month</small>
        </div>

        <div>
          <span>Active Cases</span>
          <strong>45</strong>
          <small>+5% this month</small>
        </div>

        <div>
          <span>Rescued Children</span>
          <strong>62</strong>
          <small>+18% this month</small>
        </div>

        <div>
          <span>Pending</span>
          <strong>13</strong>
          <small>-8% this month</small>
        </div>

      </div>


      <div className="dashboard-grid">

        <div className="dashboard-card">

          <h2>
            Cases Reported
          </h2>

          <div className="simple-chart">

            <div style={{ height: "40%" }}>
              35
            </div>

            <div style={{ height: "60%" }}>
              48
            </div>

            <div style={{ height: "50%" }}>
              42
            </div>

            <div style={{ height: "75%" }}>
              65
            </div>

            <div style={{ height: "65%" }}>
              52
            </div>

            <div style={{ height: "90%" }}>
              74
            </div>

          </div>

          <div className="chart-labels">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>

        </div>


        <div className="dashboard-card">

          <h2>
            Case Priority
          </h2>

          <div className="priority-stat">

            <div>
              <span className="red-dot"></span>
              High
            </div>

            <strong>
              35%
            </strong>

          </div>

          <div className="priority-stat">

            <div>
              <span className="orange-dot"></span>
              Medium
            </div>

            <strong>
              45%
            </strong>

          </div>

          <div className="priority-stat">

            <div>
              <span className="green-dot"></span>
              Low
            </div>

            <strong>
              20%
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;