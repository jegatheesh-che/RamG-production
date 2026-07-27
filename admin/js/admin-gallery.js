// ================================================
// RAMG PRODUCTION — ADMIN GALLERY MANAGER
// Phase 9B+: Full Management (Add, Edit, Reorder, Delete)
// ================================================

import { auth, db } from "/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUD_NAME = "dxbdobdxt";
const UPLOAD_PRESET = "website_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// DOM Elements - State
const loadingState = document.getElementById("adminGalleryLoading");
const errorState = document.getElementById("adminGalleryError");
const emptyState = document.getElementById("adminGalleryEmpty");
const galleryGrid = document.getElementById("adminGalleryGrid");

// DOM Elements - Modals & Forms
const btnAddNew = document.getElementById("btnAddNew");
const galleryModal = document.getElementById("galleryModal");
const galleryModalClose = document.getElementById("galleryModalClose");
const galleryModalCancel = document.getElementById("galleryModalCancel");
const galleryForm = document.getElementById("galleryForm");
const galleryModalTitle = document.getElementById("galleryModalTitle");
const galleryFormError = document.getElementById("galleryFormError");
const galleryModalSubmit = document.getElementById("galleryModalSubmit");

// Form Inputs
const inputId = document.getElementById("galleryId");
const inputTitle = document.getElementById("galleryTitle");
const inputCategory = document.getElementById("galleryCategory");
const inputMediaType = document.getElementById("galleryMediaType");
const inputImage = document.getElementById("galleryImage");
const inputYoutubeId = document.getElementById("galleryYoutubeId");
const groupImageUpload = document.getElementById("groupImageUpload");
const groupYoutubeId = document.getElementById("groupYoutubeId");

// DOM Elements - Delete Modal
const deleteModal = document.getElementById("deleteModal");
const deleteModalClose = document.getElementById("deleteModalClose");
const deleteModalCancel = document.getElementById("deleteModalCancel");
const deleteModalConfirm = document.getElementById("deleteModalConfirm");
const deleteItemTitle = document.getElementById("deleteItemTitle");
const deleteModalError = document.getElementById("deleteModalError");

let currentGalleryItems = [];
let itemToDelete = null;

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadGalleryItems();
  }
});

// ================================================
// DATA FETCHING
// ================================================
async function loadGalleryItems() {
  if (!galleryGrid || !loadingState) return;

  loadingState.style.display = "grid";
  errorState.style.display = "none";
  emptyState.style.display = "none";
  galleryGrid.style.display = "none";
  galleryGrid.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    
    currentGalleryItems = [];
    querySnapshot.forEach((doc) => {
      currentGalleryItems.push({ id: doc.id, ...doc.data() });
    });

    currentGalleryItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (currentGalleryItems.length === 0) {
      loadingState.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    currentGalleryItems.forEach((item, index) => {
      const card = createAdminGalleryCard(item, index);
      galleryGrid.appendChild(card);
    });

    loadingState.style.display = "none";
    galleryGrid.style.display = "grid";

  } catch (error) {
    console.error("[Admin Gallery] Error fetching gallery items:", error);
    loadingState.style.display = "none";
    errorState.style.display = "block";
    errorState.textContent = "Failed to load gallery items. Please try refreshing.";
  }
}

// ================================================
// DOM GENERATION
// ================================================
function createAdminGalleryCard(item, index = 0) {
  const card = document.createElement("div");
  card.className = "admin-gallery-item animate-in";
  card.dataset.id = item.id;
  card.style.animationDelay = \`\${index * 0.05}s\`;

  const isVideo = item.mediaType === "video";
  const badgeClass = isVideo ? "badge-video" : "badge-image";
  const badgeText = isVideo ? "Video" : "Image";

  let thumbUrl = "";
  if (isVideo && item.youtubeId) {
    thumbUrl = `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
  } else if (!isVideo && item.cloudinaryUrl) {
    thumbUrl = item.cloudinaryUrl;
  }

  card.innerHTML = `
    <img src="${thumbUrl}" alt="${item.title || 'Gallery Item'}" class="admin-gallery-item__thumb" loading="lazy" />
    <div class="admin-gallery-item__info">
      <h3 class="admin-gallery-item__title" title="${item.title || ''}">${item.title || 'Untitled'}</h3>
      <div class="admin-gallery-item__meta">
        <span class="admin-gallery-item__category">${item.category || 'Uncategorized'}</span>
        <div class="admin-gallery-item__order-editor">
          <label>Order:</label>
          <input type="number" class="order-input" data-id="${item.id}" value="${item.order || 0}" min="1" max="${currentGalleryItems.length}" />
        </div>
      </div>
      <div class="admin-gallery-item__meta" style="margin-top: 4px;">
        <span class="admin-gallery-item__badge ${badgeClass}">${badgeText}</span>
      </div>
    </div>
    <div class="admin-gallery-item__actions">
      <button class="btn-action btn-edit" data-id="${item.id}">Edit</button>
      <button class="btn-action btn-action--danger btn-delete" data-id="${item.id}">Delete</button>
    </div>
  `;

  // Attach Listeners
  card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(item));
  card.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(item));

  const orderInput = card.querySelector('.order-input');
  orderInput.addEventListener('change', (e) => handleOrderChange(item.id, e.target.value));

  const img = card.querySelector('.admin-gallery-item__thumb');
  if (img) {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  }

  return card;
}

// ================================================
// MODAL LOGIC (ADD / EDIT)
// ================================================
function resetForm() {
  galleryForm.reset();
  inputId.value = "";
  galleryModalTitle.textContent = "Add New Item";
  galleryFormError.style.display = "none";
  galleryFormError.textContent = "";
  toggleMediaFields();
  inputImage.required = true;
  galleryModalSubmit.textContent = "Save Item";
  galleryModalSubmit.classList.remove('is-loading');
}

function openAddModal() {
  resetForm();
  galleryModal.showModal();
}

function openEditModal(item) {
  resetForm();
  galleryModalTitle.textContent = "Edit Item";
  inputId.value = item.id;
  inputTitle.value = item.title;
  inputCategory.value = item.category;
  inputMediaType.value = item.mediaType;
  
  toggleMediaFields();

  if (item.mediaType === "video") {
    inputYoutubeId.value = item.youtubeId;
  } else {
    // Cannot edit image file natively without full replace logic. Keep simple.
    inputImage.required = false; 
    document.getElementById("galleryImageHint").textContent = "Editing image file is not supported. Please delete and recreate if you need to change the photo.";
    inputImage.disabled = true;
  }

  galleryModal.showModal();
}

function closeModals() {
  galleryModal.close();
  deleteModal.close();
}

inputMediaType.addEventListener("change", toggleMediaFields);

function toggleMediaFields() {
  if (inputMediaType.value === "video") {
    groupImageUpload.style.display = "none";
    inputImage.required = false;
    groupYoutubeId.style.display = "flex";
    inputYoutubeId.required = true;
  } else {
    groupImageUpload.style.display = "flex";
    inputImage.required = !inputId.value; // Required only on Add
    inputImage.disabled = !!inputId.value; // Disabled on Edit
    groupYoutubeId.style.display = "none";
    inputYoutubeId.required = false;
  }
}

// ================================================
// FORM SUBMISSION (CREATE & UPDATE)
// ================================================
galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  galleryFormError.style.display = "none";
  galleryModalSubmit.classList.add('is-loading');
  galleryModalSubmit.textContent = "Saving...";

  const isEdit = !!inputId.value;
  const title = inputTitle.value.trim();
  const category = inputCategory.value;
  const mediaType = inputMediaType.value;
  
  if (!title || !category || !mediaType) {
    showFormError("Please fill in all required fields.");
    return;
  }

  try {
    if (isEdit) {
      // --- UPDATE EXISTING ITEM ---
      const updateData = { title, category };
      if (mediaType === "video") {
        const yId = inputYoutubeId.value.trim();
        if (!yId) throw new Error("YouTube ID is required.");
        updateData.youtubeId = yId;
      }

      await updateDoc(doc(db, "gallery", inputId.value), updateData);
      
    } else {
      // --- CREATE NEW ITEM ---
      let cloudinaryUrl = null;
      let cloudinaryPublicId = null;
      let youtubeId = null;

      if (mediaType === "image") {
        const file = inputImage.files[0];
        if (!file) throw new Error("Please select an image to upload.");

        // Cloudinary Upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "website-gallery");

        const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Failed to upload image to Cloudinary.");
        
        cloudinaryUrl = uploadData.secure_url;
        cloudinaryPublicId = uploadData.public_id;
      } else {
        youtubeId = inputYoutubeId.value.trim();
        if (!youtubeId) throw new Error("YouTube ID is required.");
      }

      // Calculate Order & Tilt
      const maxOrder = currentGalleryItems.reduce((max, item) => Math.max(max, item.order || 0), 0);
      const newOrder = maxOrder + 1;
      const mod = newOrder % 4;
      const tiltClass = mod === 1 ? "tilt-left" : mod === 3 ? "tilt-right" : "";

      // Firestore Document
      const docData = {
        title,
        category,
        mediaType,
        tiltClass,
        order: newOrder,
        createdAt: serverTimestamp()
      };

      if (mediaType === "image") {
        docData.cloudinaryUrl = cloudinaryUrl;
        docData.cloudinaryPublicId = cloudinaryPublicId;
      } else {
        docData.youtubeId = youtubeId;
      }

      // Use a custom ID or let Firestore generate it. We'll use a custom ID for cleaner URLs/refs if needed, or just let auto ID.
      // We'll let setDoc auto ID by generating a new ref.
      const newDocRef = doc(collection(db, "gallery"));
      await setDoc(newDocRef, docData);
    }

    // Success
    closeModals();
    loadGalleryItems();

  } catch (error) {
    console.error("[Admin Gallery] Save error:", error);
    showFormError(error.message);
  } finally {
    galleryModalSubmit.classList.remove('is-loading');
    galleryModalSubmit.textContent = isEdit ? "Save Changes" : "Save Item";
  }
});

function showFormError(msg) {
  galleryFormError.textContent = msg;
  galleryFormError.style.display = "block";
  galleryModalSubmit.classList.remove('is-loading');
  galleryModalSubmit.textContent = inputId.value ? "Save Changes" : "Save Item";
}

// ================================================
// REORDERING (DIRECT NUMBER INPUT)
// ================================================
async function handleOrderChange(id, newOrderStr) {
  const newOrder = parseInt(newOrderStr, 10);
  const targetItem = currentGalleryItems.find(item => item.id === id);
  if (!targetItem || isNaN(newOrder)) return;

  const oldOrder = targetItem.order;
  if (oldOrder === newOrder) return;
  if (newOrder < 1 || newOrder > currentGalleryItems.length) {
    alert(\`Please enter a valid position between 1 and \${currentGalleryItems.length}\`);
    loadGalleryItems(); // Reset UI
    return;
  }

  galleryGrid.style.opacity = "0.5";
  galleryGrid.style.pointerEvents = "none";

  try {
    const batch = writeBatch(db);
    const getTilt = (order) => (order % 4 === 1) ? "tilt-left" : (order % 4 === 3) ? "tilt-right" : "";

    // Calculate new order for all items
    currentGalleryItems.forEach(item => {
      let updatedOrder = item.order;

      if (item.id === id) {
        updatedOrder = newOrder;
      } else if (oldOrder < newOrder) {
        // Target item moved down the list; shift intermediate items up
        if (item.order > oldOrder && item.order <= newOrder) {
          updatedOrder--;
        }
      } else if (oldOrder > newOrder) {
        // Target item moved up the list; shift intermediate items down
        if (item.order >= newOrder && item.order < oldOrder) {
          updatedOrder++;
        }
      }

      // If the order changed, add to batch
      if (updatedOrder !== item.order || item.id === id) {
        batch.update(doc(db, "gallery", item.id), {
          order: updatedOrder,
          tiltClass: getTilt(updatedOrder)
        });
      }
    });

    await batch.commit();
    await loadGalleryItems();
  } catch (error) {
    console.error("[Admin Gallery] Reorder error:", error);
    alert("Failed to save new order. Please try again.");
    await loadGalleryItems(); // Revert UI
  } finally {
    galleryGrid.style.opacity = "1";
    galleryGrid.style.pointerEvents = "auto";
  }
}

// ================================================
// DELETION LOGIC
// ================================================
function openDeleteModal(item) {
  itemToDelete = item;
  deleteItemTitle.textContent = `"${item.title}"`;
  deleteModalError.style.display = "none";
  deleteModalConfirm.textContent = "Delete Permanently";
  deleteModalConfirm.classList.remove("is-loading");
  deleteModal.showModal();
}

deleteModalConfirm.addEventListener("click", async () => {
  if (!itemToDelete) return;
  
  deleteModalError.style.display = "none";
  deleteModalConfirm.classList.add("is-loading");
  deleteModalConfirm.textContent = "Deleting...";

  try {
    if (itemToDelete.mediaType === "image" && itemToDelete.cloudinaryPublicId) {
      // 1. Authenticate with Vercel API
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in.");
      
      const idToken = await user.getIdToken();
      
      // 2. Call secure serverless deletion endpoint
      const res = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: idToken,
          publicId: itemToDelete.cloudinaryPublicId
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete image from Cloudinary.");
      }
    }

    // 3. Delete from Firestore (Only reached if Image Delete succeeded, or if it's a Video)
    await deleteDoc(doc(db, "gallery", itemToDelete.id));

    // 4. Cleanup and Refresh
    closeModals();
    itemToDelete = null;
    loadGalleryItems();

  } catch (error) {
    console.error("[Admin Gallery] Delete error:", error);
    deleteModalError.textContent = error.message;
    deleteModalError.style.display = "block";
    deleteModalConfirm.classList.remove("is-loading");
    deleteModalConfirm.textContent = "Delete Permanently";
  }
});


// Event Listeners for Modals
if (btnAddNew) btnAddNew.addEventListener("click", openAddModal);
if (galleryModalClose) galleryModalClose.addEventListener("click", closeModals);
if (galleryModalCancel) galleryModalCancel.addEventListener("click", closeModals);
if (deleteModalClose) deleteModalClose.addEventListener("click", closeModals);
if (deleteModalCancel) deleteModalCancel.addEventListener("click", closeModals);

// Close on backdrop click (Escape key is native to <dialog>)
[galleryModal, deleteModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const inDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!inDialog) closeModals();
    });
  }
});
