import { auth } from "/js/firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorMessage = document.getElementById("errorMessage");

// Check if user is already authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/admin/";
  }
});

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.add("visible");
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("visible");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = "Authenticating...";
    btnSpinner.style.display = "inline-block";
  } else {
    btnText.textContent = "Sign In";
    btnSpinner.style.display = "none";
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Please enter both email address and password.");
    return;
  }

  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/admin/";
  } catch (error) {
    console.warn("[Auth Notice] Login attempt rejected:", error.code);
    setLoading(false);

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        showError("Invalid email address or password.");
        break;
      case "auth/invalid-email":
        showError("Please enter a valid email address.");
        break;
      case "auth/too-many-requests":
        showError("Too many failed attempts. Please wait a few moments and try again.");
        break;
      case "auth/network-request-failed":
        showError("Network error. Please check your internet connection.");
        break;
      default:
        showError("Authentication failed. Please verify your credentials.");
        break;
    }
  }
});
