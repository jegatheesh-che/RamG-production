// ================================================
// RAMG PRODUCTION — DYNAMIC ABOUT PAGE RENDERER (MAX 10 SECTIONS)
// Syncs up to 10 custom dynamic story sections from Firestore /about/content
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

    // If dynamic sections array exists, render full dynamic story
    if (Array.isArray(data.sections) && data.sections.length > 0) {
      renderDynamicSections(data.sections);
    } else {
      // Legacy fallback
      renderLegacyAboutContent(data);
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
// RENDER DYNAMIC SECTIONS (UP TO 10)
// -----------------------------------------------
function renderDynamicSections(sections) {
  const wrapper = document.querySelector(".about-editorial-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  sections.forEach((sec, idx) => {
    const isHero = idx === 0;
    let sectionEl;

    const layout = sec.layout || (idx % 2 === 0 ? "split_right" : "split_left");

    if (isHero) {
      // Section 1 / Hero layout
      sectionEl = document.createElement("section");
      sectionEl.className = "hero__layout";

      const titleItalicHtml = sec.titleItalic ? `<div class="hero__title-wrap"><h1 class="hero__title italic">${escapeHtml(sec.titleItalic)}</h1></div>` : "";
      const extendedHtml = sec.extendedDesc && sec.extendedDesc.trim() ? `
        <div class="about-hero-ext about-expandable-box">
          <div class="about-expandable-content">
            <p class="hero__desc" style="margin-top: 12px;">${escapeHtml(sec.extendedDesc)}</p>
          </div>
          <button type="button" class="about-expand-btn">Read Full Story +</button>
        </div>
      ` : "";
      const quoteHtml = sec.quote && sec.quote.trim() ? `
        <div class="editorial-quote-box" style="margin-top: 20px;">
          <p>&ldquo;${escapeHtml(sec.quote)}&rdquo;</p>
        </div>
      ` : "";

      sectionEl.innerHTML = `
        <div class="hero__text-col">
          <p class="hero__eyebrow reveal">${escapeHtml(sec.eyebrow || 'About Me')}</p>
          <div class="hero__title-wrap">
            <h1 class="hero__title">${escapeHtml(sec.title || 'Every story')}</h1>
          </div>
          ${titleItalicHtml}
          
          <p class="hero__desc reveal reveal-delay-2">
            ${formatParagraphs(sec.desc || '')}
          </p>

          ${extendedHtml}
          ${quoteHtml}
          
          <a href="contact.html" class="hero__cta reveal reveal-delay-3" style="margin-top: 24px; display: inline-block;">Let's Tell Your Story &rarr;</a>
        </div>
        
        <div class="hero__image-col reveal">
          <div class="hero__image-wrapper">
            <img src="${sec.imageUrl || '/assets/images/ramg-prods.png'}" alt="${escapeHtml(sec.title || 'About RamG Production')}" class="hero__image" fetchpriority="high" />
          </div>
        </div>
      `;

    } else if (layout === "quote") {
      // Highlight Quote / Banner Section
      sectionEl = document.createElement("section");
      sectionEl.className = "editorial-split-section reveal";
      sectionEl.style.padding = "60px 0";

      sectionEl.innerHTML = `
        <div class="editorial-text-col" style="max-width: 900px; margin: 0 auto; text-align: center;">
          <p class="hero__eyebrow">${escapeHtml(sec.eyebrow || 'Philosophy')}</p>
          <h2 style="font-size: 2.2rem; margin-bottom: 24px;">${escapeHtml(sec.title || '')}</h2>
          <div class="editorial-quote-box" style="padding: 32px; border-left: none; border-top: 1px solid var(--gold-color, #d4af37); border-bottom: 1px solid var(--gold-color, #d4af37);">
            <p style="font-size: 1.25rem; font-style: italic;">&ldquo;${escapeHtml(sec.quote || sec.desc || '')}&rdquo;</p>
          </div>
        </div>
      `;

    } else {
      // Split Section (Image Left or Image Right)
      const isReverse = layout === "split_right";
      sectionEl = document.createElement("section");
      sectionEl.className = `editorial-split-section ${isReverse ? 'reverse' : ''} reveal`;

      const quoteBlock = sec.quote && sec.quote.trim() ? `
        <div class="editorial-quote-box">
          <p>&ldquo;${escapeHtml(sec.quote)}&rdquo;</p>
        </div>
      ` : "";

      const extendedBlock = sec.extendedDesc && sec.extendedDesc.trim() ? `
        <div class="about-phil-ext about-expandable-box" style="margin-top: 16px;">
          <div class="about-expandable-content">
            <p style="margin-top: 12px;">${escapeHtml(sec.extendedDesc)}</p>
          </div>
          <button type="button" class="about-expand-btn">Read Full Story +</button>
        </div>
      ` : "";

      const textColHtml = `
        <div class="editorial-text-col">
          <p class="hero__eyebrow">${escapeHtml(sec.eyebrow || '')}</p>
          <h2>${escapeHtml(sec.title || '')} ${sec.titleItalic ? '<em>' + escapeHtml(sec.titleItalic) + '</em>' : ''}</h2>
          ${formatParagraphs(sec.desc || '')}
          ${extendedBlock}
          ${quoteBlock}
        </div>
      `;

      const imgColHtml = `
        <div class="editorial-image-wrapper">
          <img src="${sec.imageUrl || '/assets/images/ramg-prods.png'}" alt="${escapeHtml(sec.title || 'RamG Production')}" loading="lazy" />
        </div>
      `;

      if (isReverse) {
        sectionEl.innerHTML = textColHtml + imgColHtml;
      } else {
        sectionEl.innerHTML = imgColHtml + textColHtml;
      }
    }

    wrapper.appendChild(sectionEl);
  });
}

// Format newline paragraphs cleanly
function formatParagraphs(text) {
  if (!text) return "";
  const parts = text.split("\n\n").filter(p => p.trim().length > 0);
  return parts.map(p => `<p style="margin-bottom: 16px;">${escapeHtml(p.trim())}</p>`).join("");
}

// Escape HTML special chars safely
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Legacy fallback renderer
function renderLegacyAboutContent(data) {
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
  }
}

// -----------------------------------------------
// SEE MORE / READ MORE EXPANDER TOGGLE INTERACTIVITY
// -----------------------------------------------
function initAboutExpanders() {
  const expandBtns = document.querySelectorAll(".about-expand-btn");
  expandBtns.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    if (btn.parentNode) btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      const box = newBtn.closest(".about-expandable-box");
      if (!box) return;

      const isExpanded = box.classList.contains("is-open");
      if (isExpanded) {
        box.classList.remove("is-open");
        newBtn.textContent = "Read Full Story +";
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
