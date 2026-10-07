import { useEffect, useState } from "react";
import StatusBadge from "./status-badge.jsx";

const NEXT_STAGE = {
  Open: "Investigating",
  Investigating: "Matched",
  Matched: "Resolved",
  Resolved: "Closed",
  Closed: "Closed",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function CaseDetailPanel({
  caseItem,
  onAdvanceStage,
  onMarkFound,
  onDeleteCase,
}) {
  const [matchedSightings, setMatchedSightings] =
    useState([]);

  const [loadingMatchedSightings, setLoadingMatchedSightings] =
    useState(false);

  useEffect(() => {
    if (!caseItem) {
      setMatchedSightings([]);
      return;
    }

    async function loadMatchedSightings() {
      try {
        setLoadingMatchedSightings(true);

        const response = await fetch(
          `${API_BASE_URL}/api/police/cases/${caseItem.id}/sightings`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("mcrn_token") || ""}` } }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load matched sightings"
          );
        }

        const data = await response.json();

        setMatchedSightings(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Error loading matched sightings:",
          error
        );

        setMatchedSightings([]);
      } finally {
        setLoadingMatchedSightings(false);
      }
    }

    loadMatchedSightings();
  }, [caseItem]);

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
    found_at,
    parent_name,
    parent_phone,
    parent_email,
    address,
    height,
    weight,
    complexion,
    identifying_marks,
    clothing_description,
    additional_information,
    photo,
  } = caseItem;

  const nextStage = NEXT_STAGE[case_stage];

  const isResolved =
    case_stage === "Resolved";

  const isClosed =
    case_stage === "Closed";

  const isFinished =
    isResolved || isClosed;

  const progressWidth =
    case_stage === "Open"
      ? "20%"
      : case_stage === "Investigating"
      ? "45%"
      : case_stage === "Matched"
      ? "70%"
      : "100%";

  function formatDateTime(value) {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN");
  }

  function formatDate(value) {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value) {
    if (!value) {
      return "Not provided";
    }

    const parts = String(value).split(":");

    if (parts.length < 2) {
      return String(value);
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return String(value);
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  return (
    <section className="panel detail-panel">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="panel-header">

        <div>

          <span className="section-kicker">
            CASE DETAILS
          </span>

          <h2>
            Case #{case_id}
          </h2>

          <p>
            Filed by {filed_by || "Not provided"}
          </p>

        </div>

        <StatusBadge stage={case_stage} />

      </div>


      {/* =================================================
          CHILD PROFILE
          ================================================= */}

      <div className="child-profile">

        <div className="child-avatar" style={{ overflow: "hidden" }}>
          {photo ? (
            <img
              src={photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`}
              alt={child_name || "Child photo"}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : child_name
            ? child_name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "MC"}
        </div>

        <div>

          <h3>
            {child_name || "Unknown"}
          </h3>

          <p>
            {child_age ?? "Unknown"} years
            {" · "}
            {gender || "Not provided"}
          </p>

        </div>

      </div>


      {/* =================================================
          CASE INFORMATION
          ================================================= */}

      <div className="detail-info">

        <div className="detail-info-item">

          <span>
            Last known location
          </span>

          <strong>
            {last_seen_location ||
              "Not provided"}
          </strong>

        </div>


        <div className="detail-info-item">

          <span>
            Last seen
          </span>

          <strong>
            {formatDateTime(
              last_seen_datetime
            )}
          </strong>

        </div>

      </div>


      {/* =================================================
          REPORT / PARENT DETAILS
          ================================================= */}

      <div className="detail-info" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="detail-info-item"><span>Parent / Guardian</span><strong>{parent_name || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Phone</span><strong>{parent_phone ? <a href={`tel:${parent_phone}`}>{parent_phone}</a> : "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Email</span><strong>{parent_email || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Address</span><strong>{address || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Height</span><strong>{height || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Weight</span><strong>{weight || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Complexion</span><strong>{complexion || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Identifying marks</span><strong>{identifying_marks || "Not provided"}</strong></div>
      </div>

      <div className="detail-info" style={{ gridTemplateColumns: "1fr" }}>
        <div className="detail-info-item"><span>Clothing description</span><strong>{clothing_description || "Not provided"}</strong></div>
        <div className="detail-info-item"><span>Additional information</span><strong>{additional_information || "Not provided"}</strong></div>
      </div>

      {/* =================================================
          FOUND INFORMATION
          ================================================= */}

      {isFinished && found_at && (

        <div className="detail-info found-case-info">

          <div className="detail-info-item">

            <span>
              Found At
            </span>

            <strong>
              {formatDateTime(found_at)}
            </strong>

          </div>

        </div>

      )}


      {/* =================================================
          MATCHED SIGHTINGS
          ================================================= */}

      {loadingMatchedSightings && (

        <div className="matched-sightings">

          <div className="matched-sightings-header">

            <div>

              <span className="section-kicker">
                MATCHED REPORTS
              </span>

              <h3>
                Sighting Reports
              </h3>

            </div>

          </div>

          <p>
            Loading matched reports...
          </p>

        </div>

      )}


      {!loadingMatchedSightings &&
        matchedSightings.length > 0 && (

        <div className="matched-sightings">

          <div className="matched-sightings-header">

            <div>

              <span className="section-kicker">
                MATCHED REPORTS
              </span>

              <h3>
                Sighting Reports
              </h3>

            </div>

            <span className="matched-count">
              {matchedSightings.length}
            </span>

          </div>


          {matchedSightings.map((sighting) => {

            const imageUrl =
              sighting.photo_url
                ? sighting.photo_url.startsWith(
                    "http"
                  )
                  ? sighting.photo_url
                  : `${API_BASE_URL}${sighting.photo_url}`
                : null;

            return (

              <div
                className="matched-sighting-card"
                key={sighting.id}
              >

                {/* ================= IMAGE ================= */}

                {imageUrl ? (

                  <img
                    src={imageUrl}
                    alt="Sighting report"
                    className="matched-sighting-image"
                  />

                ) : (

                  <div className="matched-sighting-image matched-sighting-image-placeholder">
                    No photo
                  </div>

                )}


                {/* ================= CONTENT =============== */}

                <div className="matched-sighting-content">

                  <div className="matched-sighting-top">

                    <strong>
                      Sighting #{sighting.id}
                    </strong>

                    <StatusBadge
                      stage={sighting.status}
                    />

                  </div>


                  <div className="matched-sighting-info">

                    <div>

                      <span>
                        Location
                      </span>

                      <strong>
                        {sighting.location ||
                          "Not provided"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Approx. age
                      </span>

                      <strong>
                        {sighting.approximate_age ||
                          "Not provided"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Gender
                      </span>

                      <strong>
                        {sighting.gender ||
                          "Not provided"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          sighting.sighting_date
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Time
                      </span>

                      <strong>
                        {formatTime(
                          sighting.sighting_time
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* ================= DESCRIPTION =========== */}

                  <div className="matched-sighting-description">

                    <span>
                      Description
                    </span>

                    <p>
                      {sighting.description ||
                        "No description provided."}
                    </p>

                  </div>


                  {/* ================= REPORTER ============== */}

                  {(sighting.reporter_name ||
                    sighting.contact_number) && (

                    <div className="matched-sighting-reporter">

                      <span>
                        Reporter
                      </span>

                      <strong>
                        {sighting.reporter_name ||
                          "Anonymous"}

                        {sighting.contact_number &&
                          ` · ${sighting.contact_number}`}
                      </strong>

                    </div>

                  )}

                </div>

              </div>

            );
          })}

        </div>

      )}


      {!loadingMatchedSightings &&
        matchedSightings.length === 0 && (

        <div className="matched-sightings">

          <div className="matched-sightings-header">

            <div>

              <span className="section-kicker">
                MATCHED REPORTS
              </span>

              <h3>
                Sighting Reports
              </h3>

            </div>

          </div>

          <p>
            No matched sighting reports for this case.
          </p>

        </div>

      )}


      {/* =================================================
          CASE PROGRESS
          ================================================= */}

      <div className="case-progress">

        <span className="case-progress-label">
          Case progress
        </span>

        <div className="progress-track">

          <span
            className="progress-value"
            style={{
              width: progressWidth,
            }}
          />

        </div>

      </div>


      {/* =================================================
          CASE ACTIONS
          ================================================= */}

      <div className="case-actions">

        {/* OPEN → INVESTIGATING */}

        {case_stage === "Open" && (

          <button
            type="button"
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


        {/* INVESTIGATING → MATCHED
            MATCHED → RESOLVED */}

        {!isFinished &&
          case_stage !== "Open" &&
          nextStage && (

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onAdvanceStage(
                case_id,
                nextStage
              )
            }
          >
            Move to {nextStage}
          </button>

        )}


        {/* MARK FOUND */}

        {!isFinished && (

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              onMarkFound(case_id)
            }
          >
            Mark child as found
          </button>

        )}


        {/* RESOLVED → CLOSED */}

        {isResolved && (

          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                onAdvanceStage(
                  case_id,
                  "Closed"
                )
              }
            >
              Close Case
            </button>

            <div className="closed-message">

              ✓ Child marked as found.
              <br />

              This case is resolved. Close the case
              when all required follow-up is complete.

            </div>
          </>

        )}


        {/* DELETE CASE */}

        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDeleteCase(case_id)}
          disabled={!onDeleteCase}
        >
          Delete Case
        </button>


        {/* CLOSED */}

        {isClosed && (

          <div className="closed-message">

            ✓ This case is closed and requires no
            further action.

          </div>

        )}

      </div>

    </section>
  );
}

export default CaseDetailPanel;