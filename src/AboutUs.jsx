import React from "react";
import "./about-us.css";

function AboutUs() {
  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-hero">

        <div className="about-hero-content">

          <span className="about-label">
            ABOUT MISSING CHILD RESCUE NETWORK
          </span>

          <h1>
            Working Together to
            <span> Bring Children Home.</span>
          </h1>

          <p>
            Missing Child Rescue Network is a web-based platform
            designed to support the reporting, verification,
            searching, tracking, and coordination of missing-child
            cases.
          </p>

        </div>

      </section>


      {/* ABOUT THE NETWORK */}

      <section className="about-section">

        <div className="about-container about-two-column">

          <div>
            <span className="about-label">
              WHO WE ARE
            </span>

            <h2>
              About Missing Child Rescue Network
            </h2>
          </div>

          <div className="about-text">

            <p>
              Missing Child Rescue Network provides a centralized
              platform where information related to missing-child
              cases can be reported, verified, searched, and
              tracked.
            </p>

            <p>
              The platform connects different participants involved
              in the rescue process and helps them coordinate
              information through a structured digital system.
            </p>

            <p>
              Our goal is to make important case information
              easier to manage while supporting faster
              communication between the people involved in a case.
            </p>

          </div>

        </div>

      </section>


      {/* MISSION & VISION */}

      <section className="about-section about-light">

        <div className="about-container">

          <div className="about-heading">

            <span className="about-label">
              OUR PURPOSE
            </span>

            <h2>
              Mission & Vision
            </h2>

          </div>


          <div className="about-cards">

            <article className="about-card">

              <div className="about-card-number">
                01
              </div>

              <h3>
                Our Mission
              </h3>

              <p>
                To provide a structured digital platform that
                supports missing-child reporting, verification,
                case tracking, searching, and communication among
                the people responsible for helping resolve cases.
              </p>

            </article>


            <article className="about-card">

              <div className="about-card-number">
                02
              </div>

              <h3>
                Our Vision
              </h3>

              <p>
                To create a connected rescue network where
                reliable information can move efficiently between
                citizens, police authorities, and administrators
                while supporting the safe resolution of
                missing-child cases.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section className="about-section">

        <div className="about-container">

          <div className="about-heading">

            <span className="about-label">
              HOW IT WORKS
            </span>

            <h2>
              From Report to Resolution
            </h2>

            <p>
              The platform follows a structured process for
              handling missing-child information.
            </p>

          </div>


          <div className="about-process">

            <div className="process-item">

              <span>01</span>

              <div>
                <h3>
                  Report
                </h3>

                <p>
                  A missing-child case can be submitted through
                  the platform with the required information.
                </p>
              </div>

            </div>


            <div className="process-item">

              <span>02</span>

              <div>
                <h3>
                  Verify
                </h3>

                <p>
                  Submitted information can be reviewed and
                  verified before becoming part of the case
                  workflow.
                </p>
              </div>

            </div>


            <div className="process-item">

              <span>03</span>

              <div>
                <h3>
                  Search & Match
                </h3>

                <p>
                  Verified cases can be searched and relevant
                  missing and found information can be connected.
                </p>
              </div>

            </div>


            <div className="process-item">

              <span>04</span>

              <div>
                <h3>
                  Track & Update
                </h3>

                <p>
                  Case progress can be tracked and updated as
                  investigation continues.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* PLATFORM FEATURES */}

      <section className="about-section about-dark">

        <div className="about-container">

          <div className="about-heading">

            <span className="about-label">
              OUR PLATFORM
            </span>

            <h2>
              What the Network Supports
            </h2>

          </div>


          <div className="feature-grid">

            <div className="feature-item">
              <span>01</span>
              <h3>Missing Child Reports</h3>
              <p>
                Structured submission of missing-child
                information.
              </p>
            </div>

            <div className="feature-item">
              <span>02</span>
              <h3>Found Child Reports</h3>
              <p>
                Reporting information about a child who may
                have been found.
              </p>
            </div>

            <div className="feature-item">
              <span>03</span>
              <h3>Verified Case Search</h3>
              <p>
                Searching information from verified cases.
              </p>
            </div>

            <div className="feature-item">
              <span>04</span>
              <h3>Case Tracking</h3>
              <p>
                Following case progress and status updates.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="about-cta">

        <div className="about-container">

          <span className="about-label">
            MISSING CHILD RESCUE NETWORK
          </span>

          <h2>
            Every piece of reliable information
            can make a difference.
          </h2>

          <p>
            Together, we can support a more connected and
            organized approach to missing-child cases.
          </p>

        </div>

      </section>

    </main>
  );
}

export default AboutUs;