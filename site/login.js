```js
/* =====================================================
   MEHNDI CORE LOGIN
   ===================================================== */

const API_URL =
  "https://mehndi-core.onrender.com";


/* =====================================================
   ELEMENTS
   ===================================================== */

const customerTab =
  document.getElementById("customerTab");

const adminTab =
  document.getElementById("adminTab");

const customerLoginSection =
  document.getElementById("customerLoginSection");

const adminLoginSection =
  document.getElementById("adminLoginSection");

const customerLoginForm =
  document.getElementById("customerLoginForm");

const adminLoginForm =
  document.getElementById("adminLoginForm");

const customerLoginError =
  document.getElementById("customerLoginError");

const adminLoginError =
  document.getElementById("adminLoginError");

const customerLoginButton =
  document.getElementById("customerLoginButton");

const adminLoginButton =
  document.getElementById("adminLoginButton");

const customerPhone =
  document.getElementById("customerPhone");


/* =====================================================
   SWITCH TO CUSTOMER
   ===================================================== */

customerTab.addEventListener(
  "click",
  function(){

    customerTab.classList.add("active");

    adminTab.classList.remove("active");

    customerLoginSection.hidden = false;

    adminLoginSection.hidden = true;

    clearErrors();

  }
);


/* =====================================================
   SWITCH TO ADMIN
   ===================================================== */

adminTab.addEventListener(
  "click",
  function(){

    adminTab.classList.add("active");

    customerTab.classList.remove("active");

    adminLoginSection.hidden = false;

    customerLoginSection.hidden = true;

    clearErrors();

  }
);


/* =====================================================
   CUSTOMER PHONE INPUT
   ===================================================== */

customerPhone.addEventListener(
  "input",
  function(){

    this.value =
      this.value
        .replace(/\D/g, "")
        .slice(0, 10);

  }
);


/* =====================================================
   CUSTOMER LOGIN
   ===================================================== */

customerLoginForm.addEventListener(
  "submit",
  async function(event){

    event.preventDefault();

    clearErrors();


    const phone =
      customerPhone.value.trim();

    const password =
      document
        .getElementById("customerPassword")
        .value;


    /* ===============================================
       FRONTEND VALIDATION
       =============================================== */

    if(!/^[0-9]{10}$/.test(phone)){

      showCustomerError(
        "Please enter a valid 10-digit mobile number."
      );

      customerPhone.focus();

      return;

    }


    if(!password){

      showCustomerError(
        "Please enter your password."
      );

      document
        .getElementById("customerPassword")
        .focus();

      return;

    }


    /* ===============================================
       DISABLE BUTTON
       =============================================== */

    customerLoginButton.disabled = true;

    customerLoginButton.textContent =
      "Logging in...";


    try{

      const response =
        await fetch(
          `${API_URL}/api/customer/login`,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
              phone:phone,
              password:password
            })
          }
        );


      const result =
        await response.json();


      /* =============================================
         BACKEND ERROR
         ============================================= */

      if(!response.ok){

        throw new Error(
          result.message ||
          "Customer login failed."
        );

      }


      /* =============================================
         SAVE CUSTOMER SESSION
         ============================================= */

      localStorage.setItem(
        "customerToken",
        result.token
      );


      localStorage.setItem(
        "customer",
        JSON.stringify(
          result.customer
        )
      );


      /* =============================================
         REDIRECT
         ============================================= */

      const redirect =
        localStorage.getItem(
          "loginRedirect"
        );


      localStorage.removeItem(
        "loginRedirect"
      );


      if(redirect){

        window.location.href =
          redirect;

      }else{

        window.location.href =
          "customer-dashboard.html";

      }


    }catch(error){

      console.error(
        "Customer login error:",
        error
      );


      showCustomerError(
        error.message ||
        "Unable to login. Please try again."
      );

    }


    /* =============================================
       RESTORE BUTTON
       ============================================= */

    customerLoginButton.disabled =
      false;

    customerLoginButton.textContent =
      "Login as Customer";

  }
);


/* =====================================================
   ADMIN LOGIN
   ===================================================== */

adminLoginForm.addEventListener(
  "submit",
  async function(event){

    event.preventDefault();

    clearErrors();


    const username =
      document
        .getElementById("adminUsername")
        .value
        .trim();

    const password =
      document
        .getElementById("adminPassword")
        .value;


    /* ===============================================
       FRONTEND VALIDATION
       =============================================== */

    if(!username){

      showAdminError(
        "Please enter the admin username."
      );

      return;

    }


    if(!password){

      showAdminError(
        "Please enter the admin password."
      );

      return;

    }


    /* ===============================================
       DISABLE BUTTON
       =============================================== */

    adminLoginButton.disabled = true;

    adminLoginButton.textContent =
      "Logging in...";


    try{

      const response =
        await fetch(
          `${API_URL}/api/admin/login`,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
              username:username,
              password:password
            })
          }
        );


      const result =
        await response.json();


      /* =============================================
         BACKEND ERROR
         ============================================= */

      if(!response.ok){

        throw new Error(
          result.message ||
          "Admin login failed."
        );

      }


      /* =============================================
         SAVE ADMIN TOKEN
         ============================================= */

      sessionStorage.setItem(
        "adminToken",
        result.token
      );


      /* =============================================
         REDIRECT TO ADMIN DASHBOARD
         ============================================= */

      window.location.href =
        "dashboard.html";


    }catch(error){

      console.error(
        "Admin login error:",
        error
      );


      showAdminError(
        error.message ||
        "Unable to login. Please try again."
      );

    }


    /* =============================================
       RESTORE BUTTON
       ============================================= */

    adminLoginButton.disabled =
      false;

    adminLoginButton.textContent =
      "Login as Admin";

  }
);


/* =====================================================
   ERROR HELPERS
   ===================================================== */

function showCustomerError(message){

  customerLoginError.textContent =
    message;

  customerLoginError.classList.add(
    "show"
  );

}


function showAdminError(message){

  adminLoginError.textContent =
    message;

  adminLoginError.classList.add(
    "show"
  );

}


function clearErrors(){

  customerLoginError.textContent = "";

  adminLoginError.textContent = "";

  customerLoginError.classList.remove(
    "show"
  );

  adminLoginError.classList.remove(
    "show"
  );

}
```
