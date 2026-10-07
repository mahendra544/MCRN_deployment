import StatusBadge from "./status-badge.jsx";

function CaseRow({
  caseItem,
  isSelected,
  onOpenCase,
}) {
  return (
    <button
      type="button"
      className={`case-row ${isSelected ? "selected" : ""}`}
      onClick={() => onOpenCase(caseItem.case_id)}
    >
      <div className="case-row-avatar" style={{ overflow: "hidden" }}>
        {caseItem.photo ? (
          <img
            src={caseItem.photo.startsWith("http") ? caseItem.photo : caseItem.photo}
            alt={caseItem.child_name}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          caseItem.child_name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        )}
      </div>

      <div className="case-row-main">
        <div className="case-row-top">
          <strong>{caseItem.child_name}</strong>
          <StatusBadge stage={caseItem.case_stage} />
        </div>

        <span className="case-row-meta">
          Case #{caseItem.case_id}
        </span>

        <span className="case-row-location">
          <span>⌖</span>
          {caseItem.last_seen_location}
        </span>
      </div>

      <span className="case-row-arrow">›</span>
    </button>
  );
}

export default CaseRow;