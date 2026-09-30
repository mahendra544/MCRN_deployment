import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";

import "../styles/mcrn.css";
import "../styles/search_children.css";


/* =========================================================
   DEFAULT CHILD PHOTO
========================================================= */

const DEFAULT_CHILD_IMAGE = "/images/default-child.jpg";


/* =========================================================
   QUICK SEARCH TABS
========================================================= */

const searchTabs = [
  "All Cases",
  "Missing",
  "Recently Sighted",
  "Reunited",
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

function SearchChildren() {

  /* =======================================================
     CHILDREN DATA FROM BACKEND
  ======================================================= */

  const [children, setChildren] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =======================================================
     SEARCH
  ======================================================= */

  const [searchTerm, setSearchTerm] = useState("");


  /* =======================================================
     QUICK TAB
  ======================================================= */

  const [activeTab, setActiveTab] =
    useState("All Cases");


  /* =======================================================
     FILTERS
  ======================================================= */

  const [filters, setFilters] = useState({
    age: "",
    gender: "",
    location: "",
    status: "",
  });


  /* =======================================================
     FETCH CHILDREN FROM BACKEND
  ======================================================= */

  const fetchChildren = async () => {

    try {

      setLoading(true);
      setError("");

      const params = new URLSearchParams();


      /* SEARCH */

      if (searchTerm.trim() !== "") {
        params.append(
          "search",
          searchTerm.trim()
        );
      }


      /* AGE */

      if (filters.age !== "") {
        params.append(
          "age",
          filters.age
        );
      }


      /* GENDER */

      if (filters.gender !== "") {
        params.append(
          "gender",
          filters.gender
        );
      }


      /* LOCATION */

      if (filters.location.trim() !== "") {
        params.append(
          "location",
          filters.location.trim()
        );
      }


      /* STATUS */

      if (filters.status !== "") {
        params.append(
          "status",
          filters.status
        );
      }


      /* RECENTLY SIGHTED */

      if (activeTab === "Recently Sighted") {
        params.append(
          "sighted",
          "true"
        );
      }


      /* MISSING TAB */

      if (activeTab === "Missing") {
        params.append(
          "status",
          "Missing"
        );
      }


      /* REUNITED TAB */

      if (activeTab === "Reunited") {
        params.append(
          "status",
          "Reunited"
        );
      }


      const queryString =
        params.toString();


      const response = await fetch(
        `http://localhost:5000/api/children${
          queryString
            ? `?${queryString}`
            : ""
        }`
      );


      if (!response.ok) {
        throw new Error(
          "Failed to fetch children"
        );
      }


      const result =
        await response.json();


      if (!result.success) {
        throw new Error(
          result.message ||
          "Failed to fetch children"
        );
      }


      setChildren(result.data || []);

    } catch (err) {

      console.error(
        "Search children error:",
        err
      );

      setError(
        "Unable to load children data. Please make sure the backend server is running."
      );

      setChildren([]);

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     LOAD CHILDREN

     Runs whenever search/filter/tab changes
  ======================================================= */

  useEffect(() => {

    fetchChildren();

  }, [
    searchTerm,
    filters,
    activeTab,
  ]);


  /* =======================================================
     UPDATE FILTER
  ======================================================= */

  const updateFilter = (
    name,
    value
  ) => {

    setFilters(
      (previousFilters) => ({
        ...previousFilters,
        [name]: value,
      })
    );

  };


  /* =======================================================
     CLEAR ALL FILTERS
  ======================================================= */

  const clearFilters = () => {

    setSearchTerm("");

    setActiveTab("All Cases");

    setFilters({
      age: "",
      gender: "",
      location: "",
      status: "",
    });

  };


  /* =======================================================
     HANDLE QUICK TAB
  ======================================================= */

  const handleTabChange = (tab) => {

    setActiveTab(tab);

  };


  /* =======================================================
     SCROLL TO RESULTS
  ======================================================= */

  const scrollToResults = () => {

    document
      .getElementById(
        "search-results"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  };


  /* =======================================================
     JSX
  ======================================================= */

  return (

    <div className="search-page">

      {/* =================================================
          COMMON NAVBAR
      ================================================= */}

      <Navbar />


      {/* =================================================
          SEARCH HERO
      ================================================= */}

      <section className="search-hero">

        <div className="search-hero-content">

          <span className="search-eyebrow">
            SEARCH CASES
          </span>


          <h1>
            Find the Child{" "}
            <span>
              You're Looking For
            </span>
          </h1>


          <p>
            Search reported missing-child
            cases by name, case ID, age,
            gender or location.
          </p>


          {/* SEARCH BAR */}

          <div className="hero-search-box">

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key === "Enter"
                ) {
                  scrollToResults();
                }

              }}
              placeholder="Enter child's name, case ID, city or location..."
              aria-label="Search missing children"
            />


            <button
              type="button"
              onClick={scrollToResults}
            >
              Search Cases
            </button>

          </div>


          {/* QUICK SEARCH TABS */}

          <div className="search-tabs">

            {searchTabs.map(
              (tab) => (

                <button
                  key={tab}
                  type="button"
                  className={
                    activeTab === tab
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleTabChange(
                      tab
                    )
                  }
                >
                  {tab}
                </button>

              )
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          SEARCH CONTENT
      ================================================= */}

      <main
        className="search-main"
        id="search-results"
      >

        <div className="search-container">

          <div className="search-layout">


            {/* =================================================
                LEFT FILTER SIDEBAR
            ================================================= */}

            <aside className="filter-sidebar">

              <div className="filter-sidebar-header">

                <div>

                  <span>
                    REFINE SEARCH
                  </span>

                  <h2>
                    Filters
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear All
                </button>

              </div>


              {/* AGE */}

              <div className="filter-item">

                <label htmlFor="age">
                  Age
                </label>

                <select
                  id="age"
                  value={filters.age}
                  onChange={(event) =>
                    updateFilter(
                      "age",
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    All Ages
                  </option>

                  {Array.from(
                    { length: 18 },
                    (_, index) => {

                      const age =
                        index + 1;

                      return (

                        <option
                          key={age}
                          value={age}
                        >
                          {age} years
                        </option>

                      );

                    }
                  )}

                </select>

              </div>


              {/* GENDER */}

              <div className="filter-item">

                <label htmlFor="gender">
                  Gender
                </label>

                <select
                  id="gender"
                  value={filters.gender}
                  onChange={(event) =>
                    updateFilter(
                      "gender",
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    All Genders
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                </select>

              </div>


              {/* LOCATION */}

              <div className="filter-item">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={filters.location}
                  onChange={(event) =>
                    updateFilter(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="City or state"
                />

              </div>


              {/* STATUS */}

              <div className="filter-item">

                <label htmlFor="status">
                  Case Status
                </label>

                <select
                  id="status"
                  value={filters.status}
                  onChange={(event) =>
                    updateFilter(
                      "status",
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    All Status
                  </option>

                  <option value="Missing">
                    Missing
                  </option>

                  <option value="Reunited">
                    Reunited
                  </option>

                </select>

              </div>


              {/* APPLY FILTER */}

              <button
                type="button"
                className="apply-filter-btn"
                onClick={scrollToResults}
              >
                Apply Filters
              </button>


              {/* ACTIVE FILTER SUMMARY */}

              {(filters.age ||
                filters.gender ||
                filters.location ||
                filters.status) && (

                <div className="active-filter-box">

                  <span>
                    ACTIVE FILTERS
                  </span>


                  {filters.age && (

                    <small>
                      Age: {filters.age}
                    </small>

                  )}


                  {filters.gender && (

                    <small>
                      Gender: {filters.gender}
                    </small>

                  )}


                  {filters.location && (

                    <small>
                      Location: {
                        filters.location
                      }
                    </small>

                  )}


                  {filters.status && (

                    <small>
                      Status: {
                        filters.status
                      }
                    </small>

                  )}

                </div>

              )}

            </aside>


            {/* =================================================
                RESULTS
            ================================================= */}

            <section className="results-section">

              <div className="results-header">

                <div>

                  <span>
                    SEARCH RESULTS
                  </span>

                  <h2>

                    {loading
                      ? "Loading..."
                      : `${children.length} ${
                          children.length === 1
                            ? "Case"
                            : "Cases"
                        } Found`
                    }

                  </h2>

                </div>


                <div className="results-view">

                  <span>
                    Showing
                  </span>

                  <strong>
                    {activeTab}
                  </strong>

                </div>

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (

                <div className="no-results">

                  <div className="no-results-icon">
                    ⚠️
                  </div>

                  <h3>
                    Unable to load cases
                  </h3>

                  <p>
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchChildren}
                  >
                    Try Again
                  </button>

                </div>

              )}


              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && !error && (

                <div className="no-results">

                  <div className="no-results-icon">
                    ⏳
                  </div>

                  <h3>
                    Loading cases...
                  </h3>

                  <p>
                    Fetching missing-child
                    cases from the database.
                  </p>

                </div>

              )}


              {/* =================================================
                  CHILDREN
              ================================================= */}

              {!loading &&
                !error &&
                children.length > 0 && (

                <div className="children-grid">

                  {children.map(
                    (child) => (

                      <article
                        className="child-card"
                        key={child.id}
                      >

                        {/* CARD TOP */}

                        <div className="child-card-top">

                          {/* PHOTO */}

                          <div className="child-photo-wrapper">

                            <img
                              className="child-photo"
                              src={
                                child.photo ||
                                DEFAULT_CHILD_IMAGE
                              }
                              alt="Missing child"
                              onError={(event) => {

                                event.currentTarget.src =
                                  DEFAULT_CHILD_IMAGE;

                              }}
                            />

                          </div>


                          {/* STATUS */}

                          <span
                            className={`status-badge ${
                              child.status ===
                              "Missing"
                                ? "missing"
                                : "reunited"
                            }`}
                          >
                            {child.status}
                          </span>

                        </div>


                        {/* CARD BODY */}

                        <div className="child-card-body">

                          <span className="case-id">
                            CASE ID · {child.id}
                          </span>


                          <h3>
                            {child.name}
                          </h3>


                          {/* CHILD INFO */}

                          <div className="child-info">

                            <div>

                              <small>
                                Age
                              </small>

                              <strong>
                                {child.age} years
                              </strong>

                            </div>


                            <div>

                              <small>
                                Gender
                              </small>

                              <strong>
                                {child.gender}
                              </strong>

                            </div>

                          </div>


                          {/* LOCATION */}

                          <div className="child-location">

                            <span className="location-dot">
                              ●
                            </span>

                            <div>

                              <small>
                                Last known location
                              </small>

                              <strong>
                                {child.location}
                              </strong>

                            </div>

                          </div>


                          {/* CARD FOOTER */}

                          <div className="card-footer">

                            <small>
                              Reported{" "}
                              {child.dateMissing}
                            </small>


                            <Link
                              to={`/child/${child.id}`}
                            >
                              View Case →
                            </Link>

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              )}


              {/* =================================================
                  NO RESULTS
              ================================================= */}

              {!loading &&
                !error &&
                children.length === 0 && (

                <div className="no-results">

                  <div className="no-results-icon">
                    🔍
                  </div>

                  <h3>
                    No matching cases found
                  </h3>

                  <p>
                    Try changing your search
                    or filters to find more
                    cases.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Search
                  </button>

                </div>

              )}

            </section>

          </div>

        </div>

      </main>


      {/* =================================================
          HELP SECTION
      ================================================= */}

      <section className="search-help">

        <div className="search-container">

          <div className="search-help-box">

            <div>

              <span>
                HAVE YOU SEEN A CHILD?
              </span>

              <h2>
                Your information could help
                bring them home.
              </h2>

              <p>
                If you have information about
                a missing child, please report
                it immediately.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}


export default SearchChildren;