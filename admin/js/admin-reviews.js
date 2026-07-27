// ================================================
// RAMG PRODUCTION — ADMIN REVIEWS MANAGER
// Full CRUD Management (Add, Edit, Delete Customer Reviews & Stars)
// ================================================

import { auth, db } from "/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUD_NAME = "dxbdobdxt";
const UPLOAD_PRESET = "website_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Navigation Tabs
const tabGallery = document.getElementById("tabGallery");
const tabReviews = document.getElementById("tabReviews");
const sectionGallery = document.getElementById("sectionGallery");
const sectionReviews = document.getElementById("sectionReviews");

// DOM Elements - State
const loadingState = document.getElementById("adminReviewsLoading");
const errorState = document.getElementById("adminReviewsError");
const emptyState = document.getElementById("adminReviewsEmpty");
const reviewsGrid = document.getElementById("adminReviewsGrid");

// DOM Elements - Modals & Forms
const btnAddNewReview = document.getElementById("btnAddNewReview");
const reviewModal = document.getElementById("reviewModal");
const reviewModalClose = document.getElementById("reviewModalClose");
const reviewModalCancel = document.getElementById("reviewModalCancel");
const reviewForm = document.getElementById("reviewForm");
const reviewModalTitle = document.getElementById("reviewModalTitle");
const reviewFormError = document.getElementById("reviewFormError");
const reviewModalSubmit = document.getElementById("reviewModalSubmit");

// Form Inputs
const inputId = document.getElementById("reviewId");
const inputName = document.getElementById("reviewName");
const inputSubtitle = document.getElementById("reviewSubtitle");
const inputStars = document.getElementById("reviewStars");
const inputCategory = document.getElementById("reviewCategory");
const inputText = document.getElementById("reviewText");
const inputBadge = document.getElementById("reviewBadge");
const inputAvatar = document.getElementById("reviewAvatar");

// Delete Modal
const deleteReviewModal = document.getElementById("deleteReviewModal");
const deleteReviewModalClose = document.getElementById("deleteReviewModalClose");
const deleteReviewModalCancel = document.getElementById("deleteReviewModalCancel");
const deleteReviewModalConfirm = document.getElementById("deleteReviewModalConfirm");
const deleteReviewItemTitle = document.getElementById("deleteReviewItemTitle");
const deleteReviewModalError = document.getElementById("deleteReviewModalError");

let currentReviews = [];
let reviewToDelete = null;

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadReviewItems();
  }
});

// ================================================
// TAB SWITCHING
// ================================================
if (tabGallery && tabReviews) {
  tabGallery.addEventListener("click", () => {
    tabGallery.classList.add("active");
    tabReviews.classList.remove("active");
    if (sectionGallery) sectionGallery.style.display = "block";
    if (sectionReviews) sectionReviews.style.display = "none";
  });

  tabReviews.addEventListener("click", () => {
    tabReviews.classList.add("active");
    tabGallery.classList.remove("active");
    if (sectionReviews) sectionReviews.style.display = "block";
    if (sectionGallery) sectionGallery.style.display = "none";
  });
}

// ================================================
// DATA FETCHING
// ================================================
async function loadReviewItems() {
  if (!reviewsGrid || !loadingState) return;

  loadingState.style.display = "grid";
  errorState.style.display = "none";
  emptyState.style.display = "none";
  reviewsGrid.style.display = "none";
  reviewsGrid.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "reviews"));
    
    currentReviews = [];
    querySnapshot.forEach((docSnap) => {
      currentReviews.push({ id: docSnap.id, ...docSnap.data() });
    });

    currentReviews.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (currentReviews.length === 0) {
      loadingState.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    currentReviews.forEach((item, index) => {
      const card = createAdminReviewCard(item, index);
      reviewsGrid.appendChild(card);
    });

    loadingState.style.display = "none";
    reviewsGrid.style.display = "grid";

  } catch (error) {
    console.error("[Admin Reviews] Error fetching reviews:", error);
    loadingState.style.display = "none";
    errorState.style.display = "block";
    errorState.textContent = "Failed to load reviews. Please try refreshing.";
  }
}

// Helper to convert star count to star symbols
function renderStars(rating = 5) {
  const num = parseInt(rating) || 5;
  return "★".repeat(num) + "☆".repeat(5 - num);
}

function createAdminReviewCard(item, index = 0) {
  const card = document.createElement("div");
  card.className = "admin-review-card animate-in";
  card.style.animationDelay = `${index * 0.05}s`;
  card.dataset.id = item.id;

  const defaultAvatar = "assets/images/excellents/DSC09416.webp";
  const avatarSrc = item.avatarUrl || defaultAvatar;
  const starsString = renderStars(item.stars || 5);

  card.innerHTML = `
    <div>
      <div class="admin-review-card__header">
        <img src="${avatarSrc}" alt="${item.name || 'Client'}" class="admin-review-card__avatar" />
        <div>
          <h3 class="admin-review-card__name">${item.name || 'Anonymous Client'}</h3>
          <p class="admin-review-card__subtitle">${item.subtitle || 'Client Story'}</p>
        </div>
      </div>
      <div class="admin-review-card__stars">${starsString} (${item.stars || 5}/5 Stars)</div>
      <p class="admin-review-card__text">&ldquo;${item.text || ''}&rdquo;</p>
    </div>
    
    <div class="admin-review-card__footer">
      <span class="admin-review-card__badge">${item.badge || 'Verified Client'}</span>
      <div class="admin-gallery-item__actions">
        <button type="button" class="btn-action btn-edit" data-id="${item.id}" title="Edit Review">Edit</button>
        <button type="button" class="btn-action btn-delete" data-id="${item.id}" title="Delete Review">Delete</button>
      </div>
    </div>
  `;

  card.querySelector(".btn-edit").addEventListener("click", () => openEditModal(item));
  card.querySelector(".btn-delete").addEventListener("click", () => openDeleteModal(item));

  return card;
}

// ================================================
// MODAL CONTROLS
// ================================================
if (btnAddNewReview) {
  btnAddNewReview.addEventListener("click", () => {
    reviewForm.reset();
    inputId.value = "";
    reviewModalTitle.textContent = "Add Customer Review";
    reviewFormError.style.display = "none";
    inputStars.value = "5";
    inputCategory.value = "wedding";
    inputBadge.value = "Verified Client";
    reviewModal.showModal();
  });
}

function openEditModal(item) {
  reviewForm.reset();
  reviewFormError.style.display = "none";
  reviewModalTitle.textContent = "Edit Customer Review";

  inputId.value = item.id;
  inputName.value = item.name || "";
  inputSubtitle.value = item.subtitle || "";
  inputStars.value = item.stars || "5";
  inputCategory.value = item.category || "wedding";
  inputText.value = item.text || "";
  inputBadge.value = item.badge || "Verified Client";

  reviewModal.showModal();
}

function openDeleteModal(item) {
  reviewToDelete = item;
  deleteReviewItemTitle.textContent = `"${item.name || 'Untitled Review'}" (${item.subtitle || ''})`;
  deleteReviewModalError.style.display = "none";
  deleteReviewModal.showModal();
}

function closeModals() {
  if (reviewModal) reviewModal.close();
  if (deleteReviewModal) deleteReviewModal.close();
}

if (reviewModalClose) reviewModalClose.addEventListener("click", closeModals);
if (reviewModalCancel) reviewModalCancel.addEventListener("click", closeModals);
if (deleteReviewModalClose) deleteReviewModalClose.addEventListener("click", closeModals);
if (deleteReviewModalCancel) deleteReviewModalCancel.addEventListener("click", closeModals);

function showFormError(msg) {
  reviewFormError.textContent = msg;
  reviewFormError.style.display = "block";
  reviewModalSubmit.classList.remove('is-loading');
  reviewModalSubmit.textContent = "Save Review";
}

// ================================================
// FORM SUBMISSION (CREATE & UPDATE)
// ================================================
if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    reviewFormError.style.display = "none";
    reviewModalSubmit.classList.add('is-loading');
    reviewModalSubmit.textContent = "Saving...";

    const isEdit = !!inputId.value;
    const name = inputName.value.trim();
    const subtitle = inputSubtitle.value.trim();
    const stars = parseInt(inputStars.value) || 5;
    const category = inputCategory.value || "wedding";
    const text = inputText.value.trim();
    const badge = inputBadge.value.trim() || "Verified Client";

    if (!name || !subtitle || !text) {
      showFormError("Please fill in all required fields.");
      return;
    }

    try {
      let avatarUrl = null;

      // Handle Avatar Image Upload if provided
      if (inputAvatar && inputAvatar.files && inputAvatar.files[0]) {
        const file = inputAvatar.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "website-reviews");

        const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        
        if (uploadRes.ok) {
          avatarUrl = uploadData.secure_url;
        }
      }

      if (isEdit) {
        const updateData = { name, subtitle, stars, category, text, badge, updatedAt: serverTimestamp() };
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        await updateDoc(doc(db, "reviews", inputId.value), updateData);
      } else {
        const maxOrder = currentReviews.reduce((max, item) => Math.max(max, item.order || 0), 0);
        const newOrder = maxOrder + 1;
        const newRef = doc(collection(db, "reviews"));
        
        const docData = {
          name,
          subtitle,
          stars,
          category,
          text,
          badge,
          avatarUrl: avatarUrl || "",
          order: newOrder,
          createdAt: serverTimestamp()
        };

        await setDoc(newRef, docData);
      }

      closeModals();
      await loadReviewItems();

    } catch (err) {
      console.error("[Admin Reviews] Submit Error:", err);
      showFormError(err.message || "Failed to save review.");
    } finally {
      reviewModalSubmit.classList.remove('is-loading');
      reviewModalSubmit.textContent = "Save Review";
    }
  });
}

// ================================================
// DELETE CONFIRMATION
// ================================================
if (deleteReviewModalConfirm) {
  deleteReviewModalConfirm.addEventListener("click", async () => {
    if (!reviewToDelete) return;

    deleteReviewModalError.style.display = "none";
    deleteReviewModalConfirm.classList.add('is-loading');
    deleteReviewModalConfirm.textContent = "Deleting...";

    try {
      await deleteDoc(doc(db, "reviews", reviewToDelete.id));
      closeModals();
      reviewToDelete = null;
      await loadReviewItems();
    } catch (err) {
      console.error("[Admin Reviews] Delete Error:", err);
      deleteReviewModalError.textContent = err.message || "Failed to delete review.";
      deleteReviewModalError.style.display = "block";
    } finally {
      deleteReviewModalConfirm.classList.remove('is-loading');
      deleteReviewModalConfirm.textContent = "Delete Review";
    }
  });
}
