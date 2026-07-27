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
// GLOBAL TOAST & APP POPUP NOTIFICATION CONTROLLER
// ================================================
window.showAppPopup = function(title, message, type = "success", duration = 3000) {
  const dialog = document.getElementById("appActionPopup");
  if (!dialog) return;

  const svgTick = document.getElementById("svgTickIcon");
  const svgCross = document.getElementById("svgCrossIcon");
  const titleEl = document.getElementById("popupTitle");
  const msgEl = document.getElementById("popupMessage");
  const btnClose = document.getElementById("popupBtnClose");

  dialog.className = `admin-modal app-action-modal popup-${type}`;

  if (type === "delete" || type === "error") {
    if (svgTick) svgTick.style.display = "none";
    if (svgCross) {
      svgCross.style.display = "block";
      // Re-trigger SVG stroke animation
      svgCross.replaceWith(svgCross.cloneNode(true));
    }
  } else {
    if (svgCross) svgCross.style.display = "none";
    if (svgTick) {
      svgTick.style.display = "block";
      // Re-trigger SVG stroke animation
      const newTick = svgTick.cloneNode(true);
      svgTick.replaceWith(newTick);
    }
  }

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  if (btnClose) {
    btnClose.onclick = () => {
      dialog.close();
    };
  }

  // Close on backdrop click
  dialog.onclick = (e) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!inDialog) dialog.close();
  };

  try {
    dialog.showModal();
  } catch(e) {}

  if (duration > 0) {
    setTimeout(() => {
      if (dialog.open) dialog.close();
    }, duration);
  }
};

window.showToast = function(message, type = "success", duration = 3500) {
  // Show app-like popup dialog
  const titleMap = {
    success: "Item Added Successfully!",
    delete: "Item Deleted!",
    info: "Item Updated!",
    error: "Action Failed"
  };
  window.showAppPopup(titleMap[type] || "Action Completed", message, type, duration);

  // Bottom toast notification
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
