import StatusBadge from "./status-badge.jsx";

const NEXT_STAGE = {
  Open: "Investigating",
  Investigating: "Matched",
  Matched: "Resolved",
  Resolved: "Closed",
  Closed: "Closed",
};

function CaseDetailPanel({
  caseItem,
  onAdvanceStage,
  onMarkFound,
}) {
  if (!caseItem) {
    return (
      <section className="panel detail-panel">
        <div className="empty-detail">
          <div className="empty-icon">⌁</div>
          <h3>No case selected</h3>
          <p>
            Select a case from the list to review its details.
          </p>
        </div>
      </section>
    );
  }

  const {
    case_id,
    child_name,
    child_age,
    gender,
    last_seen_location,
    last_seen_datetime,
    case_stage,
    filed_by,
  } = caseItem;

  const nextStage = NEXT_STAGE[case_stage];
  const isClosed =
    case_stage === "Closed" ||
    case_stage === "Resolved";

  return (
    <section className="panel detail-panel">
      <div className="panel-header">
        <div>
          <span className="section-kicker">CASE DETAILS</span>
          <h2>Case #{case_id}</h2>
          <p>Filed by {filed_by}</p>
        </div>

        <StatusBadge stage={case_stage} />
      </div>

      <div className="child-profile">
        <div className="child-avatar">
          {child_name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>

        <div>
          <h3>{child_name}</h3>
          <p>
            {child_age} years · {gender}
          </p>
        </div>
      </div>

      <div className="detail-info">
        <div className="detail-info-item">
          <span>Last known location</span>
          <strong>{last_seen_location}</strong>
        </div>

        <div className="detail-info-item">
          <span>Last seen</span>
          <strong>
            {new Date(
              last_seen_datetime
            ).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      <div className="case-progress">
        <span className="case-progress-label">
          Case progress
        </span>

        <div className="progress-track">
          <span
            className="progress-value"
            style={{
              width:
                case_stage === "Open"
                  ? "20%"
                  : case_stage === "Investigating"
                  ? "45%"
                  : case_stage === "Matched"
                  ? "70%"
                  : "100%",
            }}
          />
        </div>
      </div>

      <div className="case-actions">
        {case_stage === "Open" && (
          <button
            className="btn btn-primary"
            onClick={() =>
              onAdvanceStage(
                case_id,
                "Investigating"
              )
            }
          >
            Accept case
          </button>
        )}

        {!isClosed &&
          case_stage !== "Open" &&
          nextStage && (
            <button
              className="btn btn-primary"
              onClick={() =>
                onAdvanceStage(case_id, nextStage)
              }
            >
              Move to {nextStage}
            </button>
          )}

        {!isClosed && (
          <button
            className="btn btn-secondary"
            onClick={() => onMarkFound(case_id)}
          >
            Mark child as found
          </button>
        )}

        {isClosed && (
          <div className="closed-message">
            ✓ This case is resolved and requires no
            further action.
          </div>
        )}
      </div>
    </section>
  );
}

export default CaseDetailPanel;