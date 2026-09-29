import React, { useEffect, useState } from "react";
import "./admin-dashboard.css";

function Header({ setSidebarOpen, setActivePage }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const adminData = JSON.parse(
    localStorage.getItem("adminData") || "{}"
  );

  // ==============================
  // GET CASES FROM BACKEND
  // ==============================
  const fetchCases = () => {
    fetch("http://localhost:5000/api/cases")
      .then((res) => res.json())
      .then((data) => {
        const caseData = Array.isArray(data)
          ? data
          : data.cases || [];

        setCases(caseData);

        // ==============================
        // CREATE DYNAMIC NOTIFICATIONS
        // ==============================
        const dynamicNotifications = [];

        caseData.forEach((item) => {
          const caseId = item.case_id || "Unknown Case";
          const childName = item.child_name || "Unknown Child";
          const status = item.status || "Pending Verification";
          const priority = item.priority || "Medium";

          // Pending verification
          if (
            status === "Pending Verification" ||
            status === "Pending"
          ) {
            dynamicNotifications.push({
              id: `verification-${item.id}`,
              type: "verification",
              title: "New Case Report",
              message: `${caseId} - ${childName} requires verification.`,
              time: "Recent",
            });
          }

          // High priority case
          if (priority.toLowerCase() === "high") {
            dynamicNotifications.push({
              id: `priority-${item.id}`,
              type: "priority",
              title: "High Priority Case",
              message: `${caseId} - ${childName} is marked as high priority.`,
              time: "Recent",
            });
          }

          // Investigation
          if (status === "Investigation") {
            dynamicNotifications.push({
              id: `investigation-${item.id}`,
              type: "investigation",
              title: "Investigation Update",
              message: `${caseId} - Investigation is in progress.`,
              time: "Recent",
            });
          }

          // Child located
          if (status === "Child Located") {
            dynamicNotifications.push({
              id: `located-${item.id}`,
              type: "success",
              title: "Child Located",
              message: `${caseId} - ${childName} has been located.`,
              time: "Recent",
            });
          }

          // Resolved
          if (status === "Resolved") {
            dynamicNotifications.push({
              id: `resolved-${item.id}`,
              type: "success",
              title: "Case Resolved",
              message: `${caseId} - ${childName}'s case has been resolved.`,
              time: "Recent",
            });
          }
        });

        setNotifications(dynamicNotifications);
      })
      .catch((error) => {
        console.error(
          "Error fetching cases:",
          error
        );
      });
  };

  // ==============================
  // LOAD CASES
  // ==============================
  useEffect(() => {
    fetchCases();

    const interval = setInterval(() => {
      fetchCases();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // SEARCH
  // ==============================
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchValue = value
      .toLowerCase()
      .trim();

    const results = cases.filter((item) => {
      const caseId = String(
        item.case_id || ""
      ).toLowerCase();

      const childName = String(
        item.child_name || ""
      ).toLowerCase();

      const location = String(
        item.location || ""
      ).toLowerCase();

      return (
        caseId.includes(searchValue) ||
        childName.includes(searchValue) ||
        location.includes(searchValue)
      );
    });

    setSearchResults(results);
    setShowResults(true);
  };

  // ==============================
  // OPEN SEARCHED CASE
  // ==============================
  const openSearchedCase = (item) => {
    // Save the selected case
    localStorage.setItem(
      "selectedCaseId",
      item.case_id || item.id
    );

    // Open Case Management module
    setActivePage("cases");

    // Close search
    setSearch("");
    setSearchResults([]);
    setShowResults(false);

    // Close notifications if open
    setShowNotifications(false);
  };

  // ==============================
  // OPEN ADMIN PROFILE
  // ==============================
  const openAdminProfile = () => {
    setActivePage("profile");
    setShowNotifications(false);
    setShowResults(false);
  };

  return (
    <>
      <header className="admin-header">

        {/* MOBILE MENU */}
        <button
          className="mobile-menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          ☰
        </button>

        {/* SEARCH */}
        <div className="header-search-container">

          <div className="header-search">

            <span>🔍</span>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => {
                if (search.trim()) {
                  setShowResults(true);
                }
              }}
              placeholder="Search case ID, child name, location..."
            />

          </div>

          {/* SEARCH RESULTS */}
          {showResults &&
            search.trim() && (

              <div className="search-results">

                {searchResults.length > 0 ? (

                  searchResults.map((item) => (

                    <div
                      className="search-result-item"
                      key={item.id}
                      onClick={() =>
                        openSearchedCase(item)
                      }
                    >

                      <div>

                        <strong>
                          {item.case_id ||
                            "No Case ID"}
                        </strong>

                        <p>
                          {item.child_name ||
                            "Unknown Child"}
                        </p>

                        <small>
                          📍{" "}
                          {item.location ||
                            "Location not available"}
                        </small>

                      </div>

                      <span className="search-status">
                        {item.status ||
                          "Pending"}
                      </span>

                    </div>

                  ))

                ) : (

                  <div className="no-search-results">
                    No matching case found
                  </div>

                )}

              </div>
            )}

        </div>

        {/* RIGHT SIDE */}
        <div className="header-right">

          {/* NOTIFICATIONS */}
          <div className="notification-container">

            <button
              className="notification-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >
              🔔

              {/* DYNAMIC COUNT */}
              {notifications.length > 0 && (
                <span className="notification-count">
                  {notifications.length}
                </span>
              )}

            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (

              <div className="notification-dropdown">

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding: "0 5px",
                  }}
                >

                  <h3>
                    Notifications
                  </h3>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    {notifications.length} alerts
                  </span>

                </div>

                {notifications.length > 0 ? (

                  notifications.map(
                    (notification) => (

                      <div
                        className="notification-item"
                        key={notification.id}
                      >

                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <small>
                          {notification.time}
                        </small>

                      </div>

                    )
                  )

                ) : (

                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    No new notifications
                  </div>

                )}

              </div>

            )}

          </div>

          <div className="header-line"></div>

          {/* ADMIN PROFILE */}
          <div
            className="header-admin"
            onClick={openAdminProfile}
            style={{
              cursor: "pointer",
            }}
          >

            <div className="profile-avatar">

              {adminData.name
                ? adminData.name
                    .charAt(0)
                    .toUpperCase()
                : "A"}

            </div>

            <div>

              <strong>
                {adminData.name ||
                  "Admin"}
              </strong>

              <span>
                {adminData.role ||
                  "Administrator"}
              </span>

            </div>

            <span>⌄</span>

          </div>

        </div>

      </header>

      {/* SEARCH CSS */}
      <style>{`

        .header-search-container {
          position: relative;
          width: 360px;
        }

        .header-search {
          width: 100%;
        }

        .header-search input {
          width: 100%;
          box-sizing: border-box;
        }

        .search-results {
          position: absolute;
          top: 48px;
          left: 0;
          width: 100%;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 350px;
          overflow-y: auto;
        }

        .search-result-item {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .search-result-item:hover {
          background: #fef2f2;
        }

        .search-result-item strong {
          color: #e02323;
          font-size: 14px;
        }

        .search-result-item p {
          margin: 4px 0;
          font-size: 14px;
          color: #333;
        }

        .search-result-item small {
          color: #777;
        }

        .search-status {
          font-size: 12px;
          padding: 5px 8px;
          border-radius: 12px;
          background: #fef2f2;
          color: #e02323;
        }

        .no-search-results {
          padding: 18px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }

      `}</style>
    </>
  );
}

export default Header;