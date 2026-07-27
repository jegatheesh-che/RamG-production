import { auth } from "/js/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Enforce Firebase Authentication guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Unauthenticated user -> Redirect to login
    window.location.href = "/admin/login";
  } else {
    // Authenticated user -> Render dashboard
    if (userEmail) {
      userEmail.textContent = user.email || "Authenticated Admin";
    }
    document.body.classList.add("auth-ready");
  }
});

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("[Auth Error] Sign out failed:", error);
    }
  });
}
