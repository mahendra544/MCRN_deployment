import { useState } from "react";
import Navbar from "../components/navbar";
import "../styles/ReportMissingChild.css";
import "../components/animations.css";

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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = new FormData();

      // Child details
      data.append("child_name", formData.childName);
      data.append("age", formData.age);
      data.append("gender", formData.gender);

      // Last seen details
      data.append("last_seen_location", formData.lastSeenLocation);
      data.append("date_missing", formData.lastSeenDate);
      data.append("time_missing", formData.lastSeenTime);

      // Child description
      data.append("identifying_marks", formData.identificationMarks);
      data.append("clothing_description", formData.clothing);
      data.append("additional_information", formData.description);

      // Parent / guardian details
      data.append("parent_name", formData.reporterName);
      data.append("parent_phone", formData.phone);
      data.append("parent_email", formData.email);
      data.append("address", formData.address);

      // Photo
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const response = await fetch(
        "http://localhost:5000/api/report-child",
        {
          method: "POST",
          body: data
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit report"
        );
      }

      console.log("Report submitted:", result);

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit the report. Please try again.");
    }
  }

  function handleReset() {
    setFormData(initialForm);
    setPhotoName("");
    setSubmitted(false);
  }

  return (
    <>
      <Navbar />

      <main
        className="report-page"
        style={{
          animation: "riseIn 800ms var(--ease) both"
        }}
      >

        <div className="container">

          <div
            className="form-card"
            style={{
              animation: "riseIn 800ms var(--ease) 100ms both"
            }}
          >

            {/* HEADER */}

            <p className="eyebrow">
              🛡️ Missing Child Rescue Network
            </p>

            <div
              className="form-card-header"
              style={{
                animation: "riseIn 600ms var(--ease) 150ms both"
              }}
            >

              <div className="icon-circle">
                📋
              </div>

              <div>
                <h2>
                  Report Missing Child
                </h2>

                <p className="muted">
                  Please provide accurate information to help authorities locate
                  the child quickly.
                </p>
              </div>

            </div>


            {/* IMPORTANT NOTE */}

            <div
              className="form-note"
              style={{
                animation: "softScale 600ms var(--ease) 250ms both"
              }}
            >
              <strong>⚠️ Important:</strong> Fields marked with{" "}
              <span>*</span> are required. Your information should be accurate
              and complete.
            </div>


            {/* SUCCESS MESSAGE */}

            {submitted && (
              <div
                className="success-message"
                style={{
                  animation: "softScale 500ms var(--ease) both"
                }}
              >
                <strong>
                  ✓ Report submitted successfully.
                </strong>

                <br />

                Your report has been recorded for verification.
              </div>
            )}


            <form onSubmit={handleSubmit}>

              {/* =====================================================
                  CHILD DETAILS
                  ===================================================== */}

              <div
                className="section-title"
                style={{
                  animation: "riseIn 600ms var(--ease) 300ms both"
                }}
              >

                <span>1</span>

                <div>
                  <h3>
                    👦 Child Details
                  </h3>

                  <p>
                    Basic information about the missing child.
                  </p>
                </div>

              </div>


              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 350ms both"
                }}
              >

                {/* PHOTO */}

                <div className="field photo-field">

                  <label>
                    📷 Child Photo{" "}
                    <span className="required-star">*</span>
                  </label>

                  <label
                    htmlFor="photo"
                    className="upload-box"
                  >
                    <span className="upload-icon">
                      ⬆️
                    </span>

                    <strong>
                      {photoName
                        ? "Change Photo"
                        : "Upload Photo"}
                    </strong>

                    <small>
                      JPG, JPEG or PNG • Max 5 MB
                    </small>
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
                    <div className="photo-file-name">
                      📎 Selected: {photoName}
                    </div>
                  )}

                </div>


                {/* CHILD NAME */}

                <div className="field">

                  <label htmlFor="childName">
                    👤 Child Name{" "}
                    <span className="required-star">*</span>
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


                {/* AGE */}

                <div className="field small-field">

                  <label htmlFor="age">
                    🎂 Age{" "}
                    <span className="required-star">*</span>
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


              {/* GENDER / CLOTHING / MARKS */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 400ms both"
                }}
              >

                <div className="field">

                  <label htmlFor="gender">
                    ⚧ Gender{" "}
                    <span className="required-star">*</span>
                  </label>

                  <select
                    className="select"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>


                <div className="field">

                  <label htmlFor="clothing">
                    👕 Clothing at Last Seen
                  </label>

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

                  <label htmlFor="identificationMarks">
                    🔎 Identification Marks
                  </label>

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


              {/* DESCRIPTION */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 450ms both"
                }}
              >

                <div className="field full-field">

                  <label htmlFor="description">
                    📝 Physical Description{" "}
                    <span className="required-star">*</span>
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


              {/* =====================================================
                  LAST SEEN DETAILS
                  ===================================================== */}

              <div
                className="section-title"
                style={{
                  animation: "riseIn 600ms var(--ease) 500ms both"
                }}
              >

                <span>2</span>

                <div>

                  <h3>
                    📍 Last Seen Details
                  </h3>

                  <p>
                    Tell us when and where the child was last seen.
                  </p>

                </div>

              </div>


              {/* LOCATION */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 550ms both"
                }}
              >

                <div className="field full-field">

                  <label htmlFor="lastSeenLocation">
                    📍 Last Seen Location{" "}
                    <span className="required-star">*</span>
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


              {/* DATE / TIME */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 600ms both"
                }}
              >

                <div className="field">

                  <label htmlFor="lastSeenDate">
                    📅 Date Last Seen{" "}
                    <span className="required-star">*</span>
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
                    🕐 Approximate Time{" "}
                    <span className="required-star">*</span>
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


              {/* =====================================================
                  REPORTER DETAILS
                  ===================================================== */}

              <div
                className="section-title"
                style={{
                  animation: "riseIn 600ms var(--ease) 650ms both"
                }}
              >

                <span>3</span>

                <div>

                  <h3>
                    👨‍👩‍👧 Parent / Guardian Details
                  </h3>

                  <p>
                    Contact information for verification and updates.
                  </p>

                </div>

              </div>


              {/* NAME / RELATIONSHIP */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 700ms both"
                }}
              >

                <div className="field">

                  <label htmlFor="reporterName">
                    👤 Full Name{" "}
                    <span className="required-star">*</span>
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
                    🤝 Relationship{" "}
                    <span className="required-star">*</span>
                  </label>

                  <select
                    className="select"
                    id="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select relationship
                    </option>

                    <option value="Parent">
                      Parent
                    </option>

                    <option value="Guardian">
                      Guardian
                    </option>

                    <option value="Sibling">
                      Sibling
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>


              {/* PHONE / EMAIL */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 750ms both"
                }}
              >

                <div className="field">

                  <label htmlFor="phone">
                    📞 Contact Number{" "}
                    <span className="required-star">*</span>
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

                  <label htmlFor="email">
                    ✉️ Email Address
                  </label>

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


              {/* ADDRESS */}

              <div
                className="field-row"
                style={{
                  animation: "riseIn 600ms var(--ease) 800ms both"
                }}
              >

                <div className="field full-field">

                  <label htmlFor="address">
                    🏠 Contact Address{" "}
                    <span className="required-star">*</span>
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


              {/* =====================================================
                  BUTTONS
                  ===================================================== */}

              <div
                className="form-actions"
                style={{
                  animation: "riseIn 600ms var(--ease) 850ms both"
                }}
              >

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  ↻ Clear Form
                </button>


                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  ➤ Submit Missing Child Report
                </button>

              </div>

            </form>

          </div>

        </div>

      </main>
    </>
  );
}

export default ReportMissingChild;