import { useState } from "react";
import Navbar from "./navbar.jsx";
import "./sightings.css";

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

    data.append("photo", photo);
    data.append("location", formData.location);
    data.append("approximate_age", formData.approximate_age);
    data.append("gender", formData.gender);
    data.append("sighting_date", formData.sighting_date);
    data.append("sighting_time", formData.sighting_time);
    data.append("description", formData.description);
    data.append("reporter_name", formData.reporter_name);
    data.append("contact_number", formData.contact_number);

    try {
      const response = await fetch("http://localhost:5000/api/sightings", {
        method: "POST",
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to submit the sighting report.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to the backend. Please make sure the backend is running.");
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

  if (submitted) {
    return (
      <>
        <Navbar />

        <div className="helpline">
          <i className="fa-solid fa-phone"></i>
          {" "}Emergency Helpline: 1098 &nbsp;|&nbsp; 24/7 Toll Free
        </div>

        <div className="thankyou-container">
          <i className="fa-solid fa-circle-check"></i>
          <h2>Thank You for Your Report</h2>
          <p>Your sighting report has been submitted successfully.</p>
          <p>Our team will review the details and take action as needed.</p>
          <p className="ref">
            Every piece of information helps bring a missing child home.
          </p>

          <button type="button" onClick={handleReset}>
            Submit Another Report
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="helpline">
        <i className="fa-solid fa-phone"></i>
        {" "}Emergency Helpline: 1098 &nbsp;|&nbsp; 24/7 Toll Free
      </div>

      <div className="header">
        <h1>
          <i className="fa-solid fa-eye"></i> Public Sighting Report
        </h1>
        <p>
          Saw a child who might be missing? Report it here — anyone can submit.
        </p>
      </div>

      <div className="container">

        <div className="section-title">
          <i className="fa-solid fa-clipboard-list"></i>
          Sighting Information
        </div>

        <form onSubmit={handleSubmit}>

          <div className="row">
            <div className="column">
              <label>
                <i className="fa-solid fa-camera"></i>
                Upload Child's Photo
              </label>

              <div className="upload-box">
                <i className="fa-solid fa-cloud-arrow-up"></i>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                />
              </div>
            </div>

            <div className="column">
              <label>
                <i className="fa-solid fa-location-dot"></i>
                Current Location
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

          <div className="row">
            <div className="column">
              <label>
                <i className="fa-solid fa-cake-candles"></i>
                Approximate Age
              </label>

              <select
                name="approximate_age"
                value={formData.approximate_age}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Age</option>
                <option>0 - 2 Years</option>
                <option>3 - 5 Years</option>
                <option>6 - 10 Years</option>
                <option>11 - 15 Years</option>
                <option>16 - 18 Years</option>
                <option>Not Sure</option>
              </select>
            </div>

            <div className="column">
              <label>
                <i className="fa-solid fa-venus-mars"></i>
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Not Sure</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="column">
              <label>
                <i className="fa-solid fa-calendar-days"></i>
                Date
              </label>

              <input
                type="date"
                name="sighting_date"
                value={formData.sighting_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="column">
              <label>
                <i className="fa-solid fa-clock"></i>
                Time
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

          <label>
            <i className="fa-solid fa-align-left"></i>
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the child's appearance, clothing, and surroundings..."
            required
          />

          <br /><br />

          <div className="section-title">
            <i className="fa-solid fa-user"></i>
            Reporter Information
          </div>

          <div className="row">
            <div className="column">
              <label>
                <i className="fa-solid fa-phone"></i>
                Contact Number
              </label>

              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Enter your mobile number"
              />
            </div>

            <div className="column">
              <label>
                <i className="fa-solid fa-id-badge"></i>
                Name (Optional)
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

          <div className="button-area">
            <button type="submit" disabled={loading}>
              <i className="fa-solid fa-paper-plane"></i>
              {" "}
              {loading ? "Submitting..." : "Submit Sighting Report"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default Sightings;