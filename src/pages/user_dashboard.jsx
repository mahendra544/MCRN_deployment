import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import Navbar from "../components/navbar";

import "../styles/mcrn.css";
import "../styles/user_dashboard.css";


function UserDashboard() {

  /*
  =========================================================
  DASHBOARD DATA
  =========================================================
  */

  const [dashboard, setDashboard] =
    useState({
      myReports: 0,
      activeCases: 0,
      resolvedCases: 0,
      recentCases: [],
    });


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  /*
  =========================================================
  USER NAME
  =========================================================
  */

  const userName =
    localStorage.getItem("userName") || "User";


  /*
  =========================================================
  FETCH DASHBOARD DATA
  =========================================================
  */

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setLoading(true);
        setError("");


        const response = await fetch(
          "http://localhost:5000/api/dashboard"
        );


        if (!response.ok) {
          throw new Error(
            "Failed to fetch dashboard"
          );
        }


        const result =
          await response.json();


        if (!result.success) {
          throw new Error(
            result.message ||
            "Failed to fetch dashboard"
          );
        }


        setDashboard(result.data);


      } catch (err) {

        console.error(
          "Dashboard error:",
          err
        );


        setError(
          "Unable to load dashboard data."
        );


      } finally {

        setLoading(false);

      }

    };


    fetchDashboard();

  }, []);


  /*
  =========================================================
  FORMAT DATE
  =========================================================
  */

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "Not available";
    }


    const date =
      new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  };


  /*
  =========================================================
  FORMAT NUMBER

  1 -> 01
  8 -> 08
  12 -> 12
  =========================================================
  */

  const formatNumber = (value) => {

    return String(value ?? 0)
      .padStart(2, "0");

  };


  return (

    <div className="user-dashboard">


      {/* =====================================================
          COMMON NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">


        {/* =====================================================
            HERO / WELCOME
        ===================================================== */}

        <section className="dashboard-hero">

          <div className="container dashboard-hero-content">


            <div className="dashboard-hero-text">

              <span className="dashboard-label">
                USER DASHBOARD
              </span>


              <h1>
                Good afternoon,
                <br />
                <span> {userName}</span> 👋
              </h1>


              <p>
                Welcome back. Your contribution
                can help locate missing children
                and bring them safely home.
              </p>


              <div className="hero-buttons">


                <Link
                  to="/report-child"
                  className="dashboard-primary-btn"
                >
                  <span>+</span>

                  Report a Missing Child
                </Link>


                <Link
                  to="/search-children"
                  className="dashboard-outline-btn"
                >
                  <span>⌕</span>

                  Search Missing Children
                </Link>


              </div>

            </div>


            {/* HERO HELP CARD */}

            <div className="hero-help-card">

              <div className="hero-help-icon">
                !
              </div>


              <div>

                <span className="hero-small-title">
                  EVERY REPORT MATTERS
                </span>


                <h3>
                  Help us bring children home.
                </h3>


                <p>
                  If you have information about
                  a missing child, report it
                  through the network.
                </p>

              </div>

            </div>


          </div>

        </section>


        {/* =====================================================
            QUICK ACCESS
        ===================================================== */}

        <section className="dashboard-section">

          <div className="container">


            <div className="section-heading-dashboard">

              <div>

                <span className="dashboard-label">
                  QUICK ACCESS
                </span>


                <h2>
                  What would you like to do?
                </h2>

              </div>


              <p>
                Access the most important
                services quickly.
              </p>

            </div>


            <div className="action-grid">


              {/* SEARCH */}

              <Link
                to="/search-children"
                className="action-card"
              >

                <div className="action-icon">
                  ⌕
                </div>


                <div className="action-card-content">

                  <h3>
                    Search Children
                  </h3>


                  <p>
                    Search active missing child
                    cases by name, age, gender
                    or location.
                  </p>


                  <span className="action-link">
                    Search cases →
                  </span>

                </div>

              </Link>


              {/* REPORT */}

              <Link
                to="/report-child"
                className="action-card action-card-highlight"
              >

                <div className="action-icon">
                  +
                </div>


                <div className="action-card-content">

                  <h3>
                    Report Missing Child
                  </h3>


                  <p>
                    Submit information about a
                    missing child and create a
                    new report.
                  </p>


                  <span className="action-link">
                    Report now →
                  </span>

                </div>

              </Link>


              {/* SIGHTING */}

              <Link
                to="/report-sighting"
                className="action-card action-card-highlight"
              >

                <div className="action-icon">
                  ◉
                </div>


                <div className="action-card-content">

                  <h3>
                    Report a Sighting
                  </h3>


                  <p>
                    Have you seen a missing
                    child? Submit a possible
                    sighting immediately.
                  </p>


                  <span className="action-link">
                    Report sighting →
                  </span>

                </div>
              </Link>

              {/* MY REPORTS */}

              <Link
                to="/about-us"
                className="action-card"
              >

                <div className="action-icon">
                  ▤
                </div>


                <div className="action-card-content">

                  <h3>
                    About Us
                  </h3>


                  <p>
                    To know about the missing child rescue network.
                  </p>


                  <span className="action-link">
                    About Us →
                  </span>

                </div>

              </Link>


            </div>

          </div>
        </section>


        {/* =====================================================
            ACTIVITY STATS
        ===================================================== */}

        <section className="dashboard-section dashboard-section-light">

          <div className="container">


            <div className="section-heading-dashboard">

              <div>

                <span className="dashboard-label">
                  OVERVIEW
                </span>


                <h2>
                  Your Activity
                </h2>

              </div>


              <Link
                to="/my-cases"
                className="dashboard-view-link"
              >
                View all reports →
              </Link>

            </div>


            {/* ERROR */}

            {error && (

              <p
                style={{
                  color: "#e02323",
                  marginBottom: "20px",
                }}
              >
                {error}
              </p>

            )}


            <div className="dashboard-stats-grid">


              {/* MY REPORTS */}

              <Link
                to="/my-cases"
                className="activity-card"
              >

                <div className="activity-icon">
                  ▤
                </div>


                <div>

                  <span className="activity-number">

                    {loading
                      ? "..."
                      : formatNumber(
                          dashboard.myReports
                        )
                    }

                  </span>


                  <p>
                    My Reports
                  </p>

                </div>


                <span className="activity-arrow">
                  →
                </span>

              </Link>


              {/* ACTIVE CASES */}

              <Link
                to="/my-cases"
                className="activity-card"
              >

                <div className="activity-icon active">
                  ◉
                </div>


                <div>

                  <span className="activity-number">

                    {loading
                      ? "..."
                      : formatNumber(
                          dashboard.activeCases
                        )
                    }

                  </span>


                  <p>
                    Active Cases
                  </p>

                </div>


                <span className="activity-arrow">
                  →
                </span>

              </Link>


              {/* RESOLVED CASES */}

              <Link
                to="/my-cases"
                className="activity-card"
              >

                <div className="activity-icon success">
                  ✓
                </div>


                <div>

                  <span className="activity-number">

                    {loading
                      ? "..."
                      : formatNumber(
                          dashboard.resolvedCases
                        )
                    }

                  </span>


                  <p>
                    Resolved Cases
                  </p>

                </div>


                <span className="activity-arrow">
                  →
                </span>

              </Link>


              {/* NOTIFICATIONS */}

              <Link
                to="/notifications"
                className="activity-card"
              >

                <div className="activity-icon notification">
                  ♢
                </div>


                <div>

                  <span className="activity-number">
                    03
                  </span>


                  <p>
                    Notifications
                  </p>

                </div>


                <span className="activity-arrow">
                  →
                </span>

              </Link>


            </div>

          </div>

        </section>


        {/* =====================================================
            RECENT CASES + NOTIFICATIONS
        ===================================================== */}

        <section className="dashboard-section">

          <div className="container">


            <div className="dashboard-two-column">


              {/* =================================================
                  RECENT CASES
              ================================================= */}

              <section className="dashboard-panel">


                <div className="panel-top">

                  <div>

                    <span className="dashboard-label">
                      CASE TRACKING
                    </span>


                    <h2>
                      Recent Reports
                    </h2>


                    <p>
                      View the latest cases
                      available in the system.
                    </p>

                  </div>


                  <Link
                    to="/search-children"
                    className="panel-view-link"
                  >
                    View all →
                  </Link>

                </div>


                <div className="case-list">


                  {/* LOADING */}

                  {loading && (

                    <div
                      style={{
                        padding: "20px",
                        color: "#69707a",
                      }}
                    >
                      Loading recent reports...
                    </div>

                  )}


                  {/* ERROR */}

                  {!loading &&
                    error && (

                    <div
                      style={{
                        padding: "20px",
                        color: "#e02323",
                      }}
                    >
                      Unable to load recent
                      reports.
                    </div>

                  )}


                  {/* NO CASES */}

                  {!loading &&
                    !error &&
                    dashboard.recentCases.length ===
                      0 && (

                    <div
                      style={{
                        padding: "20px",
                        color: "#69707a",
                      }}
                    >
                      No recent cases available.
                    </div>

                  )}


                  {/* DYNAMIC RECENT CASES */}

                  {!loading &&
                    !error &&
                    dashboard.recentCases.map(
                      (child) => (

                        <Link
                          key={child.caseId}
                          to={`/child/${child.caseId}`}
                          className="case-item"
                        >

                          <div className="case-number">

                            MC

                            <span>

                              {String(
                                child.caseId
                              )
                                .replace(
                                  /^MC[-]?/i,
                                  ""
                                )}

                            </span>

                          </div>


                          <div className="case-info">

                            <h3>
                              {child.name}
                            </h3>


                            <p>
                              Reported on{" "}
                              {formatDate(
                                child.dateMissing
                              )}
                            </p>

                          </div>


                          <span
                            className={`case-status ${
                              child.status ===
                              "Missing"
                                ? "pending"
                                : "resolved"
                            }`}
                          >
                            {child.status}
                          </span>


                          <span className="case-arrow">
                            →
                          </span>


                        </Link>

                      )
                    )}


                </div>

              </section>


              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <section className="dashboard-panel notifications-panel">


                <div className="panel-top">

                  <div>

                    <span className="dashboard-label">
                      UPDATES
                    </span>


                    <h2>
                      Notifications
                    </h2>

                  </div>


                  <Link
                    to="/notifications"
                    className="panel-view-link"
                  >
                    View all →
                  </Link>

                </div>


                <div className="notification-list">


                  {/* NOTIFICATION 1 */}

                  <Link
                    to="/notifications"
                    className="dashboard-notification unread"
                  >

                    <div className="notification-icon">
                      ✓
                    </div>


                    <div>

                      <h4>
                        Report verified
                      </h4>


                      <p>
                        A case report has been
                        verified.
                      </p>


                      <span>
                        Recent update
                      </span>

                    </div>

                  </Link>


                  {/* NOTIFICATION 2 */}

                  <Link
                    to="/notifications"
                    className="dashboard-notification"
                  >

                    <div className="notification-icon">
                      ◉
                    </div>


                    <div>

                      <h4>
                        Investigation update
                      </h4>


                      <p>
                        A missing-child case is
                        currently under review.
                      </p>


                      <span>
                        Recent update
                      </span>

                    </div>

                  </Link>


                  {/* NOTIFICATION 3 */}

                  <Link
                    to="/notifications"
                    className="dashboard-notification"
                  >

                    <div className="notification-icon">
                      !
                    </div>


                    <div>

                      <h4>
                        Important update
                      </h4>


                      <p>
                        Please check the latest
                        case information.
                      </p>


                      <span>
                        Recent update
                      </span>

                    </div>

                  </Link>


                </div>

              </section>


            </div>

          </div>

        </section>


        {/* =====================================================
            SAFETY / HELP BANNER
        ===================================================== */}

        <section className="dashboard-section dashboard-section-light">

          <div className="container">


            <div className="help-banner">


              <div className="help-icon">
                !
              </div>


              <div className="help-content">

                <span>
                  NEED IMMEDIATE HELP?
                </span>


                <h2>
                  If you have information about
                  a missing child, report it as
                  soon as possible.
                </h2>


                <p>
                  Every detail may help
                  investigators locate a missing
                  child.
                </p>

              </div>


            </div>

          </div>

        </section>


      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="user-footer">

        <div className="container">


          <div className="footer-main">


            <div className="footer-brand">

              <Link
                to="/user-dashboard"
                className="footer-brand-link"
              >

                <div className="footer-brand-mark">
                  M
                </div>


                <div className="footer-brand-text">

                  <strong>
                    Missing Child
                  </strong>


                  <span>
                    Rescue Network
                  </span>

                </div>

              </Link>

            </div>


            <p>
              Together, we can help bring
              missing children home.
            </p>


          </div>


          <div className="footer-bottom">

            <span>
              © 2026 Missing Child Rescue Network
            </span>


            <div>

              <Link to="/privacy">
                Privacy
              </Link>


              <Link to="/terms">
                Terms
              </Link>


              <Link to="/help">
                Help
              </Link>

            </div>


          </div>


        </div>

      </footer>


    </div>

  );
}


export default UserDashboard;