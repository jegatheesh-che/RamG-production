// ================================================
// RAMG PRODUCTION — ADMIN DASHBOARD THEME TOGGLE
// Manages Light / Dark theme switching with instant localStorage persistence
// ================================================

(function () {
  // Apply saved theme immediately on script load
  const savedTheme = localStorage.getItem("adminTheme") || "dark";
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-theme");
  } else {
    document.documentElement.classList.remove("light-theme");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.getElementById("themeToggleBtn");
    const themeLabel = document.getElementById("themeToggleLabel");
    const iconMoon = document.querySelector(".theme-icon-moon");
    const iconSun = document.querySelector(".theme-icon-sun");

    function updateUI(theme) {
      if (theme === "light") {
        document.documentElement.classList.add("light-theme");
        if (themeLabel) themeLabel.textContent = "Light";
        if (iconMoon) iconMoon.style.display = "none";
        if (iconSun) iconSun.style.display = "block";
      } else {
        document.documentElement.classList.remove("light-theme");
        if (themeLabel) themeLabel.textContent = "Dark";
        if (iconMoon) iconMoon.style.display = "block";
        if (iconSun) iconSun.style.display = "none";
      }
    }

    // Set initial toggle button state
    updateUI(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isCurrentlyLight = document.documentElement.classList.contains("light-theme");
        const newTheme = isCurrentlyLight ? "dark" : "light";
        localStorage.setItem("adminTheme", newTheme);
        updateUI(newTheme);
      });
    }
  });
})();
