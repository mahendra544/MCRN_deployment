import { useState } from "react";
import "./ReportMissingChild.css";

const initialForm = {
  childName: "",
  age: "",
  gender: "",
  photo: null,
  lastSeenLocation: "",
  lastSeenDate: "",
  lastSeenTime: "",
  description: "",
  clothing: "",
  identificationMarks: "",
  reporterName: "",
  relationship: "",
  phone: "",
  email: "",
  address: ""
};

function ReportMissingChild() {
  const [formData, setFormData] = useState(initialForm);
  const [photoName, setPhotoName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { id, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [id]: value
    }));
    setSubmitted(false);
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (file) {
      setFormData((previous) => ({
        ...previous,
        photo: file
      }));
      setPhotoName(file.name);
      setSubmitted(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    // For now this only demonstrates that the form is working.
    // Later, replace this section with fetch() to send the data
    // to your backend/database.
    console.log("Missing Child Report:", formData);

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setFormData(initialForm);
    setPhotoName("");
    setSubmitted(false);
  }

  return (
    <main className="report-page">
      <div className="container">
        <div className="form-card">

          <p className="eyebrow">Missing Child Rescue Network</p>

          <div className="form-card-header">
            <div className="icon-circle">📋</div>
            <div>
              <h2 >Report Missing Child</h2>
              <p className="muted">
                Please provide accurate information to help authorities locate
                the child quickly.
              </p>
            </div>
          </div>

          <div className="form-note">
            <strong>Important:</strong> Fields marked with <span>*</span> are
            required. Your information should be accurate and complete.
          </div>

          {submitted && (
            <div className="success-message">
              <strong>✓ Report submitted successfully.</strong>
              <br />
              Your report has been recorded for verification.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* CHILD DETAILS */}
            <div className="section-title">
              <span>1</span>
              <div>
                <h3>Child Details</h3>
                <p>Basic information about the missing child.</p>
              </div>
            </div>

            <div className="field-row">
              <div className="field photo-field">
                <label>
                  Child Photo <span className="required-star">*</span>
                </label>

                <label htmlFor="photo" className="upload-box">
                  <span className="upload-icon">⬆</span>
                  <strong>{photoName ? "Change Photo" : "Upload Photo"}</strong>
                  <small>JPG, JPEG or PNG • Max 5 MB</small>
                </label>

                <input
                  id="photo"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                  required
                  hidden
                />

                {photoName && (
                  <div className="photo-file-name">Selected: {photoName}</div>
                )}
              </div>

              <div className="field">
                <label htmlFor="childName">
                  Child Name <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="childName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field small-field">
                <label htmlFor="age">
                  Age <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="age"
                  type="number"
                  min="0"
                  max="17"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="gender">
                  Gender <span className="required-star">*</span>
                </label>
                <select
                  className="select"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="clothing">Clothing at Last Seen</label>
                <input
                  className="input"
                  id="clothing"
                  type="text"
                  placeholder="Example: blue shirt, black trousers"
                  value={formData.clothing}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="identificationMarks">Identification Marks</label>
                <input
                  className="input"
                  id="identificationMarks"
                  type="text"
                  placeholder="Birthmark, scar, etc."
                  value={formData.identificationMarks}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field full-field">
                <label htmlFor="description">
                  Physical Description <span className="required-star">*</span>
                </label>
                <textarea
                  className="textarea"
                  id="description"
                  placeholder="Describe the child's appearance and any other useful identifying information."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* INCIDENT DETAILS */}
            <div className="section-title">
              <span>2</span>
              <div>
                <h3>Last Seen Details</h3>
                <p>Tell us when and where the child was last seen.</p>
              </div>
            </div>

            <div className="field-row">
              <div className="field full-field">
                <label htmlFor="lastSeenLocation">
                  Last Seen Location <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="lastSeenLocation"
                  type="text"
                  placeholder="Enter area, landmark or address"
                  value={formData.lastSeenLocation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="lastSeenDate">
                  Date Last Seen <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="lastSeenDate"
                  type="date"
                  value={formData.lastSeenDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="lastSeenTime">
                  Approximate Time <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="lastSeenTime"
                  type="time"
                  value={formData.lastSeenTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* REPORTER DETAILS */}
            <div className="section-title">
              <span>3</span>
              <div>
                <h3>Parent / Guardian Details</h3>
                <p>Contact information for verification and updates.</p>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="reporterName">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="reporterName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.reporterName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="relationship">
                  Relationship <span className="required-star">*</span>
                </label>
                <select
                  className="select"
                  id="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="phone">
                  Contact Number <span className="required-star">*</span>
                </label>
                <input
                  className="input"
                  id="phone"
                  type="tel"
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email Address</label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field full-field">
                <label htmlFor="address">
                  Contact Address <span className="required-star">*</span>
                </label>
                <textarea
                  className="textarea address-area"
                  id="address"
                  placeholder="Enter your current address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Clear Form
              </button>

              <button type="submit" className="btn btn-primary">
                Submit Missing Child Report
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

export default ReportMissingChild;
