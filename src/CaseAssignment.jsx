import React, { useEffect, useState } from "react";

function CaseAssignment() {
    const [cases, setCases] = useState([]);
    const [officers, setOfficers] = useState([]);

    const [selectedCase, setSelectedCase] = useState("");
    const [selectedOfficer, setSelectedOfficer] = useState("");
    const [deadline, setDeadline] = useState("");

    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =====================================================
    // FETCH CASES AND POLICE OFFICERS
    // =====================================================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get all cases
            const casesResponse = await fetch(
                "http://localhost:5000/api/cases"
            );

            const casesData = await casesResponse.json();

            if (!casesResponse.ok) {
                throw new Error(
                    casesData.message || "Failed to fetch cases"
                );
            }

            // Get police officers
            const officersResponse = await fetch(
                "http://localhost:5000/api/admin/police-officers"
            );

            const officersData = await officersResponse.json();

            if (!officersResponse.ok) {
                throw new Error(
                    officersData.message ||
                    "Failed to fetch police officers"
                );
            }

            setCases(casesData);
            setOfficers(officersData);

        } catch (err) {

            console.error("Error loading assignment data:", err);

            setError(
                err.message ||
                "Failed to load assignment data"
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // GET SELECTED OFFICER
    // =====================================================

    const selectedOfficerData = officers.find(
        (officer) =>
            String(officer.id) === String(selectedOfficer)
    );

    // =====================================================
    // ASSIGN CASE
    // =====================================================

    const handleAssignCase = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        // Check case
        if (!selectedCase) {
            setError("Please select a case.");
            return;
        }

        // Check officer
        if (!selectedOfficer) {
            setError("Please select a police officer.");
            return;
        }

        // Check deadline
        if (!deadline) {
            setError("Please select an investigation deadline.");
            return;
        }

        try {

            setAssigning(true);

            const response = await fetch(
                `http://localhost:5000/api/admin/cases/${selectedCase}/assign`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        officer_id: Number(selectedOfficer),
                        deadline: deadline
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to assign case"
                );
            }

            // Success
            setMessage(
                "Case assigned successfully!"
            );

            // Clear form
            setSelectedCase("");
            setSelectedOfficer("");
            setDeadline("");

            // Refresh cases
            const casesResponse = await fetch(
                "http://localhost:5000/api/cases"
            );

            const updatedCases =
                await casesResponse.json();

            setCases(updatedCases);

        } catch (err) {

            console.error(
                "Error assigning case:",
                err
            );

            setError(
                err.message ||
                "Failed to assign case"
            );

        } finally {

            setAssigning(false);

        }
    };

    return (
        <div>

            {/* =====================================================
                PAGE TITLE
            ===================================================== */}

            <div className="page-title">

                <div>

                    <span className="section-label">
                        CASE OPERATIONS
                    </span>

                    <h1>Case Assignment</h1>

                    <p>
                        Assign verified cases to police officers.
                    </p>

                </div>

            </div>

            <div className="assignment-grid">

                {/* =====================================================
                    ASSIGN CASE CARD
                ===================================================== */}

                <div className="dashboard-card">

                    <h2>Assign Case</h2>

                    <p className="card-description">
                        Select the case, police officer and investigation
                        deadline.
                    </p>

                    {/* Loading */}

                    {loading && (
                        <p>
                            Loading cases and police officers...
                        </p>
                    )}

                    {/* Error */}

                    {error && (
                        <div className="assignment-error">
                            {error}
                        </div>
                    )}

                    {/* Success */}

                    {message && (
                        <div className="assignment-success">
                            {message}
                        </div>
                    )}

                    {!loading && (

                        <form
                            className="assignment-form"
                            onSubmit={handleAssignCase}
                        >

                            {/* CASE */}

                            <label>
                                Select Case
                            </label>

                            <select
                                value={selectedCase}
                                onChange={(e) =>
                                    setSelectedCase(e.target.value)
                                }
                            >

                                <option value="">
                                    Select a case
                                </option>

                                {cases
                                    .filter(
                                        (item) =>
                                            item.status ===
                                            "Verified"
                                    )
                                    .map((item) => (

                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.case_id} —{" "}
                                            {item.child_name}
                                        </option>

                                    ))}

                            </select>

                            {/* POLICE OFFICER */}

                            <label>
                                Police Officer
                            </label>

                            <select
                                value={selectedOfficer}
                                onChange={(e) =>
                                    setSelectedOfficer(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select officer
                                </option>

                                 {officers.map((officer) => (
        <option
            key={officer.id}
            value={officer.id}
        >
            {officer.name} —{" "}
            {officer.officer_rank}
        </option>
    ))}

                            </select>
                            <p style={{ color: "red", fontWeight: "bold" }}>
    Officers loaded: {officers.length}
</p>
                            {/* STATION */}

                            <label>
                                Police Station
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedOfficerData
                                        ? selectedOfficerData.station
                                        : ""
                                }
                                placeholder="Station will appear automatically"
                                readOnly
                            />

                            {/* DEADLINE */}

                            <label>
                                Investigation Deadline
                            </label>

                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) =>
                                    setDeadline(e.target.value)
                                }
                            />

                            {/* BUTTON */}

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={assigning}
                            >

                                {assigning
                                    ? "Assigning..."
                                    : "Assign Case →"}

                            </button>

                        </form>

                    )}

                </div>


                {/* =====================================================
                    WORKFLOW CARD
                ===================================================== */}

                <div className="dashboard-card">

                    <h2>Assignment Workflow</h2>

                    <div className="workflow">

                        <div>

                            <span>01</span>

                            <section>

                                <strong>
                                    Verify Case
                                </strong>

                                <p>
                                    Admin confirms the report.
                                </p>

                            </section>

                        </div>


                        <div>

                            <span>02</span>

                            <section>

                                <strong>
                                    Set Priority
                                </strong>

                                <p>
                                    Assign High, Medium or Low priority.
                                </p>

                            </section>

                        </div>


                        <div>

                            <span>03</span>

                            <section>

                                <strong>
                                    Assign Officer
                                </strong>

                                <p>
                                    Select police station and officer.
                                </p>

                            </section>

                        </div>


                        <div>

                            <span>04</span>

                            <section>

                                <strong>
                                    Monitor Investigation
                                </strong>

                                <p>
                                    Track police investigation updates.
                                </p>

                            </section>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CaseAssignment;
