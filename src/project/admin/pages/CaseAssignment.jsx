import React from "react";

function CaseAssignment() {

  return (

    <div>

      <div className="page-title">

        <div>

          <span className="section-label">
            CASE OPERATIONS
          </span>

          <h1>
            Case Assignment
          </h1>

          <p>
            Assign verified cases to police officers.
          </p>

        </div>

      </div>


      <div className="assignment-grid">

        <div className="dashboard-card">

          <h2>
            Assign Case
          </h2>

          <p className="card-description">
            Select the case, police station and officer.
          </p>


          <form className="assignment-form">

            <label>
              Select Case
            </label>

            <select>
              <option>
                Select a case
              </option>
              <option>
                MCN-003 — Arjun Sai
              </option>
              <option>
                MCN-006 — Pooja
              </option>
            </select>


            <label>
              Police Station
            </label>

            <select>
              <option>
                Select station
              </option>
              <option>
                MVP Colony Police Station
              </option>
              <option>
                Guntur Police Station
              </option>
              <option>
                Kakinada Police Station
              </option>
            </select>


            <label>
              Police Officer
            </label>

            <select>
              <option>
                Select officer
              </option>
              <option>
                Ravi Kumar
              </option>
              <option>
                Sita Devi
              </option>
              <option>
                Arun Kumar
              </option>
            </select>


            <label>
              Investigation Deadline
            </label>

            <input
              type="date"
            />


            <button
              type="submit"
              className="primary-button"
            >
              Assign Case →
            </button>

          </form>

        </div>


        <div className="dashboard-card">

          <h2>
            Assignment Workflow
          </h2>

          <div className="workflow">

            <div>
              <span>01</span>
              <section>
                <strong>
                  Verify Case
                </strong>

                <p>
                  Admin confirms the report.
                </p>
              </section>
            </div>


            <div>
              <span>02</span>
              <section>
                <strong>
                  Set Priority
                </strong>

                <p>
                  Assign High, Medium or Low priority.
                </p>
              </section>
            </div>


            <div>
              <span>03</span>
              <section>
                <strong>
                  Assign Officer
                </strong>

                <p>
                  Select police station and officer.
                </p>
              </section>
            </div>


            <div>
              <span>04</span>
              <section>
                <strong>
                  Monitor Investigation
                </strong>

                <p>
                  Track police investigation updates.
                </p>
              </section>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CaseAssignment;