const token = sessionStorage.getItem("adminToken");

const message = document.getElementById("message");
const bookingsTable = document.getElementById("bookingsTable");
const bookingsBody = document.getElementById("bookingsBody");

const totalBookings = document.getElementById("totalBookings");
const pendingBookings = document.getElementById("pendingBookings");
const confirmedBookings = document.getElementById("confirmedBookings");

const logoutBtn = document.getElementById("logoutBtn");

// Check whether admin is logged in
if (!token) {
    window.location.href = "admin.html";
}


// ========================================
// LOAD BOOKINGS
// ========================================

async function loadBookings() {

    try {

        const response = await fetch(
            "https://mehndi-core.onrender.com/api/admin/bookings",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();


        // Token invalid or expired
        if (response.status === 401) {

            sessionStorage.removeItem("adminToken");

            window.location.href = "admin.html";

            return;
        }


        // Server error
        if (!response.ok) {

            message.textContent =
                data.message || "Failed to load bookings.";

            return;
        }


        const bookings = data.bookings;


        // ========================================
        // UPDATE STATISTICS
        // ========================================

        totalBookings.textContent = bookings.length;


        const bookingReceived = bookings.filter(
            booking =>
                booking.status === "Booking Received" ||
                booking.status === "Pending"
        ).length;


        const confirmed = bookings.filter(
            booking =>
                booking.status === "Confirmed"
        ).length;


        pendingBookings.textContent = bookingReceived;
        confirmedBookings.textContent = confirmed;


        // ========================================
        // NO BOOKINGS
        // ========================================

        if (bookings.length === 0) {

            message.textContent =
                "No booking requests yet.";

            message.style.display = "block";

            bookingsTable.style.display = "none";

            return;
        }


        // ========================================
        // CLEAR OLD ROWS
        // ========================================

        bookingsBody.innerHTML = "";


        // ========================================
        // DISPLAY BOOKINGS
        // ========================================

        bookings.forEach(booking => {

            const row = document.createElement("tr");


            row.innerHTML = `
                <td>${booking.name}</td>

                <td>${booking.phone}</td>

                <td>${booking.service}</td>

                <td>${booking.date}</td>

                <td>${booking.address}</td>

                <td>${booking.notes || "-"}</td>

                <td>

                    <select
                        class="status-select"
                        data-id="${booking._id}"
                    >

                        <option
                            value="Booking Received"
                            ${booking.status === "Booking Received" ? "selected" : ""}
                        >
                            Booking Received
                        </option>


                        <option
                            value="Confirmed"
                            ${booking.status === "Confirmed" ? "selected" : ""}
                        >
                            Confirmed
                        </option>


                        <option
                            value="Artist Assigned"
                            ${booking.status === "Artist Assigned" ? "selected" : ""}
                        >
                            Artist Assigned
                        </option>


                        <option
                            value="Service Completed"
                            ${booking.status === "Service Completed" ? "selected" : ""}
                        >
                            Service Completed
                        </option>


                        <option
                            value="Rejected"
                            ${booking.status === "Rejected" ? "selected" : ""}
                        >
                            Rejected
                        </option>


                        ${
                            booking.status === "Pending"
                                ? `
                                <option
                                    value="Pending"
                                    selected
                                >
                                    Pending (Legacy)
                                </option>
                                `
                                : ""
                        }

                    </select>

                </td>
            `;


            bookingsBody.appendChild(row);


            // ========================================
            // STATUS CHANGE EVENT
            // ========================================

            const statusSelect =
                row.querySelector(".status-select");


            statusSelect.addEventListener(
                "change",
                () => {

                    updateBookingStatus(
                        statusSelect.dataset.id,
                        statusSelect.value
                    );

                }
            );

        });


        // ========================================
        // SHOW TABLE
        // ========================================

        message.style.display = "none";

        bookingsTable.style.display = "table";


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}



// ========================================
// UPDATE BOOKING STATUS
// ========================================

async function updateBookingStatus(
    bookingId,
    newStatus
) {

    try {

        const response = await fetch(
            `https://mehndi-core.onrender.com/api/admin/bookings/${bookingId}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );


        const data = await response.json();


        // ========================================
        // TOKEN INVALID
        // ========================================

        if (response.status === 401) {

            sessionStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "admin.html";

            return;
        }


        // ========================================
        // SERVER ERROR
        // ========================================

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update booking status."
            );

            return;
        }


        console.log(
            "Status updated successfully:",
            data.booking.status
        );


        // ========================================
        // RELOAD DASHBOARD
        // ========================================

        await loadBookings();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
}



// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            "adminToken"
        );

        window.location.href =
            "admin.html";
    }
);



// ========================================
// LOAD BOOKINGS WHEN PAGE OPENS
// ========================================

loadBookings();