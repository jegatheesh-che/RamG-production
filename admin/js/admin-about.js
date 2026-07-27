// ================================================
// RAMG PRODUCTION — ADMIN ABOUT PAGE CONTENT MANAGER
// Manage Section 1 (Hero Split) & Section 2 (Philosophy Split)
// ================================================

import { auth, db } from "/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUD_NAME = "dxbdobdxt";
const UPLOAD_PRESET = "website_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

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

// Inputs - Section 1 (Hero Split)
const inputHeroEyebrow = document.getElementById("aboutHeroEyebrow");
const inputHeroTitle = document.getElementById("aboutHeroTitle");
const inputHeroTitleItalic = document.getElementById("aboutHeroTitleItalic");
const inputHeroDesc = document.getElementById("aboutHeroDesc");
const inputHeroExtendedDesc = document.getElementById("aboutHeroExtendedDesc");
const inputHeroImageFile = document.getElementById("aboutHeroImageFile");
const inputHeroImageUrl = document.getElementById("aboutHeroImageUrl");
const imgPreviewHero = document.getElementById("imgPreviewHero");

// Inputs - Section 2 (Philosophy Split)
const inputPhilEyebrow = document.getElementById("aboutPhilEyebrow");
const inputPhilTitle = document.getElementById("aboutPhilTitle");
const inputPhilText1 = document.getElementById("aboutPhilText1");
const inputPhilText2 = document.getElementById("aboutPhilText2");
const inputPhilExtendedText = document.getElementById("aboutPhilExtendedText");
const inputPhilQuote = document.getElementById("aboutPhilQuote");
const inputPhilImageFile = document.getElementById("aboutPhilImageFile");
const inputPhilImageUrl = document.getElementById("aboutPhilImageUrl");
const imgPreviewPhil = document.getElementById("imgPreviewPhil");

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

// Default Seed Content
const DEFAULT_ABOUT_CONTENT = {
  // Section 1
  heroEyebrow: "About Me",
  heroTitle: "Every story",
  heroTitleItalic: "deserves to be remembered.",
  heroDesc: "My journey into photography and filmmaking began in 2018, when I discovered that a single photograph could preserve a feeling forever and a single video could bring those emotions back to life. What started as a passion quickly became my purpose.",
  heroExtendedDesc: "Over the years, I have honed my artistic vision across Belgium, France, and international luxury destinations, blending documentary realism with high-fashion magazine styling to craft heirloom portraits.",
  heroImageUrl: "assets/images/r_DSC00241_full.webp",

  // Section 2
  philEyebrow: "My Philosophy",
  philTitle: "Genuine Moments — Authentic Emotions",
  philText1: "Since then, I have dedicated myself to capturing genuine moments, authentic emotions, and meaningful stories. For me, photography and videography are not just about creating beautiful images—they are about preserving memories that will be treasured for generations.",
  philText2: "One of the things I value most is the connection I build with every client. I believe the best moments happen when people feel comfortable, understood, and truly themselves.",
  philExtendedText: "We work seamlessly with event coordinators, floral artists, and venue directors to ensure a serene, unhurried atmosphere on your wedding day.",
  philQuote: "That’s why I take the time to listen, understand your vision, and create an experience that feels natural, relaxed, and enjoyable from beginning to end.",
  philImageUrl: "assets/images/excellents/DSC08698-2.webp"
};

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

    let data = DEFAULT_ABOUT_CONTENT;

    if (docSnap.exists()) {
      data = { ...DEFAULT_ABOUT_CONTENT, ...docSnap.data() };
    } else {
      console.log("[Admin About] /about/content document does not exist. Saving defaults...");
      await setDoc(docRef, { ...DEFAULT_ABOUT_CONTENT, updatedAt: serverTimestamp() });
    }

    populateForm(data);

    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";

  } catch (err) {
    console.error("[Admin About] Load error:", err);
    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";
    if (aboutFormError) {
      aboutFormError.textContent = `Notice: Using default content (${err.message})`;
      aboutFormError.style.display = "block";
    }
  }
}

function populateForm(data) {
  // Section 1
  if (inputHeroEyebrow) inputHeroEyebrow.value = data.heroEyebrow || "";
  if (inputHeroTitle) inputHeroTitle.value = data.heroTitle || "";
  if (inputHeroTitleItalic) inputHeroTitleItalic.value = data.heroTitleItalic || "";
  if (inputHeroDesc) inputHeroDesc.value = data.heroDesc || "";
  if (inputHeroExtendedDesc) inputHeroExtendedDesc.value = data.heroExtendedDesc || "";
  if (inputHeroImageUrl) inputHeroImageUrl.value = data.heroImageUrl || "";
  if (imgPreviewHero && data.heroImageUrl) imgPreviewHero.src = data.heroImageUrl;

  // Section 2
  if (inputPhilEyebrow) inputPhilEyebrow.value = data.philEyebrow || "";
  if (inputPhilTitle) inputPhilTitle.value = data.philTitle || "";
  if (inputPhilText1) inputPhilText1.value = data.philText1 || "";
  if (inputPhilText2) inputPhilText2.value = data.philText2 || "";
  if (inputPhilExtendedText) inputPhilExtendedText.value = data.philExtendedText || "";
  if (inputPhilQuote) inputPhilQuote.value = data.philQuote || "";
  if (inputPhilImageUrl) inputPhilImageUrl.value = data.philImageUrl || "";
  if (imgPreviewPhil && data.philImageUrl) imgPreviewPhil.src = data.philImageUrl;
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
// SAVE / UPDATE ABOUT CONTENT IN FIRESTORE
// ================================================
if (aboutForm) {
  aboutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (aboutFormError) aboutFormError.style.display = "none";
    if (aboutSubmitBtn) {
      aboutSubmitBtn.disabled = true;
      aboutSubmitBtn.textContent = "Saving Changes...";
    }

    try {
      let finalHeroImageUrl = inputHeroImageUrl ? inputHeroImageUrl.value.trim() : "";
      let finalPhilImageUrl = inputPhilImageUrl ? inputPhilImageUrl.value.trim() : "";

      // Check for file uploads
      if (inputHeroImageFile && inputHeroImageFile.files && inputHeroImageFile.files[0]) {
        finalHeroImageUrl = await uploadToCloudinary(inputHeroImageFile.files[0]);
      }
      if (inputPhilImageFile && inputPhilImageFile.files && inputPhilImageFile.files[0]) {
        finalPhilImageUrl = await uploadToCloudinary(inputPhilImageFile.files[0]);
      }

      const updatedContent = {
        // Section 1
        heroEyebrow: inputHeroEyebrow.value.trim(),
        heroTitle: inputHeroTitle.value.trim(),
        heroTitleItalic: inputHeroTitleItalic.value.trim(),
        heroDesc: inputHeroDesc.value.trim(),
        heroExtendedDesc: inputHeroExtendedDesc ? inputHeroExtendedDesc.value.trim() : "",
        heroImageUrl: finalHeroImageUrl || DEFAULT_ABOUT_CONTENT.heroImageUrl,

        // Section 2
        philEyebrow: inputPhilEyebrow.value.trim(),
        philTitle: inputPhilTitle.value.trim(),
        philText1: inputPhilText1.value.trim(),
        philText2: inputPhilText2.value.trim(),
        philExtendedText: inputPhilExtendedText ? inputPhilExtendedText.value.trim() : "",
        philQuote: inputPhilQuote.value.trim(),
        philImageUrl: finalPhilImageUrl || DEFAULT_ABOUT_CONTENT.philImageUrl,

        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "about", "content"), updatedContent);

      if (imgPreviewHero) imgPreviewHero.src = updatedContent.heroImageUrl;
      if (imgPreviewPhil) imgPreviewPhil.src = updatedContent.philImageUrl;

      if (window.showAppPopup) {
        window.showAppPopup("About Page Saved", "Section 1 & Section 2 content updated successfully on the website!", "edit");
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
        aboutSubmitBtn.textContent = "Save About Page Content";
      }
    }
  });
}
