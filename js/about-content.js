// ================================================
// RAMG PRODUCTION — DYNAMIC ABOUT PAGE CONTENT & SEE MORE
// Syncs Section 1 (Hero Split) and Section 2 (Philosophy Split)
// ================================================

import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadFirestoreAboutContent();
  initAboutExpanders();
});

async function loadFirestoreAboutContent() {
  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("[About Content] Using default pre-hydrated About content.");
      return;
    }

    const data = docSnap.data();

    // -----------------------------------------------
    // UPDATE SECTION 1: HERO SPLIT ("About Me")
    // -----------------------------------------------
    const heroLayout = document.querySelector(".hero__layout");
    if (heroLayout) {
      const eyebrow = heroLayout.querySelector(".hero__eyebrow");
      if (eyebrow && data.heroEyebrow) eyebrow.textContent = data.heroEyebrow;

      const titles = heroLayout.querySelectorAll(".hero__title");
      if (titles.length >= 1 && data.heroTitle) titles[0].textContent = data.heroTitle;
      if (titles.length >= 2 && data.heroTitleItalic) titles[1].textContent = data.heroTitleItalic;

      const desc = heroLayout.querySelector(".hero__desc");
      if (desc && data.heroDesc) desc.textContent = data.heroDesc;

      const heroImg = heroLayout.querySelector(".hero__image");
      if (heroImg && data.heroImageUrl) heroImg.src = data.heroImageUrl;

      // Handle Extended Hero Story ("See More")
      if (data.heroExtendedDesc && data.heroExtendedDesc.trim().length > 0) {
        let extContainer = heroLayout.querySelector(".about-hero-ext");
        if (!extContainer) {
          extContainer = document.createElement("div");
          extContainer.className = "about-hero-ext about-expandable-box";
          const cta = heroLayout.querySelector(".hero__cta");
          if (cta) {
            heroLayout.querySelector(".hero__text-col").insertBefore(extContainer, cta);
          } else {
            heroLayout.querySelector(".hero__text-col").appendChild(extContainer);
          }
        }
        extContainer.innerHTML = `
          <div class="about-expandable-content">
            <p class="hero__desc" style="margin-top: 12px;">${data.heroExtendedDesc}</p>
          </div>
          <button type="button" class="about-expand-btn">Read Full Story +</button>
        `;
      }
    }

    // -----------------------------------------------
    // UPDATE SECTION 2: PHILOSOPHY SPLIT ("My Philosophy")
    // -----------------------------------------------
    const philSection = document.querySelector(".editorial-split-section");
    if (philSection) {
      const philEyebrow = philSection.querySelector(".hero__eyebrow");
      if (philEyebrow && data.philEyebrow) philEyebrow.textContent = data.philEyebrow;

      const philHeading = philSection.querySelector("h2");
      if (philHeading && data.philTitle) philHeading.textContent = data.philTitle;

      const textCol = philSection.querySelector(".editorial-text-col");
      if (textCol) {
        const paragraphs = textCol.querySelectorAll("p:not(.editorial-quote-box p)");
        if (paragraphs.length >= 1 && data.philText1) paragraphs[0].textContent = data.philText1;
        if (paragraphs.length >= 2 && data.philText2) paragraphs[1].textContent = data.philText2;
      }

      const quoteP = philSection.querySelector(".editorial-quote-box p");
      if (quoteP && data.philQuote) quoteP.innerHTML = `&ldquo;${data.philQuote}&rdquo;`;

      const philImg = philSection.querySelector(".editorial-image-wrapper img");
      if (philImg && data.philImageUrl) philImg.src = data.philImageUrl;

      // Handle Extended Philosophy Story ("See More")
      if (data.philExtendedText && data.philExtendedText.trim().length > 0) {
        let philExtContainer = philSection.querySelector(".about-phil-ext");
        if (!philExtContainer) {
          philExtContainer = document.createElement("div");
          philExtContainer.className = "about-phil-ext about-expandable-box";
          const quoteBox = philSection.querySelector(".editorial-quote-box");
          if (quoteBox && textCol) {
            textCol.insertBefore(philExtContainer, quoteBox);
          }
        }
        philExtContainer.innerHTML = `
          <div class="about-expandable-content">
            <p style="margin-top: 12px;">${data.philExtendedText}</p>
          </div>
          <button type="button" class="about-expand-btn">Read Full Philosophy +</button>
        `;
      }
    }

    initAboutExpanders();

    if (typeof window.initScrollReveal === "function") {
      window.initScrollReveal();
    }

  } catch (err) {
    console.warn("[About Content] Notice loading Firestore content:", err);
  }
}

// -----------------------------------------------
// SEE MORE / READ MORE EXPANDER TOGGLE INTERACTIVITY
// -----------------------------------------------
function initAboutExpanders() {
  const expandBtns = document.querySelectorAll(".about-expand-btn");
  expandBtns.forEach((btn) => {
    // Clone to prevent duplicate listeners
    const newBtn = btn.cloneNode(true);
    if (btn.parentNode) btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      const box = newBtn.closest(".about-expandable-box");
      if (!box) return;

      const isExpanded = box.classList.contains("is-open");
      if (isExpanded) {
        box.classList.remove("is-open");
        newBtn.textContent = newBtn.textContent.includes("Philosophy") ? "Read Full Philosophy +" : "Read Full Story +";
      } else {
        box.classList.add("is-open");
        newBtn.textContent = "Read Less -";
      }

      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => ScrollTrigger.refresh(), 400);
      }
    });
  });
}
