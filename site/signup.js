/* =====================================================
   MEHNDI CORE - CUSTOMER SIGNUP
   ===================================================== */

const API_URL =
    "https://mehndi-core.onrender.com";


/* =====================================================
   ELEMENTS
   ===================================================== */

const signupForm =
    document.getElementById("customerSignupForm");

const signupName =
    document.getElementById("signupName");

const signupPhone =
    document.getElementById("signupPhone");

const signupPassword =
    document.getElementById("signupPassword");

const signupConfirmPassword =
    document.getElementById("signupConfirmPassword");

const signupButton =
    document.getElementById("signupButton");

const signupError =
    document.getElementById("signupError");

const signupSuccess =
    document.getElementById("signupSuccess");


/* =====================================================
   PHONE INPUT
   ===================================================== */

signupPhone.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 10);

    }
);


/* =====================================================
   SIGNUP FORM
   ===================================================== */

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();


        const name =
            signupName.value.trim();

        const phone =
            signupPhone.value.trim();

        const password =
            signupPassword.value;

        const confirmPassword =
            signupConfirmPassword.value;


        /* =============================================
           FRONTEND VALIDATION
           ============================================= */

        if (!name) {

            showError(
                "Please enter your full name."
            );

            signupName.focus();

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            showError(
                "Please enter a valid 10-digit mobile number."
            );

            signupPhone.focus();

            return;
        }


        if (password.length < 6) {

            showError(
                "Password must be at least 6 characters."
            );

            signupPassword.focus();

            return;
        }


        if (password !== confirmPassword) {

            showError(
                "Passwords do not match."
            );

            signupConfirmPassword.focus();

            return;
        }


        /* =============================================
           DISABLE BUTTON
           ============================================= */

        signupButton.disabled = true;

        signupButton.textContent =
            "Creating account...";


        try {

            /* =========================================
               SEND DATA TO BACKEND
               ========================================= */

            const response =
                await fetch(
                    `${API_URL}/api/customer/signup`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            phone: phone,
                            password: password
                        })
                    }
                );


            const result =
                await response.json();


            /* =========================================
               BACKEND ERROR
               ========================================= */

            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to create account."
                );

            }


            /* =========================================
               SUCCESS
               ========================================= */

            signupSuccess.textContent =
                "Account created successfully! Redirecting to login...";

            signupSuccess.classList.add(
                "show"
            );


            signupForm.reset();


            /* =========================================
               REDIRECT
               ========================================= */

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            showError(
                error.message ||
                "Something went wrong. Please try again."
            );

        }


        /* =============================================
           RESTORE BUTTON
           ============================================= */

        signupButton.disabled =
            false;

        signupButton.textContent =
            "Create Account";

    }
);


/* =====================================================
   MESSAGE HELPERS
   ===================================================== */

function showError(message) {

    signupError.textContent =
        message;

    signupError.classList.add(
        "show"
    );

}


function clearMessages() {

    signupError.textContent = "";

    signupSuccess.textContent = "";

    signupError.classList.remove(
        "show"
    );

    signupSuccess.classList.remove(
        "show"
    );

}