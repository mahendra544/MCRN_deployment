import React, { useEffect, useState } from "react";

// ===============================
// COUNTING ANIMATION
// ===============================
function CountUp({ end, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <strong
      style={{
        color: "#e02323",
        fontSize: "32px",
        fontWeight: "700",
        display: "block",
      }}
    >
      {count}
    </strong>
  );
}
function AnimatedBar({ height, value, status }) {
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarHeight(height);
    }, 100);

    return () => clearTimeout(timer);
  }, [height]);

  return (
    <div
      style={{
        height: `${barHeight}%`,
        transition: "height 1.2s ease-out",
      }}
      title={`${status}: ${value}`}
    >
      {value}
    </div>
  );
}
function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-title">
          <div>
            <span className="section-label">REPORTING</span>
            <h1>Analytics & Reports</h1>
            <p>Monitor missing child cases and rescue performance.</p>
          </div>
        </div>

        <div className="dashboard-card">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div>
        <div className="page-title">
          <div>
            <span className="section-label">REPORTING</span>
            <h1>Analytics & Reports</h1>
            <p>Monitor missing child cases and rescue performance.</p>
          </div>
        </div>

        <div className="dashboard-card">
          <p>Unable to load analytics.</p>
        </div>
      </div>
    );
  }

  // Calculate case counts from status
  const getStatusCount = (status) => {
    const item = analytics.casesByStatus.find(
      (caseItem) => caseItem.status === status
    );

    return item ? Number(item.count) : 0;
  };

  const totalCases = Number(analytics.totalCases);

  const activeCases =
    getStatusCount("Verified") +
    getStatusCount("Assigned") +
    getStatusCount("Investigation");

  const rescuedChildren =
    getStatusCount("Child Located") +
    getStatusCount("Resolved") +
    getStatusCount("Closed");

  const pendingCases = getStatusCount("Pending Verification");

  // Priority percentages
  const getPriorityCount = (priority) => {
    const item = analytics.casesByPriority.find(
      (caseItem) => caseItem.priority === priority
    );

    return item ? Number(item.count) : 0;
  };

  const getPriorityPercentage = (priority) => {
    if (totalCases === 0) return 0;

    return Math.round(
      (getPriorityCount(priority) / totalCases) * 100
    );
  };

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">REPORTING</span>
          <h1>Analytics & Reports</h1>
          <p>Monitor missing child cases and rescue performance.</p>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="analytics-cards">
        <div>
          <span>Total Cases</span>
          <CountUp end={totalCases} />
          <small>From all registered cases</small>
        </div>

        <div>
          <span>Active Cases</span>
          <CountUp end={activeCases} />
          <small>Verified, assigned & investigation</small>
        </div>

        <div>
          <span>Rescued Children</span>
          <CountUp end={rescuedChildren} />
          <small>Located, resolved & closed</small>
        </div>

        <div>
          <span>Pending</span>
          <CountUp end={pendingCases} />
          <small>Awaiting verification</small>
        </div>
      </div>

      {/* CHARTS */}
      <div className="dashboard-grid">

        {/* CASE STATUS */}
        <div className="dashboard-card">
          <h2>Cases by Status</h2>

         <div className="simple-chart">
  {analytics.casesByStatus.map((item) => {
    const finalHeight =
      totalCases > 0
        ? Math.max(
            (Number(item.count) / totalCases) * 100,
            10
          )
        : 10;

    return (
      <AnimatedBar
        key={item.status}
        height={finalHeight}
        value={item.count}
        status={item.status}
      />
    );
  })}
</div>
          <div className="chart-labels">
            {analytics.casesByStatus.map((item) => (
              <span key={item.status}>
                {item.status}
              </span>
            ))}
          </div>
        </div>

        {/* CASE PRIORITY */}
        <div className="dashboard-card">
          <h2>Case Priority</h2>

          <div className="priority-stat">
            <div>
              <span className="red-dot"></span>
              High
            </div>
            <strong>{getPriorityPercentage("High")}%</strong>
          </div>

          <div className="priority-stat">
            <div>
              <span className="orange-dot"></span>
              Medium
            </div>
            <strong>{getPriorityPercentage("Medium")}%</strong>
          </div>

          <div className="priority-stat">
            <div>
              <span className="green-dot"></span>
              Low
            </div>
            <strong>{getPriorityPercentage("Low")}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;