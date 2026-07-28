// ================================================
// RAMG PRODUCTION — DYNAMIC ABOUT PAGE SECTION BUILDER (MAX 10)
// Manages dynamic story sections array with Cloudinary upload & Firestore sync
// ================================================

import { auth, db } from "/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUD_NAME = "dxbdobdxt";
const UPLOAD_PRESET = "website_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Max Sections Limit
const MAX_SECTIONS = 10;

// Navigation Tabs
const tabGallery = document.getElementById("tabGallery");
const tabReviews = document.getElementById("tabReviews");
const tabAbout = document.getElementById("tabAbout");
const sectionGallery = document.getElementById("sectionGallery");
const sectionReviews = document.getElementById("sectionReviews");
const sectionAbout = document.getElementById("sectionAbout");

// Form Elements
const aboutForm = document.getElementById("aboutContentForm");
const aboutFormError = document.getElementById("aboutFormError");
const aboutSubmitBtn = document.getElementById("aboutSubmitBtn");
const aboutLoadingState = document.getElementById("adminAboutLoading");
const sectionsContainer = document.getElementById("adminAboutSectionsContainer");
const btnAddSection = document.getElementById("btnAddAboutSection");
const sectionCounter = document.getElementById("adminAboutSectionCounter");

// State: List of About Page Sections (Max 10)
let sectionsList = [];

// Default Seed Sections
const DEFAULT_SECTIONS = [
  {
    id: "sec_hero",
    layout: "split_right",
    eyebrow: "About Me",
    title: "Every story",
    titleItalic: "deserves to be remembered.",
    desc: "My journey into photography and filmmaking began in 2018, when I discovered that a single photograph could preserve a feeling forever and a single video could bring those emotions back to life. What started as a passion quickly became my purpose.",
    extendedDesc: "Over the years, I have honed my artistic vision across Belgium, France, and international luxury destinations, blending documentary realism with high-fashion magazine styling to craft heirloom portraits.",
    imageUrl: "/assets/images/r_DSC00241_full.webp",
    quote: ""
  },
  {
    id: "sec_philosophy",
    layout: "split_left",
    eyebrow: "My Philosophy",
    title: "Genuine Moments — Authentic Emotions",
    titleItalic: "",
    desc: "Since then, I have dedicated myself to capturing genuine moments, authentic emotions, and meaningful stories. For me, photography and videography are not just about creating beautiful images—they are about preserving memories that will be treasured for generations.\n\nOne of the things I value most is the connection I build with every client. I believe the best moments happen when people feel comfortable, understood, and truly themselves.",
    extendedDesc: "We work seamlessly with event coordinators, floral artists, and venue directors to ensure a serene, unhurried atmosphere on your wedding day.",
    imageUrl: "/assets/images/excellents/DSC08698-2.webp",
    quote: "That’s why I take the time to listen, understand your vision, and create an experience that feels natural, relaxed, and enjoyable from beginning to end."
  },
  {
    id: "sec_journey",
    layout: "split_right",
    eyebrow: "My Journey",
    title: "Growth & Dedication",
    titleItalic: "",
    desc: "Every wedding, event, portrait, and celebration has taught me something new. Each client has helped shape my creative journey, and every experience has made me a better photographer, filmmaker, and storyteller.\n\nMy goal is simple: to create timeless photographs and cinematic films that allow you to relive your most precious moments exactly as they felt.",
    extendedDesc: "When you choose to work with me, you’re choosing someone who genuinely cares about your story, values your memories, and is committed to capturing them with creativity, passion, and authenticity.",
    imageUrl: "/assets/images/excellents/slide4.webp",
    quote: ""
  }
];

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadAboutContent();
  }
});

// Tab Switching Setup
function setupTabs() {
  const tabs = [
    { btn: tabGallery, sec: sectionGallery },
    { btn: tabReviews, sec: sectionReviews },
    { btn: tabAbout, sec: sectionAbout }
  ];

  tabs.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener("click", () => {
        tabs.forEach(t => {
          if (t.btn) t.btn.classList.remove("active");
          if (t.sec) t.sec.style.display = "none";
        });
        item.btn.classList.add("active");
        if (item.sec) item.sec.style.display = "block";
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupTabs);
} else {
  setupTabs();
}

// ================================================
// LOAD ABOUT CONTENT FROM FIRESTORE
// ================================================
async function loadAboutContent() {
  if (!aboutForm) return;

  if (aboutLoadingState) aboutLoadingState.style.display = "block";
  aboutForm.style.display = "none";
  if (aboutFormError) aboutFormError.style.display = "none";

  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().sections) && docSnap.data().sections.length > 0) {
      sectionsList = docSnap.data().sections.slice(0, MAX_SECTIONS);
    } else {
      console.log("[Admin About] Using default 3 initial sections...");
      sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
      await setDoc(docRef, { sections: sectionsList, updatedAt: serverTimestamp() });
    }

    renderAboutSections();

    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";

  } catch (err) {
    console.error("[Admin About] Load error:", err);
    sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    renderAboutSections();
    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";
  }
}

// Update Section Counter & Add Button State
function updateCounter() {
  if (sectionCounter) {
    sectionCounter.textContent = `${sectionsList.length} / ${MAX_SECTIONS} Sections`;
  }
  if (btnAddSection) {
    btnAddSection.disabled = sectionsList.length >= MAX_SECTIONS;
  }
}

// ================================================
// RENDER DYNAMIC SECTION CARDS IN ADMIN PANEL
// ================================================
function renderAboutSections() {
  if (!sectionsContainer) return;
  sectionsContainer.innerHTML = "";

  updateCounter();

  sectionsList.forEach((sec, idx) => {
    const card = document.createElement("div");
    card.className = "about-section-card";
    card.dataset.index = idx;

    const isFirst = idx === 0;
    const isLast = idx === sectionsList.length - 1;

    card.innerHTML = `
      <div class="about-section-card__header">
        <div class="about-section-card__title-group">
          <span class="about-section-card__badge">Section ${idx + 1}</span>
          <h3 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--clr-white);">
            ${sec.eyebrow || 'New Story Section'} ${sec.title ? '&mdash; ' + sec.title : ''}
          </h3>
        </div>

        <div class="about-section-card__actions">
          <button type="button" class="btn-icon-action btn-move-up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Move Up">&uarr;</button>
          <button type="button" class="btn-icon-action btn-move-down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Move Down">&darr;</button>
          <button type="button" class="btn-icon-action btn-icon-delete btn-delete-sec" data-index="${idx}" title="Delete Section">&times;</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label>Eyebrow Tagline *</label>
          <input type="text" class="sec-input-eyebrow" value="${sec.eyebrow || ''}" placeholder="e.g., My Philosophy" required />
        </div>

        <div class="form-group">
          <label>Layout Style *</label>
          <select class="sec-input-layout" style="background: var(--clr-bg-input); color: var(--clr-white); border: 1px solid var(--clr-border); padding: 12px; border-radius: 8px;">
            <option value="split_right" ${sec.layout === 'split_right' ? 'selected' : ''}>Split (Text Left, Image Right)</option>
            <option value="split_left" ${sec.layout === 'split_left' ? 'selected' : ''}>Split (Image Left, Text Right)</option>
            <option value="quote" ${sec.layout === 'quote' ? 'selected' : ''}>Highlight Quote / Philosophy Banner</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label>Main Title (Regular) *</label>
          <input type="text" class="sec-input-title" value="${sec.title || ''}" placeholder="e.g., Genuine Moments" required />
        </div>

        <div class="form-group">
          <label>Title Accent / Subtitle (Italic)</label>
          <input type="text" class="sec-input-title-italic" value="${sec.titleItalic || ''}" placeholder="e.g., Authentic Emotions" />
        </div>
      </div>

      <div class="form-group">
        <label>Main Story Text (Always Visible) *</label>
        <textarea class="admin-textarea sec-input-desc" rows="3" placeholder="Enter main section narrative..." required>${sec.desc || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Extended Story Text (Revealed via 'Read Full Story +')</label>
        <textarea class="admin-textarea sec-input-extended" rows="3" placeholder="Optional extra paragraphs for 'Read Full Story +' toggle...">${sec.extendedDesc || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Highlighted Quote Box (Optional)</label>
        <textarea class="admin-textarea sec-input-quote" rows="2" placeholder="Optional quote block inside section...">${sec.quote || ''}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 120px; gap: 16px; align-items: end;">
        <div class="form-group">
          <label>Section Image (Upload File)</label>
          <input type="file" class="sec-input-file" accept="image/*" />
          <label style="margin-top: 8px;">Or Image Path / URL</label>
          <input type="text" class="sec-input-img-url" value="${sec.imageUrl || ''}" placeholder="e.g., /assets/images/excellents/slide4.webp" />
        </div>

        <div style="text-align: center;">
          <p style="font-size: 0.75rem; color: var(--clr-muted); margin-bottom: 4px;">Preview</p>
          <img class="sec-img-preview" src="${sec.imageUrl || '/assets/images/ramg-prods.png'}" alt="Preview" style="width: 100px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid var(--clr-gold);" />
        </div>
      </div>
    `;

    sectionsContainer.appendChild(card);
  });

  attachCardEvents();
}

// Event Listeners for Dynamic Cards
function attachCardEvents() {
  // Move Up
  document.querySelectorAll(".btn-move-up").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx > 0) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx - 1];
        sectionsList[idx - 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Move Down
  document.querySelectorAll(".btn-move-down").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx < sectionsList.length - 1) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx + 1];
        sectionsList[idx + 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Delete
  document.querySelectorAll(".btn-delete-sec").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (confirm(`Are you sure you want to delete Section ${idx + 1}?`)) {
        saveCurrentInputValues();
        sectionsList.splice(idx, 1);
        renderAboutSections();
      }
    });
  });

  // Live Image Preview Update on URL input
  document.querySelectorAll(".sec-input-img-url").forEach(input => {
    input.addEventListener("input", (e) => {
      const card = e.target.closest(".about-section-card");
      if (card) {
        const preview = card.querySelector(".sec-img-preview");
        if (preview) preview.src = e.target.value.trim() || '/assets/images/ramg-prods.png';
      }
    });
  });
}

// Sync current input fields into sectionsList array memory before re-ordering/deleting
function saveCurrentInputValues() {
  const cards = document.querySelectorAll(".about-section-card");
  cards.forEach((card, idx) => {
    if (sectionsList[idx]) {
      sectionsList[idx].eyebrow = card.querySelector(".sec-input-eyebrow")?.value.trim() || "";
      sectionsList[idx].layout = card.querySelector(".sec-input-layout")?.value || "split_right";
      sectionsList[idx].title = card.querySelector(".sec-input-title")?.value.trim() || "";
      sectionsList[idx].titleItalic = card.querySelector(".sec-input-title-italic")?.value.trim() || "";
      sectionsList[idx].desc = card.querySelector(".sec-input-desc")?.value.trim() || "";
      sectionsList[idx].extendedDesc = card.querySelector(".sec-input-extended")?.value.trim() || "";
      sectionsList[idx].quote = card.querySelector(".sec-input-quote")?.value.trim() || "";
      sectionsList[idx].imageUrl = card.querySelector(".sec-input-img-url")?.value.trim() || "";
    }
  });
}

// Add New Section Handler (Max 10)
if (btnAddSection) {
  btnAddSection.addEventListener("click", () => {
    if (sectionsList.length >= MAX_SECTIONS) {
      alert("Maximum limit of 10 sections reached.");
      return;
    }
    saveCurrentInputValues();
    const newIdx = sectionsList.length + 1;
    sectionsList.push({
      id: `sec_${Date.now()}`,
      layout: newIdx % 2 === 0 ? "split_left" : "split_right",
      eyebrow: `Story Section ${newIdx}`,
      title: "New Story Title",
      titleItalic: "",
      desc: "Enter main section narrative here...",
      extendedDesc: "",
      imageUrl: "/assets/images/excellents/slide5.webp",
      quote: ""
    });
    renderAboutSections();
  });
}

// Upload helper for Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary.");
  }

  const data = await res.json();
  return data.secure_url;
}

// ================================================
// SAVE ALL ABOUT SECTIONS TO FIRESTORE
// ================================================
if (aboutForm) {
  aboutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (aboutFormError) aboutFormError.style.display = "none";
    if (aboutSubmitBtn) {
      aboutSubmitBtn.disabled = true;
      aboutSubmitBtn.textContent = "Saving All Sections...";
    }

    try {
      saveCurrentInputValues();

      const cards = document.querySelectorAll(".about-section-card");
      
      // Process Cloudinary file uploads for each section
      for (let i = 0; i < cards.length; i++) {
        const fileInput = cards[i].querySelector(".sec-input-file");
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
          sectionsList[i].imageUrl = uploadedUrl;
        }
      }

      const payload = {
        sections: sectionsList,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "about", "content"), payload);

      renderAboutSections();

      if (window.showAppPopup) {
        window.showAppPopup("About Story Saved", `Successfully updated ${sectionsList.length} sections on the About page!`, "edit");
      }

    } catch (err) {
      console.error("[Admin About] Save error:", err);
      if (aboutFormError) {
        aboutFormError.textContent = `Save failed: ${err.message}`;
        aboutFormError.style.display = "block";
      }
    } finally {
      if (aboutSubmitBtn) {
        aboutSubmitBtn.disabled = false;
        aboutSubmitBtn.textContent = "Save All About Sections";
      }
    }
  });
}
