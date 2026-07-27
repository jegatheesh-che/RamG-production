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

// ================================================
// GLOBAL TOAST NOTIFICATION CONTROLLER
// ================================================
window.showToast = function(message, type = "success", duration = 3500) {
  let container = document.getElementById("adminToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "adminToastContainer";
    container.className = "admin-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `admin-toast admin-toast--${type}`;

  const iconMap = {
    success: "✨",
    delete: "🗑️",
    info: "✏️",
    error: "⚠️"
  };
  const icon = iconMap[type] || "🔔";

  toast.innerHTML = `
    <div class="admin-toast__body">
      <span class="admin-toast__icon">${icon}</span>
      <span class="admin-toast__text">${message}</span>
    </div>
    <button type="button" class="admin-toast__close" aria-label="Close Toast">&times;</button>
    <div class="admin-toast__progress" style="animation-duration: ${duration}ms;"></div>
  `;

  const closeBtn = toast.querySelector(".admin-toast__close");
  const dismissToast = () => {
    if (toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  closeBtn.addEventListener("click", dismissToast);

  setTimeout(dismissToast, duration);
};
