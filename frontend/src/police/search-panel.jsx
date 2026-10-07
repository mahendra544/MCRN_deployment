function SearchPanel({ filters, onChange, onReset }) {
  const handleField = (key) => (event) => {
    onChange({
      ...filters,
      [key]: event.target.value,
    });
  };

  return (
    <section className="search-panel reveal is-visible">

      {/* Search panel heading */}
      <div className="search-panel-title">
        <div className="search-panel-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10.8"
              cy="10.8"
              r="6.8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 16L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="search-panel-heading">
          <h3>Find a case</h3>
          <p>Search verified reports</p>
        </div>
      </div>

      {/* Child name */}
      <div className="field search-field">
        <label htmlFor="search-name">
          Child name
        </label>

        <div className="search-input-wrapper">
          <svg
            className="search-input-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="10.8"
              cy="10.8"
              r="6.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 16L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <input
            id="search-name"
            className="input search-input"
            type="text"
            placeholder="Search by child name"
            value={filters.name}
            onChange={handleField("name")}
          />
        </div>
      </div>

      {/* Case stage */}
      <div className="field">
        <label htmlFor="search-status">
          Case stage
        </label>

        <select
          id="search-status"
          className="select"
          value={filters.stage}
          onChange={handleField("stage")}
        >
          <option value="">All stages</option>
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Matched">Matched</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Location */}
      <div className="field">
        <label htmlFor="search-location">
          Location
        </label>

        <input
          id="search-location"
          className="input"
          type="text"
          placeholder="Area / locality"
          value={filters.location}
          onChange={handleField("location")}
        />
      </div>

      {/* Clear button */}
      <button
        type="button"
        className="btn btn-ghost search-clear-btn"
        onClick={onReset}
      >
        Clear
      </button>

    </section>
  );
}

export default SearchPanel;