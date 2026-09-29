import React, { useState } from "react";

function AdminProfile() {
  const adminData = JSON.parse(
    localStorage.getItem("adminData") || "{}"
  );

  const adminName = adminData.name || "Admin";
  const adminEmail =
    adminData.email ||
    localStorage.getItem("adminEmail") ||
    "admin@gmail.com";

  const adminRole = adminData.role || "Administrator";
  const adminPhone = adminData.phone || "Not available";
  const adminStatus = adminData.status || "Active";

  // Dynamic last login
  const savedLoginTime = localStorage.getItem("adminLastLogin");

  const lastLogin = savedLoginTime
    ? new Date(savedLoginTime).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "First login";

  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must contain at least 6 characters.");
      return;
    }

    alert("Password change request submitted.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
  };

  return (
    <>
      <style>{`

        .admin-profile-page {
          width: 100%;
          min-height: calc(100vh - 70px);
          background: #f6f7f9;
          padding: 30px 34px;
          box-sizing: border-box;
        }

        .admin-profile-heading {
          margin-bottom: 25px;
        }

        .admin-profile-heading h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          color: #171717;
        }

        .admin-profile-heading p {
          margin: 7px 0 0;
          color: #777;
          font-size: 15px;
        }

        .admin-profile-container {
          display: grid;
          grid-template-columns: minmax(500px, 1fr) 350px;
          gap: 24px;
          max-width: 1100px;
        }

        .admin-profile-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e8e8e8;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .profile-cover {
          height: 85px;
          background: linear-gradient(
            135deg,
            #e91b1b,
            #e91d1d
          );
        }

        .profile-main {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 28px;
          margin-top: -38px;
        }

        .admin-profile-avatar {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #ffffff;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);

          display: flex;
          align-items: center;
          justify-content: center;

          color: #e02323;
          font-size: 30px;
          font-weight: 700;
        }

        .profile-name-section {
          padding-top: 30px;
        }

        .profile-name-section h2 {
          margin: 0;
          color: #171717;
          font-size: 25px;
        }

        .profile-name-section p {
          margin: 4px 0 8px;
          color: #777;
          font-size: 14px;
        }

        .profile-active-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          background: #ecfdf3;
          color: #16803c;
          font-size: 15px;
          font-weight: 600;
        }

        .profile-active-status span {
          font-size: 12px;
        }

        .profile-divider {
          height: 1px;
          background: #eeeeee;
          margin: 28px;
        }

        .profile-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 0 28px 30px;
        }

        .profile-detail {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border-radius: 10px;
          background: #fafafa;
          border: 1px solid #eeeeee;
        }

        .detail-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #fff1f1;
          color: #e02323;
          font-size: 20px;
        }

        .profile-detail div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profile-detail span {
          color: #888;
          font-size: 13px;
        }

        .profile-detail strong {
          color: #222;
          font-size: 15px;
        }

        .status-text {
          color: #16803c !important;
        }

        .account-info-card {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 24px;
          height: fit-content;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .account-info-header {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 22px;
        }

        .account-info-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #fff1f1;
          font-size: 25px;
        }

        .account-info-header h3 {
          margin: 0;
          color: #222;
          font-size: 20px;
        }

        .account-info-header p {
          margin: 4px 0 0;
          color: #888;
          font-size: 15px;
        }

        .account-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 16px 0;
          border-top: 1px solid #eeeeee;

          font-size: 17px;
        }

        .account-row span:first-child {
          color: #777;
        }

        .account-row strong {
          color: #222;
          font-size: 17px;
        }

        .active-badge {
          background: #ecfdf3;
          color: #16803c !important;

          padding: 5px 10px;
          border-radius: 20px;

          font-size: 11px !important;
          font-weight: 600;
        }

        .profile-lower-section {
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 24px;
        }

        .security-card {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .section-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #fff1f1;
          font-size: 20px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
          color: #222;
        }

        .section-header p {
          margin: 4px 0 0;
          color: #888;
          font-size: 14px;
        }

        .security-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 15px 0;
          border-top: 1px solid #eeeeee;
        }

        .security-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .security-label span {
          color: #777;
          font-size: 14px;
        }

        .security-label strong {
          color: #222;
          font-size: 15px;
        }

        .password-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .password-display strong {
          min-width: 105px;
        }

        .eye-button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
        }

        .change-button {
          border: none;
          background: #fff1f1;
          color: #e02323;
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .change-button:hover {
          background: #ffe0e0;
        }

        .password-form {
          margin-top: 15px;
          padding: 18px;
          background: #fafafa;
          border: 1px solid #eeeeee;
          border-radius: 10px;
        }

        .password-form h4 {
          margin: 0 0 15px;
          color: #222;
          font-size: 16px;
        }

        .password-field {
          position: relative;
          margin-bottom: 12px;
        }

        .password-field input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 42px 11px 12px;
          border: 1px solid #ddd;
          border-radius: 7px;
          outline: none;
          font-size: 14px;
        }

        .password-field input:focus {
          border-color: #e02323;
        }

        .password-field button {
          position: absolute;
          right: 8px;
          top: 7px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 17px;
        }

        .password-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .save-password-button {
          border: none;
          background: #e02323;
          color: white;
          padding: 9px 14px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-password-button {
          border: 1px solid #ddd;
          background: white;
          color: #555;
          padding: 9px 14px;
          border-radius: 7px;
          cursor: pointer;
        }

        .two-factor-disabled {
          background: #fff7ed;
          color: #c2410c;
          padding: 5px 9px;
          border-radius: 15px;
          font-size: 10px;
          font-weight: 600;
        }

        .activity-card {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid #eeeeee;
        }

        .activity-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #ecfdf3;
          color: #16803c;
          font-size: 13px;
        }

        .activity-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .activity-content strong {
          color: #333;
          font-size: 14px;
          font-weight: 600;
        }

        .activity-content span {
          color: #999;
          font-size: 13px;
        }

        @media (max-width: 1000px) {
          .admin-profile-container {
            grid-template-columns: 1fr;
          }

          .profile-lower-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .admin-profile-page {
            padding: 20px;
          }

          .profile-details {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      <div className="admin-profile-page">

        <div className="admin-profile-heading">
          <h1>Admin Profile</h1>
          <p>
            Manage your administrator account information
          </p>
        </div>

        <div className="admin-profile-container">

          {/* PROFILE */}

          <div className="admin-profile-card">

            <div className="profile-cover"></div>

            <div className="profile-main">

              <div className="admin-profile-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-name-section">

                <h2>{adminName}</h2>

                <p>{adminRole}</p>

                <span className="profile-active-status">
                  <span>●</span> {adminStatus}
                </span>

              </div>

            </div>

            <div className="profile-divider"></div>

            <div className="profile-details">

              <div className="profile-detail">
                <div className="detail-icon">👤</div>

                <div>
                  <span>Full Name</span>
                  <strong>{adminName}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="detail-icon">✉</div>

                <div>
                  <span>Email Address</span>
                  <strong>{adminEmail}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="detail-icon">🛡</div>

                <div>
                  <span>Role</span>
                  <strong>{adminRole}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="detail-icon">📞</div>

                <div>
                  <span>Phone Number</span>
                  <strong>{adminPhone}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="detail-icon">✓</div>

                <div>
                  <span>Account Status</span>

                  <strong className="status-text">
                    {adminStatus}
                  </strong>
                </div>
              </div>

            </div>

          </div>

          {/* ACCOUNT INFORMATION */}

          <div className="account-info-card">

            <div className="account-info-header">

              <div className="account-info-icon">
                🔐
              </div>

              <div>
                <h3>Account Information</h3>
                <p>Administrator account details</p>
              </div>

            </div>

            <div className="account-row">
              <span>Account Type</span>
              <strong>Admin Account</strong>
            </div>

            <div className="account-row">
              <span>Access Level</span>

              <strong>
                {adminRole === "Super Administrator"
                  ? "Full Access"
                  : "Administrator Access"}
              </strong>
            </div>

            <div className="account-row">
              <span>Account Status</span>

              <span className="active-badge">
                {adminStatus}
              </span>
            </div>

          </div>

        </div>

        {/* SECURITY + ACTIVITY */}

        <div className="profile-lower-section">

          {/* SECURITY */}

          <div className="security-card">

            <div className="section-header">

              <div className="section-icon">
                🔒
              </div>

              <div>
                <h3>Security</h3>
                <p>Manage account security</p>
              </div>

            </div>

            {/* LAST LOGIN */}

            <div className="security-row">

              <div className="security-label">

                <span>Last Login</span>

                <strong>
                  {lastLogin}
                </strong>

              </div>

            </div>

            {/* PASSWORD */}

            <div className="security-row">

              <div className="security-label">

                <span>Password</span>

                <div className="password-display">

                  <strong>
                    {showPassword
                      ? "admin123"
                      : "••••••••••"}
                  </strong>

                  <button
                    className="eye-button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>

                </div>

              </div>

              <button
                className="change-button"
                onClick={() =>
                  setShowChangePassword(
                    !showChangePassword
                  )
                }
              >
                {showChangePassword
                  ? "Close"
                  : "Change"}
              </button>

            </div>

            {/* CHANGE PASSWORD */}

            {showChangePassword && (

              <div className="password-form">

                <h4>Change Password</h4>

                <div className="password-field">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

                <div className="password-field">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

                <div className="password-field">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

                <div className="password-actions">

                  <button
                    className="save-password-button"
                    onClick={handleChangePassword}
                  >
                    Save Password
                  </button>

                  <button
                    className="cancel-password-button"
                    onClick={() => {

                      setShowChangePassword(false);

                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");

                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

            {/* TWO FACTOR */}

            <div className="security-row">

              <div className="security-label">

                <span>
                  Two-Factor Authentication
                </span>

                <strong>
                  Additional account protection
                </strong>

              </div>

              <span className="two-factor-disabled">
                Disabled
              </span>

            </div>

          </div>

          {/* RECENT ACTIVITY */}

          <div className="activity-card">

            <div className="section-header">

              <div className="section-icon">
                📋
              </div>

              <div>

                <h3>
                  Recent Admin Activity
                </h3>

                <p>
                  Latest activity by {adminName}
                </p>

              </div>

            </div>

            <div className="activity-item">

              <div className="activity-icon">
                ✓
              </div>

              <div className="activity-content">

                <strong>
                  {adminName} logged in
                </strong>

                <span>
                  {lastLogin}
                </span>

              </div>

            </div>

            <div className="activity-item">

              <div className="activity-icon">
                ✓
              </div>

              <div className="activity-content">

                <strong>
                  {adminName} opened Admin Profile
                </strong>

                <span>
                  Just now
                </span>

              </div>

            </div>

            <div className="activity-item">

              <div className="activity-icon">
                ✓
              </div>

              <div className="activity-content">

                <strong>
                  {adminName} viewed account security
                </strong>

                <span>
                  Just now
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default AdminProfile;