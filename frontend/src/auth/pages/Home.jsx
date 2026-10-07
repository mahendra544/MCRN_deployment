import { useEffect, useRef } from "react";
import "../landing.css";

/**
 * This page intentionally mirrors the original static
 * index.html / missing-child-rescue-network.css design exactly — same
 * classes, same structure, same copy. The only functional change: the
 * Login/Register links used to be in-page anchors (#login / #register) with
 * nowhere real to go. They now call `go()` to navigate to the actual
 * Login/Register pages in this app. Section links (#reality, #network,
 * #safety, #about) remain true in-page anchors, exactly as in the original.
 */
export default function Home({ go }) {
  const rootRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const root = rootRef.current;
    if (!root) return;

    // ---------------------------------------------------
    // Mobile navigation
    // ---------------------------------------------------
    const menuBtn = root.querySelector("#menuBtn");
    const nav = root.querySelector("#mainNav");

    function onMenuClick() {
      const open = nav.classList.toggle("mobile-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "×" : "☰";
    }

    if (menuBtn && nav) {
      menuBtn.addEventListener("click", onMenuClick);
    }

    const navLinkEls = [...root.querySelectorAll(".nav-link")];
    const closeMenuOnLinkClick = () => {
      if (nav) {
        nav.classList.remove("mobile-open");
        if (menuBtn) {
          menuBtn.setAttribute("aria-expanded", "false");
          menuBtn.textContent = "☰";
        }
      }
    };
    navLinkEls.forEach((link) => link.addEventListener("click", closeMenuOnLinkClick));

    // ---------------------------------------------------
    // Active navigation item
    // ---------------------------------------------------
    const sections = [...root.querySelectorAll("main section[id]")];

    const updateActiveNav = () => {
      const scrollPosition = window.scrollY + 130;
      let current = "home";

      sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
          current = section.id;
        }
      });

      navLinkEls.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    };

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();

    // ---------------------------------------------------
    // Scroll reveal
    // ---------------------------------------------------
    const revealItems = root.querySelectorAll(".reveal");
    let revealObserver;

    // Keep the landing-page content visible even before the observer fires.
    revealItems.forEach((item) => item.classList.add("is-visible"));

    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }

    // ---------------------------------------------------
    // Gentle page transitions for internal (#section) navigation
    // ---------------------------------------------------
    const sectionAnchorLinks = [...root.querySelectorAll('a[href^="#"]')];

    function onAnchorClick(event) {
      const link = event.currentTarget;
      const targetId = link.getAttribute("href");
      const target = root.querySelector(targetId) || document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({ behavior: "smooth" });
    }

    sectionAnchorLinks.forEach((link) => link.addEventListener("click", onAnchorClick));

    return () => {
      if (menuBtn) menuBtn.removeEventListener("click", onMenuClick);
      navLinkEls.forEach((link) => link.removeEventListener("click", closeMenuOnLinkClick));
      window.removeEventListener("scroll", updateActiveNav);
      if (revealObserver) revealObserver.disconnect();
      sectionAnchorLinks.forEach((link) => link.removeEventListener("click", onAnchorClick));
    };
  }, []);

  return (
    <div ref={rootRef} className="mcrn-landing">

      {/* ================= NAVIGATION ================= */}
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#home" aria-label="Missing Child Rescue Network home" onClick={(e) => { e.preventDefault(); rootRef.current?.querySelector("#home")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <span className="brand-mark brand-logo" aria-hidden="true">
              <img src="/assets/mcrn-logo.jpeg" alt="" />
            </span>
            <span className="brand-copy">
              <strong>Missing Child</strong>
              <span>Rescue Network</span>
            </span>
          </a>

          <nav className="nav-links" id="mainNav" aria-label="Main navigation">
            <a className="nav-link active" href="#home">Home</a>
            <a className="nav-link" href="#reality">The Reality</a>
            <a className="nav-link" href="#network">The Network</a>
            <a className="nav-link" href="#safety">Safety</a>
            <a className="nav-link" href="#about">About</a>
          </nav>

          <div className="nav-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => go("login")}>
              Login
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go("register")}>
              Register
            </button>
            <button className="mobile-menu-btn" id="menuBtn" aria-label="Open navigation" aria-expanded="false">
              ☰
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow">A story about time</div>

              <h1 className="hero-title">
                Every <span className="accent">8 minutes,</span>
                <br />
                a child goes missing in India.
              </h1>

              <p className="hero-description">
                By the time you finish reading this page, at least one more will have
                disappeared. This isn't a statistic to scroll past — it's a gap in
                coordination that costs real children real time. This network exists
                to close that gap.
              </p>

              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={() => go("register")}>
                  Join the Network — Register
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => go("login")}>
                  Already a Member — Log In
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => window.location.href = "/admin/"}>
                  Administrator Access
                </button>
              </div>
            </div>

            <div className="hero-visual" aria-label="A child goes missing every eight minutes">
              <div className="clock-widget">
                <div className="clock-pulse"></div>
                <div className="clock-ring"></div>
                <div className="clock-hand"></div>
                <div className="clock-face">
                  <span className="clock-number">8</span>
                  <span className="clock-unit">Minutes, on average</span>
                </div>
                <div className="clock-caption">
                  <strong>One case begins</strong> somewhere in India in the time it
                  takes this hand to turn once.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= THE REALITY (STORY TIMELINE) ================= */}
        <section className="section story-section" id="reality">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">The reality, in numbers</div>
              <h2>This is what the silence looks like.</h2>
              <p className="muted">
                None of these numbers are abstract. Each one is a child, a family,
                and a window of time that keeps closing while systems catch up.
              </p>
            </div>

            <div className="story-timeline">
              <div className="story-block">
                <div className="story-marker">1</div>
                <div className="story-copy">
                  <span className="story-stat">98,000+</span>
                  <h3>Cases reported every year</h3>
                  <p>
                    Nearly a hundred thousand children are reported missing across
                    India annually — roughly one child disappearing every eight minutes,
                    every day of the year.
                  </p>
                </div>
              </div>

              <div className="story-block">
                <div className="story-marker">2</div>
                <div className="story-copy">
                  <span className="story-stat">65–73%</span>
                  <h3>The current recovery rate</h3>
                  <p>
                    Of every case filed, only around two-thirds to three-quarters are
                    ever resolved. That gap — the remaining <strong>1 in 3 to 1 in 4
                    cases</strong> — represents tens of thousands of children who
                    stay untraced each year.
                  </p>
                </div>
              </div>

              <div className="story-block">
                <div className="story-marker">3</div>
                <div className="story-copy">
                  <span className="story-stat">24–48 hrs</span>
                  <h3>Before a search formally begins</h3>
                  <p>
                    In many cases, active investigation only takes shape after this
                    waiting window has passed. For a missing child, this is not a
                    technicality — it's the head start a trafficker or accident
                    doesn't need.
                  </p>
                </div>
              </div>

              <div className="story-block">
                <div className="story-marker">4</div>
                <div className="story-copy">
                  <span className="story-stat">Immeasurable</span>
                  <h3>What a parent carries in that window</h3>
                  <p>
                    Every hour of that delay is spent by a parent making calls no one
                    answers, retracing steps, and waiting for someone — anyone — to
                    move faster than the system allows.
                  </p>
                </div>
              </div>
            </div>

            <div className="quote-block">
              <p>
                "You don't know panic until you've stood at a police station
                being told to wait 24 hours, while your child is somewhere out
                there, alone."
              </p>
              <span>— A reality too many parents describe the same way</span>
            </div>
          </div>
        </section>

        {/* ================= THE NETWORK / WHY JOIN ================= */}
        <section className="section" id="network">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">Why this network exists</div>
              <h2>The gap isn't effort. It's coordination.</h2>
              <p className="muted">
                Parents, citizens, police, and NGOs are all trying to help — usually
                without a shared, real-time view of the same case. This network gives
                every verified stakeholder one place to act from, from the first
                minute.
              </p>
            </div>

            <div className="module-grid">
              <article className="module-card">
                <div className="module-icon">⌁</div>
                <h3>Minutes matter, so we remove delay</h3>
                <p>Verified reports reach the right authorities immediately — not after a waiting period.</p>
              </article>

              <article className="module-card">
                <div className="module-icon">♧</div>
                <h3>One case, every stakeholder</h3>
                <p>Police, NGOs, and welfare bodies coordinate on the same verified record instead of fragmented files.</p>
              </article>

              <article className="module-card">
                <div className="module-icon">◈</div>
                <h3>Every member raises the odds</h3>
                <p>More verified eyes and faster escalation is how a 65–73% recovery rate moves closer to 100%.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ================= JOIN CTA BAND ================= */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="join-band">
              <div className="eyebrow" style={{ color: "#ff8f8f" }}>Be the reason a case closes sooner</div>
              <h2>Become part of the network.</h2>
              <p>
                Every account added — parent, citizen, officer, or organization — is
                one more person who can act in that first critical hour. This is how
                the recovery rate moves.
              </p>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={() => go("register")}>
                  Register Now
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => go("login")}>
                  Log In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SAFETY ================= */}
        <section className="section" id="safety">
          <div className="container">
            <div className="emergency">
              <div className="emergency-content">
                <div className="emergency-label">Emergency support</div>
                <h2 className="emergency-number">1098</h2>
                <p className="muted">Child Helpline · 24/7 support</p>
              </div>
              <a className="btn btn-primary" href="tel:1098">Call Child Helpline</a>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">About the project</div>
              <h2>Secure. Reliable. Human-centered.</h2>
              <p className="muted">
                The Missing Child Rescue Network demonstrates software engineering
                principles through secure authentication, role-based access control,
                centralized records, verification workflows, notifications, and
                stakeholder coordination — built around a single goal: closing the
                time gap between a report and a rescue.
              </p>
            </div>

            <div className="info-grid">
              <article className="info-card">
                <div className="info-card-icon">◈</div>
                <h3>Security &amp; Privacy</h3>
                <p>Role-based access and controlled information sharing help protect sensitive case data.</p>
              </article>

              <article className="info-card">
                <div className="info-card-icon">∞</div>
                <h3>Scalable Architecture</h3>
                <p>A centralized database and modular design support future growth and additional services.</p>
              </article>

              <article className="info-card">
                <div className="info-card-icon">♥</div>
                <h3>Human Impact</h3>
                <p>Technology organized around one measure of success: children found faster.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a className="brand" href="#home">
                <span className="brand-mark brand-logo" aria-hidden="true">
              <img src="/assets/mcrn-logo.jpeg" alt="" />
            </span>
                <span className="brand-copy">
                  <strong>Missing Child</strong>
                  <span>Rescue Network</span>
                </span>
              </a>
              <p style={{ maxWidth: 380, marginTop: 18, color: "#aeb5bf", fontSize: ".82rem" }}>
                A project concept for secure, coordinated reporting and rescue of missing children.
              </p>
            </div>

            <div>
              <h4>Platform</h4>
              <div className="footer-links">
                <a href="#reality">The Reality</a>
                <a href="#network">The Network</a>
                <a href="#register" onClick={(e) => { e.preventDefault(); go("register"); }}>Register</a>
                <a href="#login" onClick={(e) => { e.preventDefault(); go("login"); }}>Login</a>
              </div>
            </div>

            <div>
              <h4>Safety</h4>
              <div className="footer-links">
                <a href="#safety">Emergency Support</a>
                <a href="#about">Privacy</a>
                <a href="#about">Security</a>
              </div>
            </div>

            <div>
              <h4>Project</h4>
              <div className="footer-links">
                <a href="#about">About</a>
                <a href="#home">Back to top</a>
                <a href="#admin" onClick={(e) => { e.preventDefault(); window.location.href = "/admin/"; }}>Administrator Access</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Missing Child Rescue Network</span>
            <span>Every 8 minutes matters.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
