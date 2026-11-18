import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function normalizeAppointment(item) {
  return {
    ...item,
    id: item._id || item.id,
    problem: item.problem || item.specialty || "",
    date: item.appointmentDate
      ? String(item.appointmentDate).slice(0, 10)
      : item.date,
    time: item.appointmentTime || item.time
  };
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [bookingMessage, setBookingMessage] = useState("");

  // Admin authentication
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // Patient authentication and registration
  const [patients, setPatients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("careconnect_patients") || "[]");
    } catch {
      return [];
    }
  });

  const [currentPatient, setCurrentPatient] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("careconnect_current_patient") || "null"
      );
    } catch {
      return null;
    }
  });

  const [patientNameInput, setPatientNameInput] = useState("");
  const [patientPhoneInput, setPatientPhoneInput] = useState("");
  const [patientPasswordInput, setPatientPasswordInput] = useState("");
  const [patientAuthMessage, setPatientAuthMessage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportStatus, setReportStatus] = useState("All");

  // Doctor authentication
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [doctorLoginName, setDoctorLoginName] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorLoginMessage, setDoctorLoginMessage] = useState("");

  const doctors = [
    { name: "Dr. Ananya Rao", specialty: "Cardiologist", experience: "10 years", loginPassword: "Ananya@123" },
    { name: "Dr. Rahul Sharma", specialty: "Dermatologist", experience: "8 years", loginPassword: "Rahul@123" },
    { name: "Dr. Priya Reddy", specialty: "Pediatrician", experience: "12 years", loginPassword: "Priya@123" },
    { name: "Dr. Arjun Kumar", specialty: "Neurologist", experience: "9 years", loginPassword: "Arjun@123" },
    { name: "Dr. Kiran Rao", specialty: "General Physician", experience: "7 years", loginPassword: "Kiran@123" }
  ];

  const problemSpecialtyMap = {
    "Heart Problems": "Cardiologist",
    "Skin Problems": "Dermatologist",
    "Acne and Skin Rashes": "Dermatologist",
    "Child Health": "Pediatrician",
    "Headache": "Neurologist",
    "Nerve Problems": "Neurologist",
    "Fever and Cold": "General Physician",
    Other: "General Physician"
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00"
  ];

  const emptyAppointment = {
    patientName: "",
    patientAge: "",
    phone: "",
    gender: "",
    problem: "",
    doctorName: "",
    date: "",
    time: ""
  };

  const [appointment, setAppointment] = useState(emptyAppointment);

  const [appointments, setAppointments] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("careconnect_appointments") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/appointments`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load appointments.");
        return response.json();
      })
      .then((data) => {
        if (isMounted && data.success) {
          setAppointments(data.appointments.map(normalizeAppointment));
        }
      })
      .catch((error) => console.error("Appointment API error:", error));

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist demo data in this browser
  useEffect(() => {
    localStorage.setItem("careconnect_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    if (currentPatient) {
      localStorage.setItem(
        "careconnect_current_patient",
        JSON.stringify(currentPatient)
      );
    } else {
      localStorage.removeItem("careconnect_current_patient");
    }
  }, [currentPatient]);

  useEffect(() => {
    localStorage.setItem(
      "careconnect_appointments",
      JSON.stringify(appointments)
    );
  }, [appointments]);

  const menu = [
    "Dashboard",
    "Find Doctors",
    "Book Appointment",
    "My Appointments",
    "Patients",
    "Doctors",
    "Reports"
  ];

  // Patient registration
  function handlePatientRegister(e) {
    e.preventDefault();

    const cleanName = patientNameInput.trim();
    const cleanPhone = patientPhoneInput.trim();

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setPatientAuthMessage("Enter a valid 10-digit phone number.");
      return;
    }

    if (patientPasswordInput.length < 6) {
      setPatientAuthMessage("Password must contain at least 6 characters.");
      return;
    }

    if (!cleanName) {
      setPatientAuthMessage("Please enter your full name.");
      return;
    }

    const phoneExists = patients.some(
      (patient) => patient.phone === cleanPhone
    );

    if (phoneExists) {
      setPatientAuthMessage(
        "This phone number is already registered. Please log in."
      );
      return;
    }

    const newPatient = {
      id: Date.now(),
      name: cleanName,
      phone: cleanPhone,
      password: patientPasswordInput
    };

    setPatients((prev) => [...prev, newPatient]);
    setCurrentPatient(newPatient);
    setPatientNameInput("");
    setPatientPhoneInput("");
    setPatientPasswordInput("");
    setPatientAuthMessage("");

    setAppointment({
      ...emptyAppointment,
      patientName: newPatient.name,
      phone: newPatient.phone
    });

    setActivePage("Dashboard");
  }

  // Patient login
  function handlePatientLogin(e) {
    e.preventDefault();

    const foundPatient = patients.find(
      (patient) =>
        patient.phone === patientPhoneInput.trim() &&
        patient.password === patientPasswordInput
    );

    if (!foundPatient) {
      setPatientAuthMessage("Invalid phone number or password.");
      return;
    }

    setCurrentPatient(foundPatient);
    setAppointment({
      ...emptyAppointment,
      patientName: foundPatient.name,
      phone: foundPatient.phone
    });
    setPatientPhoneInput("");
    setPatientPasswordInput("");
    setPatientAuthMessage("");
    setActivePage("Dashboard");
  }

  function handlePatientLogout() {
    setCurrentPatient(null);
    setAppointment({ ...emptyAppointment });
    setActivePage("Dashboard");
    setPatientAuthMessage("");
    setProfileMessage("");
  }

  // Patient profile update
  function handleProfileUpdate(e) {
    e.preventDefault();

    if (!currentPatient || !profileName.trim()) {
      setProfileMessage("Please enter your name.");
      return;
    }

    const updatedPatient = {
      ...currentPatient,
      name: profileName.trim()
    };

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === currentPatient.id ? updatedPatient : patient
      )
    );
    setCurrentPatient(updatedPatient);

    setAppointments((prev) =>
      prev.map((item) =>
        item.phone === currentPatient.phone
          ? { ...item, patientName: updatedPatient.name }
          : item
      )
    );

    setAppointment((prev) => ({
      ...prev,
      patientName: updatedPatient.name
    }));

    setProfileMessage("Profile updated successfully!");
  }

  // Admin login
  function handleAdminLogin(e) {
    e.preventDefault();

    if (adminUsername === "admin" && adminPassword === "admin123") {
      setIsAdminLoggedIn(true);
      setLoginMessage("");
      setAdminUsername("");
      setAdminPassword("");
      setActivePage("Admin Panel");
    } else {
      setLoginMessage("Invalid username or password!");
    }
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    setActivePage("Dashboard");
    setLoginMessage("");
  }

  // Doctor login (demo password for all listed doctors)
  function handleDoctorLogin(e) {
    e.preventDefault();

    const doctor = doctors.find(
      (item) => item.name === doctorLoginName
    );

    if (doctor && doctorPassword === doctor.loginPassword) {
      setCurrentDoctor(doctor);
      setDoctorPassword("");
      setDoctorLoginMessage("");
      setActivePage("Doctor Dashboard");
    } else {
      setDoctorLoginMessage("Invalid doctor selection or password.");
    }
  }

  function handleDoctorLogout() {
    setCurrentDoctor(null);
    setDoctorLoginName("");
    setDoctorPassword("");
    setActivePage("Dashboard");
    setDoctorLoginMessage("");
  }

  // Automatically assign a doctor based on the selected health problem
  function handleProblemChange(value) {
    const requiredSpecialty = problemSpecialtyMap[value];

    const matchedDoctor = doctors.find(
      (doctor) => doctor.specialty === requiredSpecialty
    );

    setAppointment((prev) => ({
      ...prev,
      problem: value,
      doctorName: matchedDoctor ? matchedDoctor.name : "",
      time: ""
    }));
  }

  function updateAppointment(field, value) {
    setAppointment((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "date" ? { time: "" } : {})
    }));
  }

  function isSlotOccupied(item) {
    return ["Pending", "Confirmed"].includes(item.status);
  }

  const availableSlots = timeSlots.filter((slot) => {
    return !appointments.some(
      (item) =>
        isSlotOccupied(item) &&
        item.date === appointment.date &&
        item.time === slot &&
        item.doctorName === appointment.doctorName
    );
  });

  // Book appointment
  async function handleBooking(e) {
    e.preventDefault();

    if (!currentPatient) {
      setActivePage("Patient Login");
      setPatientAuthMessage("Please log in before booking an appointment.");
      return;
    }

    if (!appointment.doctorName || !appointment.date || !appointment.time) {
      setBookingMessage("Please complete all appointment details.");
      return;
    }

    const slotAlreadyBooked = appointments.some(
      (item) =>
        isSlotOccupied(item) &&
        item.date === appointment.date &&
        item.time === appointment.time &&
        item.doctorName === appointment.doctorName
    );

    if (slotAlreadyBooked) {
      setBookingMessage("This slot is already booked. Choose another time.");
      return;
    }

    try {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.name === appointment.doctorName
      );
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: currentPatient.name,
          patientAge: Number(appointment.patientAge),
          phone: currentPatient.phone,
          gender: appointment.gender,
          doctorName: appointment.doctorName,
          specialty: selectedDoctor?.specialty || appointment.problem,
          problem: appointment.problem,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          status: "Pending"
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to book the appointment.");
      }

      setAppointments((prev) => [
        normalizeAppointment(data.appointment),
        ...prev
      ]);
      setBookingMessage("Appointment booked! Waiting for admin approval.");
      setAppointment({
        ...emptyAppointment,
        patientName: currentPatient.name,
        phone: currentPatient.phone
      });
    } catch (error) {
      setBookingMessage(error.message || "Unable to connect to the server.");
    }
  }

  async function updateAppointmentStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update appointment.");
      }
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === id ? normalizeAppointment(data.appointment) : item
        )
      );
    } catch (error) {
      console.error("Appointment update error:", error);
      setBookingMessage(error.message || "Unable to connect to the server.");
    }
  }

  function approveAppointment(id) {
    updateAppointmentStatus(id, "Confirmed");
  }

  function rejectAppointment(id) {
    if (window.confirm("Are you sure you want to reject this appointment?")) {
      updateAppointmentStatus(id, "Rejected");
    }
  }

  function cancelAppointment(id) {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      updateAppointmentStatus(id, "Cancelled");
    }
  }

  // Doctor marks a confirmed appointment as completed.
  function completeAppointment(id) {
    if (window.confirm("Mark this appointment as completed?")) {
      updateAppointmentStatus(id, "Completed");
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSpecialty =
      specialty === "All" || doctor.specialty === specialty;

    return matchesSearch && matchesSpecialty;
  });

  const myAppointments = currentPatient
    ? appointments.filter((item) => item.phone === currentPatient.phone)
    : [];

  const doctorAppointments = currentDoctor
    ? appointments.filter((item) => item.doctorName === currentDoctor.name)
    : [];

  const reportAppointments = appointments.filter((item) => {
    const matchesStart = !reportStartDate || item.date >= reportStartDate;
    const matchesEnd = !reportEndDate || item.date <= reportEndDate;
    const matchesStatus = reportStatus === "All" || item.status === reportStatus;
    return matchesStart && matchesEnd && matchesStatus;
  });

  const reportStatusCounts = ["Pending", "Confirmed", "Completed", "Rejected", "Cancelled"].map(
    (status) => ({
      label: status,
      count: reportAppointments.filter((item) => item.status === status).length
    })
  );

  const reportDoctorCounts = doctors
    .map((doctor) => ({
      label: doctor.name,
      count: reportAppointments.filter((item) => item.doctorName === doctor.name).length
    }))
    .filter((doctor) => doctor.count > 0)
    .sort((a, b) => b.count - a.count);

  function exportReport() {
    const rows = [
      ["CareConnect appointment report"],
      ["Date range", reportStartDate || "All dates", reportEndDate || "All dates"],
      ["Status filter", reportStatus],
      [],
      ["Metric", "Count"],
      ["Appointments", reportAppointments.length],
      ["Registered patients", new Set(reportAppointments.map((item) => item.phone)).size],
      ...reportStatusCounts.map(({ label, count }) => [label, count]),
      [],
      ["Doctor", "Appointments"],
      ...reportDoctorCounts.map(({ label, count }) => [label, count])
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "careconnect-appointment-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const today = new Date();
  const minDate =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  return (
    <div className="app">
      <header className="header">
        <h1>CareConnect</h1>
        <p>Doctor Consultation & Telemedicine Platform</p>
        {currentPatient && <p>Welcome, {currentPatient.name}</p>}
        {currentDoctor && <p>Doctor: {currentDoctor.name}</p>}
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h3>MAIN MENU</h3>

          {menu.map((item) => (
            <button
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => {
                if (
                  (item === "Book Appointment" || item === "My Appointments") &&
                  !currentPatient
                ) {
                  setActivePage("Patient Login");
                  setPatientAuthMessage("Please log in to continue.");
                } else if ((item === "Patients" || item === "Reports") && !isAdminLoggedIn) {
                  setActivePage("Admin Login");
                  setLoginMessage(`Admin login is required to view ${item.toLowerCase()}.`);
                } else {
                  setActivePage(item);
                }
                setBookingMessage("");
              }}
            >
              {item}
            </button>
          ))}

          {currentPatient ? (
            <>
              <button
                className={activePage === "Patient Profile" ? "active" : ""}
                onClick={() => {
                  setProfileName(currentPatient.name);
                  setProfileMessage("");
                  setActivePage("Patient Profile");
                }}
              >
                My Profile
              </button>
              <button onClick={handlePatientLogout}>Patient Logout</button>
            </>
          ) : (
            <>
              <button
                className={
                  activePage === "Patient Login" ||
                  activePage === "Patient Register" ? "active" : ""
                }
                onClick={() => {
                  setActivePage("Patient Login");
                  setPatientAuthMessage("");
                }}
              >
                Patient Login
              </button>
              <button
                onClick={() => {
                  setActivePage("Patient Register");
                  setPatientAuthMessage("");
                }}
              >
                Register
              </button>
            </>
          )}

          <button
            className={
              activePage === "Admin Login" || activePage === "Admin Panel"
                ? "active"
                : ""
            }
            onClick={() => {
              setActivePage(isAdminLoggedIn ? "Admin Panel" : "Admin Login");
              setLoginMessage("");
            }}
          >
            {isAdminLoggedIn ? "Admin Panel" : "Admin Login"}
          </button>

          {isAdminLoggedIn && (
            <button onClick={handleAdminLogout}>Admin Logout</button>
          )}

          <button
            className={
              activePage === "Doctor Login" ||
              activePage === "Doctor Dashboard" ? "active" : ""
            }
            onClick={() => {
              setActivePage(currentDoctor ? "Doctor Dashboard" : "Doctor Login");
              setDoctorLoginMessage("");
            }}
          >
            {currentDoctor ? "Doctor Dashboard" : "Doctor Login"}
          </button>

          {currentDoctor && (
            <button onClick={handleDoctorLogout}>Doctor Logout</button>
          )}
        </aside>

        <main className="content">
          <h2>{activePage}</h2>

          {/* Patient Login */}
          {activePage === "Patient Login" && (
            <div className="appointment-form">
              <h3>Patient Login</h3>
              <form onSubmit={handlePatientLogin}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter registered 10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                  value={patientPhoneInput}
                  onChange={(e) => setPatientPhoneInput(e.target.value)}
                />

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={patientPasswordInput}
                  onChange={(e) => setPatientPasswordInput(e.target.value)}
                />

                <button type="submit">Login</button>
                {patientAuthMessage && (
                  <p className="success-message">{patientAuthMessage}</p>
                )}
              </form>

              <p>Don't have an account?</p>
              <button
                onClick={() => {
                  setActivePage("Patient Register");
                  setPatientAuthMessage("");
                }}
              >
                Create Patient Account
              </button>
            </div>
          )}

          {/* Patient Registration */}
          {activePage === "Patient Register" && (
            <div className="appointment-form">
              <h3>Create Patient Account</h3>
              <form onSubmit={handlePatientRegister}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={patientNameInput}
                  onChange={(e) => setPatientNameInput(e.target.value)}
                />

                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                  value={patientPhoneInput}
                  onChange={(e) => setPatientPhoneInput(e.target.value)}
                />

                <label>Create Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                  value={patientPasswordInput}
                  onChange={(e) => setPatientPasswordInput(e.target.value)}
                />

                <button type="submit">Register</button>
                {patientAuthMessage && (
                  <p className="success-message">{patientAuthMessage}</p>
                )}
              </form>

              <p>Already have an account?</p>
              <button
                onClick={() => {
                  setActivePage("Patient Login");
                  setPatientAuthMessage("");
                }}
              >
                Go to Patient Login
              </button>
            </div>
          )}

          {/* Patient Profile */}
          {activePage === "Patient Profile" && (
            currentPatient ? (
              <div className="appointment-form">
                <h3>My Patient Profile</h3>
                <form onSubmit={handleProfileUpdate}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />

                  <label>Phone Number</label>
                  <input type="tel" value={currentPatient.phone} readOnly />

                  <button type="submit">Save Changes</button>
                  {profileMessage && (
                    <p className="success-message">{profileMessage}</p>
                  )}
                </form>
              </div>
            ) : (
              <p>Please log in to view your profile.</p>
            )
          )}

          {/* Admin Login */}
          {activePage === "Admin Login" && !isAdminLoggedIn && (
            <div className="appointment-form">
              <h3>Admin Login</h3>
              <form onSubmit={handleAdminLogin}>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter admin username"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                />

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button type="submit">Login</button>
                {loginMessage && (
                  <p className="success-message">{loginMessage}</p>
                )}
              </form>
            </div>
          )}

          {/* Doctor Login */}
          {activePage === "Doctor Login" && (
            <div className="appointment-form">
              <h3>Doctor Login</h3>
              <form onSubmit={handleDoctorLogin}>
                <label>Select Doctor</label>
                <select
                  required
                  value={doctorLoginName}
                  onChange={(e) => setDoctorLoginName(e.target.value)}
                >
                  <option value="">Select Your Name</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.name} value={doctor.name}>
                      {doctor.name}
                    </option>
                  ))}
                </select>

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your personal doctor password"
                  required
                  value={doctorPassword}
                  onChange={(e) => setDoctorPassword(e.target.value)}
                />

                <button type="submit">Doctor Login</button>
                {doctorLoginMessage && (
                  <p className="success-message">{doctorLoginMessage}</p>
                )}
              </form>
            </div>
          )}

          {/* Dashboard */}
          {activePage === "Dashboard" && (
            <>
              <p>Welcome to CareConnect!</p>
              <div className="dashboard">
                <div className="dashboard-card">
                  <h3>Total Doctors</h3>
                  <h1>{doctors.length}</h1>
                </div>
                <div className="dashboard-card">
                  <h3>Registered Patients</h3>
                  <h1>{patients.length}</h1>
                </div>
                <div className="dashboard-card">
                  <h3>Appointments</h3>
                  <h1>
                    {appointments.filter(
                      (a) => !["Cancelled", "Rejected"].includes(a.status)
                    ).length}
                  </h1>
                </div>
              </div>

              {!currentPatient && (
                <div className="appointment-form">
                  <h3>New to CareConnect?</h3>
                  <p>Create an account to book your doctor consultation.</p>
                  <button onClick={() => setActivePage("Patient Register")}>
                    Register Now
                  </button>
                  <button onClick={() => setActivePage("Patient Login")}>
                    Patient Login
                  </button>
                </div>
              )}
            </>
          )}

          {/* Find Doctors */}
          {activePage === "Find Doctors" && (
            <>
              <div className="doctor-search">
                <input
                  type="text"
                  placeholder="Search doctor by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="All">All Specialties</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>

              <div className="doctor-list">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <div className="doctor-card" key={doctor.name}>
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialty}</p>
                      <p>Experience: {doctor.experience}</p>
                      <button
                        onClick={() => {
                          if (currentPatient) {
                            setBookingMessage("");
                            setActivePage("Book Appointment");
                          } else {
                            setActivePage("Patient Login");
                            setPatientAuthMessage("Please log in before booking.");
                          }
                        }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No doctors found.</p>
                )}
              </div>
            </>
          )}

          {/* Book Appointment */}
          {activePage === "Book Appointment" && (
            currentPatient ? (
              <div className="appointment-form">
                <h3>Book Your Consultation</h3>
                <p>Booking as: {currentPatient.name}</p>
                <form onSubmit={handleBooking}>
                  <label>Patient Name</label>
                  <input type="text" value={currentPatient.name} readOnly />

                  <label>Patient Age</label>
                  <input
                    type="number"
                    placeholder="Enter patient age"
                    min="1"
                    max="120"
                    required
                    value={appointment.patientAge}
                    onChange={(e) => updateAppointment("patientAge", e.target.value)}
                  />

                  <label>Phone Number</label>
                  <input type="tel" value={currentPatient.phone} readOnly />

                  <label>Gender</label>
                  <select
                    required
                    value={appointment.gender}
                    onChange={(e) => updateAppointment("gender", e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  <label>Describe Your Health Problem</label>
                  <select
                    required
                    value={appointment.problem}
                    onChange={(e) => handleProblemChange(e.target.value)}
                  >
                    <option value="">Select Your Health Problem</option>
                    <option value="Heart Problems">Heart Problems</option>
                    <option value="Skin Problems">Skin Problems</option>
                    <option value="Acne and Skin Rashes">Acne and Skin Rashes</option>
                    <option value="Child Health">Child Health</option>
                    <option value="Fever and Cold">Fever and Cold</option>
                    <option value="Headache">Headache</option>
                    <option value="Nerve Problems">Nerve Problems</option>
                    <option value="Other">Other Health Problems</option>
                  </select>

                  <label>Appointment Date</label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={appointment.date}
                    onChange={(e) => updateAppointment("date", e.target.value)}
                  />

                  <label>Available Appointment Time</label>
                  <select
                    required
                    value={appointment.time}
                    onChange={(e) => updateAppointment("time", e.target.value)}
                    disabled={!appointment.date || !appointment.doctorName}
                  >
                    <option value="">Select Available Time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>

                  {appointment.date &&
                    appointment.doctorName &&
                    availableSlots.length === 0 && (
                      <p>No available slots. Please select another date.</p>
                    )}

                  <button
                    type="submit"
                    disabled={!appointment.doctorName || !appointment.time}
                  >
                    Confirm Appointment
                  </button>
                  {bookingMessage && (
                    <p className="success-message">{bookingMessage}</p>
                  )}
                </form>
              </div>
            ) : (
              <div className="appointment-form">
                <p>Please log in to book an appointment.</p>
                <button onClick={() => setActivePage("Patient Login")}>
                  Patient Login
                </button>
              </div>
            )
          )}

          {/* My Appointments */}
          {activePage === "My Appointments" && (
            <div>
              {!currentPatient ? (
                <p>Please log in to view your appointments.</p>
              ) : myAppointments.length > 0 ? (
                myAppointments.map((item) => (
                  <div className="appointment-card" key={item.id}>
                    <h3>Appointment Details</h3>
                    <p><strong>Patient Name:</strong> {item.patientName}</p>
                    <p><strong>Age:</strong> {item.patientAge}</p>
                    <p><strong>Phone Number:</strong> {item.phone}</p>
                    <p><strong>Gender:</strong> {item.gender}</p>
                    <p><strong>Health Problem:</strong> {item.problem}</p>
                    <p><strong>Date:</strong> {item.date}</p>
                    <p><strong>Time:</strong> {item.time}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    {item.status === "Confirmed" && (
                      <button onClick={() => cancelAppointment(item.id)}>
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>You have not booked any appointments yet.</p>
              )}
            </div>
          )}

          {/* Admin-only Patients page */}
          {activePage === "Patients" && (
            isAdminLoggedIn ? (
              <div>
                <h3>Patient Management</h3>
                {appointments.length > 0 ? (
                  appointments.map((item) => (
                    <div className="appointment-card" key={item.id}>
                      <h3>{item.patientName}</h3>
                      <p>Age: {item.patientAge}</p>
                      <p>Phone: {item.phone}</p>
                      <p>Gender: {item.gender}</p>
                      <p>Health Problem: {item.problem}</p>
                      <p>Status: {item.status}</p>
                    </div>
                  ))
                ) : (
                  <p>No patient records available.</p>
                )}
              </div>
            ) : (
              <p>Please log in as admin to view patient records.</p>
            )
          )}

          {/* Admin-only Reports page */}
          {activePage === "Reports" && (
            isAdminLoggedIn ? (
              <section className="reports-page">
                <div className="reports-heading">
                  <div>
                    <h3>Appointment performance</h3>
                    <p>Review booking activity and service demand for the selected period.</p>
                  </div>
                  <button className="report-export" onClick={exportReport}>
                    Export report
                  </button>
                </div>

                <div className="report-filters" aria-label="Report filters">
                  <label>
                    From
                    <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
                  </label>
                  <label>
                    To
                    <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
                  </label>
                  <label>
                    Appointment status
                    <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)}>
                      <option>All</option>
                      {reportStatusCounts.map(({ label }) => <option key={label}>{label}</option>)}
                    </select>
                  </label>
                  <button className="report-reset" onClick={() => {
                    setReportStartDate("");
                    setReportEndDate("");
                    setReportStatus("All");
                  }}>Reset filters</button>
                </div>

                <div className="dashboard report-summary">
                  <div className="dashboard-card"><h3>Appointments</h3><h1>{reportAppointments.length}</h1></div>
                  <div className="dashboard-card"><h3>Completed</h3><h1>{reportStatusCounts.find((item) => item.label === "Completed")?.count || 0}</h1></div>
                  <div className="dashboard-card"><h3>Pending review</h3><h1>{reportStatusCounts.find((item) => item.label === "Pending")?.count || 0}</h1></div>
                  <div className="dashboard-card"><h3>Unique patients</h3><h1>{new Set(reportAppointments.map((item) => item.phone)).size}</h1></div>
                </div>

                <div className="report-panels">
                  <section className="report-panel">
                    <h3>Appointments by status</h3>
                    {reportStatusCounts.map(({ label, count }) => (
                      <div className="report-bar-row" key={label}>
                        <div className="report-bar-label"><span>{label}</span><strong>{count}</strong></div>
                        <div className="report-bar-track" aria-label={`${label}: ${count}`}>
                          <span style={{ width: `${reportAppointments.length ? (count / reportAppointments.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </section>
                  <section className="report-panel">
                    <h3>Appointments by doctor</h3>
                    {reportDoctorCounts.length ? reportDoctorCounts.map(({ label, count }) => (
                      <div className="report-doctor-row" key={label}>
                        <span>{label}</span><strong>{count}</strong>
                      </div>
                    )) : <p className="report-empty">No appointments in this period.</p>}
                  </section>
                </div>
                <p className="report-privacy">The exported report contains aggregate counts only; patient names and contact details are not included.</p>
              </section>
            ) : (
              <div className="appointment-form">
                <p>Please log in as admin to view reports.</p>
                <button onClick={() => setActivePage("Admin Login")}>Admin Login</button>
              </div>
            )
          )}

          {/* Admin Panel */}
          {activePage === "Admin Panel" && (
            isAdminLoggedIn ? (
              <div>
                <h3>Admin Dashboard</h3>
                <div className="dashboard">
                  <div className="dashboard-card">
                    <h3>Total Appointments</h3>
                    <h1>{appointments.length}</h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Pending</h3>
                    <h1>{appointments.filter((a) => a.status === "Pending").length}</h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Confirmed</h3>
                    <h1>{appointments.filter((a) => a.status === "Confirmed").length}</h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Rejected</h3>
                    <h1>{appointments.filter((a) => a.status === "Rejected").length}</h1>
                  </div>
                </div>

                <h3>Manage Appointments</h3>
                {appointments.length === 0 ? (
                  <p>No appointments available.</p>
                ) : (
                  appointments.map((item) => (
                    <div className="appointment-card" key={item.id}>
                      <h3>{item.patientName}</h3>
                      <p>Age: {item.patientAge}</p>
                      <p>Phone: {item.phone}</p>
                      <p>Problem: {item.problem}</p>
                      <p>Date: {item.date}</p>
                      <p>Time: {item.time}</p>
                      <p>Assigned Doctor: {item.doctorName || "Not assigned"}</p>
                      <p>Status: {item.status}</p>
                      {item.status === "Pending" && (
                        <>
                          <button onClick={() => approveAppointment(item.id)}>
                            Approve
                          </button>
                          <button onClick={() => rejectAppointment(item.id)}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
                <button onClick={handleAdminLogout}>Logout Admin</button>
              </div>
            ) : (
              <div>
                <p>Please log in to access the Admin Panel.</p>
                <button onClick={() => setActivePage("Admin Login")}>
                  Go to Admin Login
                </button>
              </div>
            )
          )}

          {/* Doctors Directory */}
          {activePage === "Doctors" && (
            <div>
              <h3>Doctor Management</h3>
              <div className="doctor-list">
                {doctors.map((doctor) => (
                  <div className="doctor-card" key={doctor.name}>
                    <h3>{doctor.name}</h3>
                    <p>Specialty: {doctor.specialty}</p>
                    <p>Experience: {doctor.experience}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Dashboard */}
          {activePage === "Doctor Dashboard" && (
            currentDoctor ? (
              <div>
                <h3>Welcome, {currentDoctor.name}</h3>
                <p>Specialty: {currentDoctor.specialty}</p>
                <p>Experience: {currentDoctor.experience}</p>

                <div className="dashboard">
                  <div className="dashboard-card">
                    <h3>Total Appointments</h3>
                    <h1>{doctorAppointments.length}</h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Pending</h3>
                    <h1>
                      {doctorAppointments.filter((a) => a.status === "Pending").length}
                    </h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Confirmed</h3>
                    <h1>
                      {doctorAppointments.filter((a) => a.status === "Confirmed").length}
                    </h1>
                  </div>
                  <div className="dashboard-card">
                    <h3>Completed</h3>
                    <h1>
                      {doctorAppointments.filter((a) => a.status === "Completed").length}
                    </h1>
                  </div>
                </div>

                <h3>My Assigned Appointments</h3>
                {doctorAppointments.length === 0 ? (
                  <p>No appointments assigned yet.</p>
                ) : (
                  doctorAppointments.map((item) => (
                    <div className="appointment-card" key={item.id}>
                      <h3>{item.patientName}</h3>
                      <p>Age: {item.patientAge}</p>
                      <p>Phone: {item.phone}</p>
                      <p>Gender: {item.gender}</p>
                      <p>Health Problem: {item.problem}</p>
                      <p>Date: {item.date}</p>
                      <p>Time: {item.time}</p>
                      <p>Status: <strong>{item.status}</strong></p>

                      {item.status === "Pending" && (
                        <>
                          <button onClick={() => approveAppointment(item.id)}>
                            Accept Appointment
                          </button>
                          <button onClick={() => rejectAppointment(item.id)}>
                            Reject Appointment
                          </button>
                        </>
                      )}

                      {item.status === "Confirmed" && (
                        <button onClick={() => completeAppointment(item.id)}>
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))
                )}
                <button onClick={handleDoctorLogout}>Logout Doctor</button>
              </div>
            ) : (
              <div>
                <p>Please log in to access your Doctor Dashboard.</p>
                <button onClick={() => setActivePage("Doctor Login")}>
                  Doctor Login
                </button>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
