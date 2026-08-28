import React from "react";
import "./ContactUs.css";

function ContactUs() {

  // Copy phone number
  const copyPhone = () => {
    navigator.clipboard.writeText("+91 98765 43210");
    alert("Mobile number copied!");
  };

  // Copy email
  const copyEmail = () => {
    navigator.clipboard.writeText("support@missingchildrescue.org");
    alert("Email address copied!");
  };

  return (
    <div className="contact-page">

      <div className="contact-container">

        {/* Page Heading */}

        <div className="contact-header">

          <p className="project-name">
            MISSING CHILD RESCUE NETWORK
          </p>

          <h1>Contact Us</h1>

          <p className="contact-subtitle">
            Reach out to us anytime using the details below.
          </p>

        </div>


        {/* Mobile Number Card */}

        <div className="contact-card">

          <div className="contact-icon">
            📞
          </div>

          <div className="contact-info">

            <p className="contact-label">
              Mobile Number
            </p>

            <h2>
              +91 98765 43210
            </h2>

          </div>

          <button
            className="copy-button"
            onClick={copyPhone}
          >
            Copy
          </button>

        </div>


        {/* Email Card */}

        <div className="contact-card">

          <div className="contact-icon">
            ✉️
          </div>

          <div className="contact-info">

            <p className="contact-label">
              Email Address
            </p>

            <h2>
              support@missingchildrescue.org
            </h2>

          </div>

          <button
            className="copy-button"
            onClick={copyEmail}
          >
            Copy
          </button>

        </div>


        {/* Emergency Helpline */}

        <div className="emergency-card">

          <p className="emergency-title">
            🚨 Emergency Helpline (24/7, Toll Free)
          </p>

          <h2>
            1098
          </h2>

          <p className="emergency-subtitle">
            Always here to help
          </p>

        </div>

      </div>

    </div>
  );
}

export default ContactUs;