// ================================================
// RAMG PRODUCTION — DYNAMIC FIRESTORE GALLERY
// Fetch & Render Gallery Cards from Firestore
// ================================================

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadFirestoreGallery();
});

async function loadFirestoreGallery() {
  const galleryMasonry = document.getElementById("galleryMasonry");
  if (!galleryMasonry) return;

  try {
    console.log("[Firestore Gallery] Fetching documents from /gallery...");
    
    // Fetch all documents from gallery collection
    const querySnapshot = await getDocs(collection(db, "gallery"));
    
    if (querySnapshot.empty) {
      console.warn("[Firestore Gallery] /gallery collection is empty.");
      galleryMasonry.innerHTML = `
        <div class="gallery-empty-msg" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--clr-muted, #a1a1aa);">
          <p>No gallery items found in archive.</p>
        </div>
      `;
      return;
    }

    const items = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });

    // Sort by order ASC (1 through 16)
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`[Firestore Gallery] Loaded and sorted ${items.length} items.`);

    // Clear loading state
    galleryMasonry.innerHTML = "";

    items.forEach((item) => {
      const cardEl = createGalleryCardDOM(item);
      galleryMasonry.appendChild(cardEl);
    });

    // Initialize GSAP reveals, category filtering, and Lightbox modal
    if (typeof window.initScrollReveal === "function") {
      window.initScrollReveal();
    }
    if (typeof window.initGalleryInteractions === "function") {
      window.initGalleryInteractions();
    }

  } catch (error) {
    console.error("[Firestore Gallery Error] Failed to load documents:", error);
    galleryMasonry.innerHTML = `
      <div class="gallery-error-msg" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--clr-muted, #a1a1aa);">
        <p>Unable to load visual archive at this time. Please check your connection and try refreshing.</p>
      </div>
    `;
  }
}

// Utility for faster image loading
function getOptimizedCloudinaryUrl(url, width = 800) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/') && !url.includes('q_auto')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}

function createGalleryCardDOM(item) {
  const card = document.createElement("div");
  card.className = `gallery-card ${item.tiltClass || ''} reveal`;
  card.dataset.id = item.id;
  card.dataset.category = item.category || "uncategorized";
  card.dataset.title = item.title || "";

  if (item.mediaType === "video") {
    card.setAttribute("data-youtube-id", item.youtubeId || "");
    // Use hqdefault instead of maxresdefault for vastly faster loading
    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
    
    card.innerHTML = `
      <img src="${thumbnailUrl}" alt="${item.title || 'Video'}" loading="lazy" />
      <div class="gallery-card__video-badge">
        <svg viewBox="0 0 24 24">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
      </div>
      <div class="gallery-card__expand">&#10530;</div>
    `;
  } else {
    // Image item
    const optimizedUrl = getOptimizedCloudinaryUrl(item.cloudinaryUrl, 800);
    card.innerHTML = `
      <img src="${optimizedUrl}" alt="${item.title || 'Photo'}" loading="lazy" />
      <div class="gallery-card__expand">&#10530;</div>
    `;
  }

  return card;
}
