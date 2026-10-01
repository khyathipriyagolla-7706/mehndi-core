/* =====================================================
   MEHNDI CORE - CUSTOMER DASHBOARD
   ===================================================== */

const API_URL = "https://mehndi-core.onrender.com";

const customerToken = localStorage.getItem("customerToken");

const customerData = JSON.parse(
    localStorage.getItem("customer") || "null"
);

const welcomeElement =
    document.getElementById("customerWelcome");

const bookingsList =
    document.getElementById("bookingsList");

const bookingCount =
    document.getElementById("bookingCount");

const dashboardError =
    document.getElementById("dashboardError");

const loadingMessage =
    document.getElementById("loadingMessage");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================================
   CHECK LOGIN
   ===================================================== */

if (!customerToken) {

    window.location.href = "login.html";

} else {

    if (customerData && customerData.name) {

        welcomeElement.textContent =
            `Welcome, ${customerData.name}.`;
    }

    loadBookings();
}


/* =====================================================
   LOGOUT
   ===================================================== */

logoutButton.addEventListener("click", () => {

    localStorage.removeItem("customerToken");

    localStorage.removeItem("customer");

    localStorage.removeItem("loginRedirect");

    window.location.href = "login.html";
});


/* =====================================================
   LOAD CUSTOMER BOOKINGS
   ===================================================== */

async function loadBookings() {

    try {

        const response = await fetch(
            `${API_URL}/api/customer/bookings`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${customerToken}`
                }
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "customerToken"
                );

                localStorage.removeItem(
                    "customer"
                );

                window.location.href =
                    "login.html";

                return;
            }


            throw new Error(
                result.message ||
                "Failed to load bookings."
            );
        }


        renderBookings(
            result.bookings || []
        );

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showError(
            error.message ||
            "Unable to load your bookings."
        );


        bookingCount.textContent = "0";

    } finally {

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";
        }
    }
}


/* =====================================================
   RENDER BOOKINGS
   ===================================================== */

function renderBookings(bookings) {

    bookingsList.innerHTML = "";

    bookingCount.textContent =
        bookings.length;


    /* ---------------- EMPTY STATE ---------------- */

    if (bookings.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-bookings";


        const symbol =
            document.createElement("div");

        symbol.className =
            "empty-symbol";

        symbol.textContent = "✦";


        const title =
            document.createElement("h3");

        title.textContent =
            "No bookings yet";


        const text =
            document.createElement("p");

        text.textContent =
            "Your next beautiful mehndi appointment starts here.";


        const link =
            document.createElement("a");

        link.href =
            "booking.html";

        link.className =
            "dashboard-action primary";

        link.textContent =
            "Book Your Appointment";


        empty.append(
            symbol,
            title,
            text,
            link
        );


        bookingsList.appendChild(
            empty
        );

        return;
    }


    /* ---------------- BOOKING CARDS ---------------- */

    bookings.forEach(booking => {

        const card =
            document.createElement("article");

        card.className =
            "booking-card";


        /* ---------- TOP ---------- */

        const top =
            document.createElement("div");

        top.className =
            "booking-top";


        const heading =
            document.createElement("div");


        const service =
            document.createElement("h3");

        service.className =
            "booking-service";

        service.textContent =
            booking.service ||
            "Mehndi Service";


        const date =
            document.createElement("div");

        date.className =
            "booking-date";

        date.textContent =
            `Appointment date: ${formatDate(
                booking.date
            )}`;


        heading.append(
            service,
            date
        );


        /* ---------- STATUS ---------- */

        const status =
            document.createElement("span");


        const bookingStatus =
            booking.status ||
            "Pending";


        const normalizedStatus =
            bookingStatus.toLowerCase();


        status.className =
            `booking-status ${normalizedStatus}`;


        status.textContent =
            bookingStatus;


        top.append(
            heading,
            status
        );


        /* ---------- DETAILS ---------- */

        const details =
            document.createElement("div");

        details.className =
            "booking-details";


        details.append(

            createDetail(
                "Name",
                booking.name
            ),

            createDetail(
                "Phone",
                booking.phone
            ),

            createDetail(
                "Address",
                booking.address
            )
        );


        /* ---------- CARD CONTENT ---------- */

        card.append(

            top,

            createBookingTracker(
                bookingStatus
            ),

            details
        );


        /* ---------- NOTES ---------- */

        if (booking.notes) {

            const notes =
                document.createElement("div");

            notes.className =
                "booking-notes";


            notes.appendChild(

                createDetail(
                    "Notes",
                    booking.notes
                )
            );


            card.appendChild(
                notes
            );
        }


        bookingsList.appendChild(
            card
        );

    });
}


/* =====================================================
   CREATE BOOKING PROGRESS TRACKER
   ===================================================== */

function createBookingTracker(status) {

    const tracker =
        document.createElement("div");

    tracker.className =
        "booking-tracker";


    /* ---------------- REJECTED ---------------- */

    if (
        String(status).toLowerCase() ===
        "rejected"
    ) {

        const rejected =
            document.createElement("div");


        rejected.className =
            "tracker-rejected";


        rejected.textContent =
            "✕  Booking Rejected";


        tracker.appendChild(
            rejected
        );


        return tracker;
    }


    /* ---------------- NORMAL TRACKER ---------------- */

    const stages = [

        "Booking Received",

        "Confirmed",

        "Artist Assigned",

        "Service Completed"

    ];


    let currentStage = 0;


    const normalizedStatus =
        String(status).toLowerCase();


    if (
        normalizedStatus ===
        "confirmed"
    ) {

        currentStage = 1;
    }


    stages.forEach(
        (stage, index) => {

            const step =
                document.createElement("div");

            step.className =
                "tracker-step";


            /* ---------- STEP STATE ---------- */

            if (
                index < currentStage
            ) {

                step.classList.add(
                    "completed"
                );

            } else if (
                index === currentStage
            ) {

                step.classList.add(
                    "current"
                );
            }


            /* ---------- CIRCLE ---------- */

            const circle =
                document.createElement("div");

            circle.className =
                "tracker-circle";


            circle.textContent =
                index < currentStage
                    ? "✓"
                    : index + 1;


            /* ---------- LABEL ---------- */

            const label =
                document.createElement("span");

            label.className =
                "tracker-label";


            label.textContent =
                stage;


            step.append(
                circle,
                label
            );


            tracker.appendChild(
                step
            );


            /* ---------- CONNECTOR ---------- */

            if (
                index <
                stages.length - 1
            ) {

                const connector =
                    document.createElement("div");


                connector.className =
                    "tracker-line";


                if (
                    index < currentStage
                ) {

                    connector.classList.add(
                        "completed"
                    );
                }


                tracker.appendChild(
                    connector
                );
            }

        }
    );


    return tracker;
}


/* =====================================================
   CREATE DETAIL
   ===================================================== */

function createDetail(label, value) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "booking-detail";


    const labelElement =
        document.createElement("span");

    labelElement.className =
        "booking-detail-label";


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement("span");

    valueElement.className =
        "booking-detail-value";


    valueElement.textContent =
        value || "—";


    wrapper.append(
        labelElement,
        valueElement
    );


    return wrapper;
}


/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(dateString) {

    if (!dateString) {

        return "Not specified";
    }


    const parts =
        String(dateString).split("-");


    if (parts.length === 3) {

        const year =
            Number(parts[0]);


        const month =
            Number(parts[1]);


        const day =
            Number(parts[2]);


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }


    return dateString;
}


/* =====================================================
   SHOW ERROR
   ===================================================== */

function showError(message) {

    dashboardError.textContent =
        message;


    dashboardError.classList.add(
        "show"
    );
}