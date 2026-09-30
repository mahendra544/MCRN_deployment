const STAGE_TO_CLASS = {
  Open: "status-missing",
  Investigating: "status-pending",
  Matched: "status-verified",
  Resolved: "status-found",
  Closed: "status-found",
};

function StatusBadge({ stage }) {
  const className =
    STAGE_TO_CLASS[stage] || "status-pending";

  return (
    <span className={`status ${className}`}>
      <span className="status-dot" />
      {stage}
    </span>
  );
}

export default StatusBadge;