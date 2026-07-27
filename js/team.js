// ================================================
// RAMG PRODUCTION — DYNAMIC FIRESTORE TEAM & ABOUT
// Syncs Team Members from Firestore /team collection
// ================================================

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadFirestoreTeam();
  initTeamInteractivity();
});

async function loadFirestoreTeam() {
  const teamGrid = document.querySelector(".team-grid");
  if (!teamGrid) return;

  try {
    const querySnapshot = await getDocs(collection(db, "team"));
    if (querySnapshot.empty) {
      console.log("[Firestore Team] Collection /team is empty. Retaining pre-hydrated team members.");
      return;
    }

    const items = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });

    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Maximum 10 items
    const limitedItems = items.slice(0, 10);

    if (limitedItems.length > 0) {
      teamGrid.innerHTML = "";

      limitedItems.forEach((item, index) => {
        const card = createTeamCardDOM(item, index);
        teamGrid.appendChild(card);
      });

      // Update subtitle counter if element exists
      const subtitleEl = document.querySelector(".team-section__subtitle");
      if (subtitleEl) {
        subtitleEl.textContent = `${limitedItems.length} passionate visual storytellers, colorists, cinematographers, and editorial directors committed to preserving your most cherished memories with fine art precision.`;
      }

      // Re-initialize interactivity & reveals
      initTeamInteractivity();

      if (typeof window.initScrollReveal === "function") {
        window.initScrollReveal();
      }
    }

  } catch (err) {
    console.warn("[Firestore Team] Displaying pre-hydrated team members:", err);
  }
}

function createTeamCardDOM(item, index = 0) {
  const card = document.createElement("article");
  
  // First 4 members are visible by default, 5-10 are extra (expanded via 'View All Team Members')
  const extraClass = index >= 4 ? "is-extra-member" : "";
  card.className = `team-card reveal ${extraClass}`;
  card.dataset.id = item.id;

  const defaultAvatar = "assets/images/r_DSC00241_full.webp";
  const avatarSrc = item.imageUrl || defaultAvatar;

  const hasFullBio = Boolean(item.fullBio && item.fullBio.trim().length > 0);

  card.innerHTML = `
    <div class="team-card__img-wrapper">
      <img src="${avatarSrc}" alt="${item.name || 'Team Member'}" class="team-card__img" loading="lazy" />
      <span class="team-card__badge">${item.badge || 'Team'}</span>
    </div>
    <div class="team-card__content">
      <h3 class="team-card__name">${item.name || 'Team Member'}</h3>
      <p class="team-card__role">${item.role || 'Visual Storyteller'}</p>
      <p class="team-card__bio-short">${item.shortBio || ''}</p>
      ${hasFullBio ? `
        <div class="team-card__bio-full">
          <p class="team-card__bio-full-text">${item.fullBio}</p>
        </div>
        <button class="team-card__bio-toggle" type="button">Read Full Bio +</button>
      ` : ''}
    </div>
  `;

  return card;
}

function initTeamInteractivity() {
  const teamSection = document.querySelector(".team-section");
  if (!teamSection) return;

  const expandBtn = document.getElementById("teamExpandBtn");
  const bioToggleBtns = teamSection.querySelectorAll(".team-card__bio-toggle");

  if (expandBtn) {
    // Hide expand button if total cards <= 4
    const totalCards = teamSection.querySelectorAll(".team-card").length;
    if (totalCards <= 4) {
      expandBtn.style.display = "none";
    } else {
      expandBtn.style.display = "inline-flex";
    }

    // Remove old listeners by cloning
    const newExpandBtn = expandBtn.cloneNode(true);
    expandBtn.parentNode.replaceChild(newExpandBtn, expandBtn);

    newExpandBtn.addEventListener("click", () => {
      const isExpanded = teamSection.classList.contains("is-expanded");
      const btnText = newExpandBtn.querySelector("span");

      if (isExpanded) {
        teamSection.classList.remove("is-expanded");
        if (btnText) btnText.textContent = `View All ${totalCards} Team Members`;
        teamSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        teamSection.classList.add("is-expanded");
        if (btnText) btnText.textContent = "Show Less Team Members";
      }

      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => ScrollTrigger.refresh(), 400);
      }
    });
  }

  bioToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".team-card");
      if (!card) return;

      const isBioExpanded = card.classList.contains("is-bio-expanded");
      if (isBioExpanded) {
        card.classList.remove("is-bio-expanded");
        btn.textContent = "Read Full Bio +";
      } else {
        card.classList.add("is-bio-expanded");
        btn.textContent = "Read Less -";
      }

      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => ScrollTrigger.refresh(), 400);
      }
    });
  });
}
