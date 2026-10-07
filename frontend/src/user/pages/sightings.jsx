import { useState } from "react";
import Navbar from "../components/navbar";
import "../styles/sightings.css";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
function Sightings() {
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    approximate_age: "",
    gender: "",
    sighting_date: "",
    sighting_time: "",
    description: "",
    reporter_name: "",
    contact_number: ""
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update text, date, time and select fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Get uploaded photo
  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // Submit form to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      alert("Please upload a child's photo.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    const token = localStorage.getItem("mcrn_token");

    data.append("photo", photo);
    data.append("location", formData.location);
    data.append("approximate_age", formData.approximate_age);
    data.append("gender", formData.gender);
    data.append("sighting_date", formData.sighting_date);
    data.append("sighting_time", formData.sighting_time);
    data.append("description", formData.description);
    data.append("reporter_name", formData.reporter_name);
    data.append("contact_number", formData.contact_number);
    const queryCaseId = new URLSearchParams(window.location.search).get("case_id");
    if (queryCaseId) data.append("case_id", queryCaseId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sightings`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: data
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Failed to submit the sighting report."
        );

        setLoading(false);
        return;
      }

      setSubmitted(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error:", error);

      alert(
        "Cannot connect to the backend. Please make sure the backend is running."
      );
    }

    setLoading(false);
  };

  const handleReset = () => {
    setSubmitted(false);

    setFormData({
      location: "",
      approximate_age: "",
      gender: "",
      sighting_date: "",
      sighting_time: "",
      description: "",
      reporter_name: "",
      contact_number: ""
    });

    setPhoto(null);
  };

  /* =====================================================
     SUCCESS PAGE
     ===================================================== */

  if (submitted) {
    return (
      <div className="sightings-page">

        <Navbar />

        <div className="sightings-content">

          <div className="sightings-helpline">
            <span className="sightings-icon">📞</span>
            {" "}Emergency Helpline: 1098 &nbsp;|&nbsp; 24/7 Toll Free
          </div>

          <div className="sightings-thankyou-container">

            <div className="sightings-success-icon">
              ✓
            </div>

            <h2>
              Thank You for Your Report
            </h2>

            <p>
              Your sighting report has been submitted successfully.
            </p>

            <p>
              Our team will review the details and take action as needed.
            </p>

            <p className="sightings-ref">
              Every piece of information helps bring a missing child home.
            </p>

            <button
              type="button"
              onClick={handleReset}
            >
              🔄 Submit Another Report
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN SIGHTING PAGE
     ===================================================== */

  return (
    <div className="sightings-page">

      <Navbar />

      {/* Space between navbar and Sightings page */}
      <div className="sightings-content">

        <div className="sightings-helpline">
          <span className="sightings-icon">📞</span>
          {" "}Emergency Helpline: 1098 &nbsp;|&nbsp; 24/7 Toll Free
        </div>

        <div className="sightings-header">

          <h1>
            👁️ Public Sighting Report
          </h1>

          <p>
            Saw a child who might be missing? Report it here — anyone can submit.
          </p>

        </div>

        <div className="sightings-container">

          <div className="sightings-section-title">
            📋 Sighting Information
          </div>

          <form onSubmit={handleSubmit}>

            {/* Photo + Location */}

            <div className="sightings-row">

              <div className="sightings-column">

                <label>
                  📷 Upload Child's Photo
                </label>

                <div className="sightings-upload-box">

                  <div className="sightings-upload-icon">
                    ☁️
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required
                  />

                </div>

              </div>

              <div className="sightings-column">

                <label>
                  📍 Current Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter street, area or landmark"
                  required
                />

              </div>

            </div>

            {/* Age + Gender */}

            <div className="sightings-row">

              <div className="sightings-column">

                <label>
                  🎂 Approximate Age
                </label>

                <select
                  name="approximate_age"
                  value={formData.approximate_age}
                  onChange={handleChange}
                  required
                >

                  <option value="" disabled>
                    Select Age
                  </option>

                  <option>
                    0 - 2 Years
                  </option>

                  <option>
                    3 - 5 Years
                  </option>

                  <option>
                    6 - 10 Years
                  </option>

                  <option>
                    11 - 15 Years
                  </option>

                  <option>
                    16 - 18 Years
                  </option>

                  <option>
                    Not Sure
                  </option>

                </select>

              </div>

              <div className="sightings-column">

                <label>
                  ⚧️ Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="" disabled>
                    Select Gender
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                  <option>
                    Not Sure
                  </option>

                </select>

              </div>

            </div>

            {/* Date + Time */}

            <div className="sightings-row">

              <div className="sightings-column">

                <label>
                  📅 Date
                </label>

                <input
                  type="date"
                  name="sighting_date"
                  value={formData.sighting_date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="sightings-column">

                <label>
                  🕐 Time
                </label>

                <input
                  type="time"
                  name="sighting_time"
                  value={formData.sighting_time}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* Description */}

            <label>
              📝 Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the child's appearance, clothing, and surroundings..."
              required
            />

            <br />
            <br />

            {/* Reporter Information */}

            <div className="sightings-section-title">

              👤 Reporter Information

            </div>

            <div className="sightings-row">

              <div className="sightings-column">

                <label>
                  📞 Contact Number
                </label>

                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                />

              </div>

              <div className="sightings-column">

                <label>
                  🪪 Name (Optional)
                </label>

                <input
                  type="text"
                  name="reporter_name"
                  value={formData.reporter_name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />

              </div>

            </div>

            {/* Submit Button */}

            <div className="sightings-button-area">

              <button
                type="submit"
                disabled={loading}
              >

                📤{" "}

                {loading
                  ? "Submitting..."
                  : "Submit Sighting Report"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Sightings;
