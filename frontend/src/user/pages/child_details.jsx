import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/navbar";
import "../styles/child_details.css";



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
/* =========================================================
   DEFAULT IMAGE
========================================================= */

const DEFAULT_CHILD_IMAGE =
  "/images/children/default-child.png";


/* =========================================================
   COMPONENT
========================================================= */

function ChildDetails() {

  const { caseId } = useParams();


  /* =======================================================
     STATE
  ======================================================= */

  const [child, setChild] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     GET CHILD FROM BACKEND
     
     GET /api/children/:caseId
  ======================================================= */

  useEffect(() => {

    const fetchChild = async () => {

      try {

        setLoading(true);
        setError("");


        const response = await fetch(
          `${API_BASE_URL}/api/children/${caseId}`
          , {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("mcrn_token") || ""}`,
            },
          }
        );


        if (!response.ok) {

          if (response.status === 404) {

            throw new Error(
              "Case not found"
            );

          }

          throw new Error(
            "Failed to fetch case"
          );

        }


        const result =
          await response.json();


        if (!result.success) {

          throw new Error(
            result.message ||
            "Failed to fetch case"
          );

        }


        setChild(result.data);


      } catch (err) {

        console.error(
          "Get child error:",
          err
        );

        setError(
          err.message ||
          "Unable to load case details."
        );

        setChild(null);


      } finally {

        setLoading(false);

      }

    };


    if (caseId) {
      fetchChild();
    }

  }, [caseId]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="child-details-page">

        <Navbar />

        <main className="child-not-found">

          <div className="child-not-found-icon">
            ...
          </div>

          <span>
            LOADING CASE
          </span>

          <h1>
            Loading case details...
          </h1>

          <p>
            Please wait while we retrieve
            the case information.
          </p>

        </main>

      </div>

    );

  }


  /* =======================================================
     CASE NOT FOUND / ERROR
  ======================================================= */

  if (!child || error) {

    return (

      <div className="child-details-page">

        <Navbar />

        <main className="child-not-found">

          <div className="child-not-found-icon">
            !
          </div>

          <span>
            CASE NOT FOUND
          </span>

          <h1>
            We couldn't find this case.
          </h1>

          <p>
            {error ||
              "The case ID you requested does not match any available case."
            }
          </p>

          <Link
            to="/search-children"
            className="details-primary-btn"
          >
            ← Back to Search
          </Link>

        </main>

      </div>

    );

  }


  /* =======================================================
     JSX
  ======================================================= */

  return (

    <div className="child-details-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="child-details-main">

        <div className="child-details-container">


          {/* =================================================
              BACK LINK
          ================================================= */}

          <Link
            to="/search-children"
            className="details-back-link"
          >
            ← Back to Search
          </Link>


          {/* =================================================
              CASE HEADER
          ================================================= */}

          <section className="case-details-header">

            <div>

              <span className="details-eyebrow">
                MISSING CHILD CASE
              </span>

              <h1>
                {child.name}
              </h1>

              <p>
                Case ID · {child.id}
              </p>

            </div>


            <span
              className={`details-status ${
                child.status === "Missing"
                  ? "missing"
                  : "reunited"
              }`}
            >
              {child.status}
            </span>

          </section>


          {/* =================================================
              DETAILS GRID
          ================================================= */}

          <section className="case-details-grid">


            {/* =================================================
                PHOTO
            ================================================= */}

            <div className="case-photo-panel">

              <div className="case-photo-wrapper">

                <img
                  src={
                    child.photo ||
                    DEFAULT_CHILD_IMAGE
                  }
                  alt={`${child.name} case`}
                  onError={(event) => {

                    event.currentTarget.src =
                      DEFAULT_CHILD_IMAGE;

                  }}
                />

              </div>


              <div className="photo-note">

                <span>
                  CASE PHOTO
                </span>

                <p>
                  This image can be replaced
                  with the official case
                  photograph later.
                </p>

              </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="case-information-panel">

              <div className="details-section-label">
                CASE INFORMATION
              </div>


              <div className="details-info-grid">


                <div className="details-info-item">

                  <span>
                    Child's Name
                  </span>

                  <strong>
                    {child.name}
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Case ID
                  </span>

                  <strong>
                    {child.id}
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Age
                  </span>

                  <strong>
                    {child.age} years
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Gender
                  </span>

                  <strong>
                    {child.gender}
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Last Known Location
                  </span>

                  <strong>
                    {child.location}
                  </strong>

                </div>


                <div className="details-info-item">

                  <span>
                    Date Reported Missing
                  </span>

                  <strong>
                    {child.dateMissing}
                  </strong>

                </div>

              </div>


              {/* =================================================
                  CASE STATUS
              ================================================= */}

              <div className="case-status-box">

                <div className="case-status-icon">
                  !
                </div>

                <div>

                  <span>
                    CURRENT STATUS
                  </span>

                  <strong>
                    {child.status}
                  </strong>

                  <p>

                    {child.status === "Missing"
                      ? "This child is currently listed as missing. Any useful information should be reported to the appropriate authorities."
                      : "This case has been marked as reunited."
                    }

                  </p>

                </div>

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="details-actions">

                <Link
                  to={`/report-sighting?case_id=${encodeURIComponent(caseId)}`}
                  className="details-primary-btn"
                >
                  Report Sighting for This Case
                </Link>

                <Link
                  to="/search-children"
                  className="details-secondary-btn"
                >
                  ← Search Other Cases
                </Link>

              </div>

            </div>

          </section>


          {/* =================================================
              IMPORTANT INFORMATION
          ================================================= */}

          <section className="case-important-section">

            <div className="important-icon">
              !
            </div>

            <div>

              <span>
                IMPORTANT
              </span>

              <h2>
                If you have information about
                this child
              </h2>

              <p>
                Please provide the information
                to the appropriate authorities
                as soon as possible. Even small
                details may help with the
                investigation.
              </p>

            </div>

          </section>

        </div>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="child-details-footer">

        <div className="child-details-container">

          <span>
            © 2026 Missing Child Rescue Network
          </span>

          <Link to="/search-children">
            Search Cases
          </Link>

        </div>

      </footer>

    </div>

  );

}


export default ChildDetails;
