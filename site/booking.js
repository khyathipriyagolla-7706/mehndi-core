/* =====================================================
   CUSTOMER LOGIN CHECK
   ===================================================== */

const customerToken = localStorage.getItem("customerToken");

if (!customerToken) {
  localStorage.setItem(
    "loginRedirect",
    "booking.html" + window.location.search
  );

  window.location.href = "login.html";
}


/* =====================================================
   CALENDAR
   ===================================================== */

const dateDisplay = document.getElementById("dateDisplay");
const dateInput = document.getElementById("date");
const calendar = document.getElementById("calendar");
const calendarDays = document.getElementById("calendarDays");
const calendarMonth = document.getElementById("calendarMonth");
const calendarYear = document.getElementById("calendarYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const today = new Date();
today.setHours(0, 0, 0, 0);

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


/* =====================================================
   RENDER CALENDAR
   ===================================================== */

function renderCalendar() {

  calendarDays.innerHTML = "";

  calendarMonth.textContent = monthNames[currentMonth];
  calendarYear.textContent = currentYear;

  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();


  // Empty spaces before first day
  for(let i = 0; i < firstDay; i++){

    const empty = document.createElement("div");

    empty.className = "calendar-day empty";

    empty.setAttribute(
      "aria-hidden",
      "true"
    );

    calendarDays.appendChild(empty);
  }


  // Calendar dates
  for(let day = 1; day <= daysInMonth; day++){

    const button = document.createElement("button");

    button.type = "button";

    button.className = "calendar-day";

    button.textContent = day;


    const date = new Date(
      currentYear,
      currentMonth,
      day
    );

    date.setHours(0, 0, 0, 0);


    // Disable previous dates
    if(date < today){

      button.classList.add("disabled");

      button.disabled = true;
    }


    // Highlight today
    if(date.getTime() === today.getTime()){

      button.classList.add("today");
    }


    // Highlight selected date
    if(
      selectedDate &&
      date.getTime() === selectedDate.getTime()
    ){

      button.classList.add("selected");

      button.setAttribute(
        "aria-current",
        "date"
      );
    }


    // Select date
    if(date >= today){

      button.addEventListener(
        "click",
        function(){

          selectedDate = new Date(date);

          const month = String(
            date.getMonth() + 1
          ).padStart(2, "0");

          const dayValue = String(
            date.getDate()
          ).padStart(2, "0");

          const year = date.getFullYear();


          dateInput.value =
            `${year}-${month}-${dayValue}`;


          dateDisplay.textContent =
            `${dayValue} ${monthNames[date.getMonth()]} ${year}`;


          dateDisplay.classList.add(
            "selected"
          );


          dateDisplay.setAttribute(
            "aria-expanded",
            "false"
          );


          calendar.classList.remove(
            "open"
          );


          renderCalendar();
        }
      );
    }


    calendarDays.appendChild(button);
  }
}


/* =====================================================
   OPEN / CLOSE CALENDAR
   ===================================================== */

dateDisplay.addEventListener(
  "click",
  function(){

    const isOpen =
      calendar.classList.toggle("open");

    dateDisplay.setAttribute(
      "aria-expanded",
      isOpen
    );

    renderCalendar();
  }
);


/* =====================================================
   PREVIOUS MONTH
   ===================================================== */

prevMonth.addEventListener(
  "click",
  function(){

    const previousMonth =
      new Date(
        currentYear,
        currentMonth - 1,
        1
      );

    const currentMonthStart =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );


    if(previousMonth >= currentMonthStart){

      currentMonth--;

      if(currentMonth < 0){

        currentMonth = 11;

        currentYear--;
      }

      renderCalendar();
    }
  }
);


/* =====================================================
   NEXT MONTH
   ===================================================== */

nextMonth.addEventListener(
  "click",
  function(){

    currentMonth++;

    if(currentMonth > 11){

      currentMonth = 0;

      currentYear++;
    }

    renderCalendar();
  }
);


/* =====================================================
   CLOSE CALENDAR WHEN CLICKING OUTSIDE
   ===================================================== */

document.addEventListener(
  "click",
  function(event){

    if(
      !event.target.closest(
        ".custom-date-picker"
      )
    ){

      calendar.classList.remove(
        "open"
      );

      dateDisplay.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }
);


/* =====================================================
   FORM
   ===================================================== */

const bookingForm =
  document.getElementById("bookingForm");

const bookingSubmit =
  document.getElementById("bookingSubmit");

const formError =
  document.getElementById("formError");

const successMessage =
  document.getElementById("successMessage");


/*
   IMPORTANT:

   The form now sends the booking
   to the Express backend.
*/

bookingForm.addEventListener(
  "submit",
  submitBooking
);


/* =====================================================
   SUBMIT BOOKING TO BACKEND
   ===================================================== */

async function submitBooking(event){

  event.preventDefault();


  // Hide old messages
  formError.classList.remove("show");

  successMessage.classList.remove("show");


  // Get form values
  const name =
    document.getElementById("name")
      .value
      .trim();

  const phone =
    document.getElementById("phone")
      .value
      .trim();

  const service =
    document.getElementById("service")
      .value;

  const date =
    document.getElementById("date")
      .value;

  const address =
    document.getElementById("address")
      .value
      .trim();

  const notes =
    document.getElementById("notes")
      .value
      .trim();


  /* =================================================
     FRONTEND VALIDATION
     ================================================= */


  // Name validation
  if(name.length < 2){

    showError(
      "Please enter your full name."
    );

    document
      .getElementById("name")
      .focus();

    return;
  }


  // Phone validation
  if(!/^[0-9]{10}$/.test(phone)){

    showError(
      "Please enter a valid 10-digit mobile number."
    );

    document
      .getElementById("phone")
      .focus();

    return;
  }


  // Date validation
  if(!date){

    showError(
      "Please select your preferred appointment date."
    );

    dateDisplay.focus();

    return;
  }


  // Address validation
  if(address.length < 5){

    showError(
      "Please enter a complete home address."
    );

    document
      .getElementById("address")
      .focus();

    return;
  }


  /* =================================================
     BOOKING DATA
     ================================================= */

  const bookingData = {

    name: name,

    phone: phone,

    service: service,

    date: date,

    address: address,

    notes: notes
  };


  /* =================================================
     SEND TO EXPRESS BACKEND
     ================================================= */

  bookingSubmit.disabled = true;

  bookingSubmit.textContent =
    "Submitting...";


  try {

    const response = await fetch(
      "https://mehndi-core.onrender.com/api/bookings",
      {
        method: "POST",

        headers: {
         "Content-Type": "application/json",
         "Authorization": "Bearer " + localStorage.getItem("customerToken")
      },

        body: JSON.stringify(
          bookingData
        )
      }
    );


    const result =
      await response.json();


    /* ===============================================
       HANDLE BACKEND ERROR
       =============================================== */

    if(!response.ok){

      throw new Error(
        result.message ||
        "Booking submission failed."
      );
    }


    /* ===============================================
       SUCCESS
       =============================================== */

    console.log(
      "Booking successfully sent to backend:",
      result
    );


    successMessage.textContent =
      "Booking request submitted successfully!";

    successMessage.classList.add(
      "show"
    );


    /* ===============================================
       RESET FORM
       =============================================== */

    bookingForm.reset();


    selectedDate = null;


    dateDisplay.textContent =
      "Select Date";


    dateDisplay.classList.remove(
      "selected"
    );


    renderCalendar();


  } catch(error){

    console.error(
      "Booking submission error:",
      error
    );


    showError(
      "Unable to submit booking. Please try again."
    );

  }


  /* =================================================
     RESTORE BUTTON
     ================================================= */

  bookingSubmit.disabled = false;

  bookingSubmit.textContent =
    "Request Appointment";
}


/* =====================================================
   SHOW FORM ERROR
   ===================================================== */

function showError(message){

  formError.textContent =
    message;

  formError.classList.add(
    "show"
  );
}


/* =====================================================
   PHONE INPUT
   ===================================================== */

document
  .getElementById("phone")
  .addEventListener(
    "input",
    function(){

      this.value =
        this.value
          .replace(/\D/g, "")
          .slice(0, 10);
    }
  );


/* =====================================================
   PRE-SELECT SERVICE FROM URL
   Example:
   booking.html?service=Bridal+Mehndi
   ===================================================== */

(function(){

  const params =
    new URLSearchParams(
      window.location.search
    );


  const service =
    params.get("service");


  if(service){

    const select =
      document.getElementById("service");


    for(
      const opt of select.options
    ){

      if(opt.value === service){

        select.value = service;

        break;
      }
    }
  }

})();


/* =====================================================
   INITIALIZE CALENDAR
   ===================================================== */

renderCalendar();