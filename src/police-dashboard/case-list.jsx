import CaseRow from "./case-row.jsx";

function CaseList({
  cases,
  selectedCaseId,
  onOpenCase,
}) {
  return (
    <section className="panel case-list-panel">
      <div className="panel-header">
        <div>
          <span className="section-kicker">ACTIVE WORK</span>
          <h2>Assigned Cases</h2>
          <p>Cases currently assigned to your unit.</p>
        </div>

        <span className="case-count">
          {cases.length}
        </span>
      </div>

      <div className="case-list">
        {cases.length > 0 ? (
          cases.map((caseItem) => (
            <CaseRow
              key={caseItem.case_id}
              caseItem={caseItem}
              isSelected={caseItem.case_id === selectedCaseId}
              onOpenCase={onOpenCase}
            />
          ))
        ) : (
          <div className="empty-list">
            <span>⌕</span>
            <strong>No matching cases</strong>
            <p>Try changing your search filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CaseList;