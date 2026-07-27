// ================================================
// RAMG PRODUCTION — ADMIN TEAM & ABOUT MANAGER
// Full CRUD Management (Add, Edit, Delete Team Members, Max 10)
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
const tabTeam = document.getElementById("tabTeam");
const sectionGallery = document.getElementById("sectionGallery");
const sectionReviews = document.getElementById("sectionReviews");
const sectionTeam = document.getElementById("sectionTeam");

// DOM Elements - State
const loadingState = document.getElementById("adminTeamLoading");
const errorState = document.getElementById("adminTeamError");
const emptyState = document.getElementById("adminTeamEmpty");
const teamGrid = document.getElementById("adminTeamGrid");
const teamCounter = document.getElementById("adminTeamCounter");

// DOM Elements - Modals & Forms
const btnAddNewTeam = document.getElementById("btnAddNewTeam");
const teamModal = document.getElementById("teamModal");
const teamModalClose = document.getElementById("teamModalClose");
const teamModalCancel = document.getElementById("teamModalCancel");
const teamForm = document.getElementById("teamForm");
const teamModalTitle = document.getElementById("teamModalTitle");
const teamFormError = document.getElementById("teamFormError");
const teamModalSubmit = document.getElementById("teamModalSubmit");

// Form Inputs
const inputId = document.getElementById("teamId");
const inputName = document.getElementById("teamName");
const inputRole = document.getElementById("teamRole");
const inputBadge = document.getElementById("teamBadge");
const inputImage = document.getElementById("teamImage");
const inputImageUrl = document.getElementById("teamImageUrl");
const inputShortBio = document.getElementById("teamShortBio");
const inputFullBio = document.getElementById("teamFullBio");
const inputOrder = document.getElementById("teamOrder");

// Delete Modal
const deleteTeamModal = document.getElementById("deleteTeamModal");
const deleteTeamModalClose = document.getElementById("deleteTeamModalClose");
const deleteTeamModalCancel = document.getElementById("deleteTeamModalCancel");
const deleteTeamModalConfirm = document.getElementById("deleteTeamModalConfirm");
const deleteTeamItemTitle = document.getElementById("deleteTeamItemTitle");
const deleteTeamModalError = document.getElementById("deleteTeamModalError");

let currentTeamMembers = [];
let memberToDelete = null;

// Max limit constant
const MAX_TEAM_MEMBERS = 10;

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTeamMembers();
  }
});

// ================================================
// TAB SWITCHING MANAGEMENT
// ================================================
function setupTabs() {
  const tabs = [
    { btn: tabGallery, sec: sectionGallery },
    { btn: tabReviews, sec: sectionReviews },
    { btn: tabTeam, sec: sectionTeam }
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
// DEFAULT SEED DATA FOR TEAM (10 MEMBERS)
// ================================================
const DEFAULT_SEED_TEAM = [
  {
    name: "RamG",
    role: "Founder & Lead Director",
    badge: "Founder",
    imageUrl: "assets/images/r_DSC00241_full.webp",
    shortBio: "Pioneering visual storyteller behind RamG Production. Specializing in high-fashion editorial portraits, luxury weddings, and cinematic films.",
    fullBio: "With over 8 years of experience capturing elite celebrations across Belgium, France, and international destinations, RamG blends photojournalistic spontaneity with high-art editorial composition.",
    order: 1
  },
  {
    name: "Sophie Laurent",
    role: "Creative Director & Stylist",
    badge: "Creative",
    imageUrl: "assets/images/excellents/DSC09416.webp",
    shortBio: "Curates editorial concepts, moodboards, and wardrobe styling for high-end portrait sessions and luxury weddings.",
    fullBio: "Sophie ensures every aesthetic detail aligns with high-fashion standards. From lighting choreography to outfit palette harmony, she elevates wedding photography into fine-art magazine storytelling.",
    order: 2
  },
  {
    name: "Alexandre Dubois",
    role: "Lead Cinematographer & Drone Pilot",
    badge: "Cinema",
    imageUrl: "assets/images/DSC00641.webp",
    shortBio: "Master of motion imagery, aerial cinematography, and dynamic steadycam choreography for cinematic wedding films.",
    fullBio: "Alexandre brings 6+ years of commercial film expertise. Certified for high-altitude drone operations, he captures breathtaking aerial vistas and sweeping emotional moments with crisp 4K precision.",
    order: 3
  },
  {
    name: "Elena Rostova",
    role: "Senior Colorist & Fine Art Editor",
    badge: "Colorist",
    imageUrl: "assets/images/DSC00709-3.webp",
    shortBio: "Transforms raw footage and digital photographs into rich, filmic color palettes inspired by classical fine art paintings.",
    fullBio: "Elena oversees all post-production color science at RamG Production. She carefully tunes highlight falloff, skin tones, and shadow contrast to give every photo and film an unmistakable signature glow.",
    order: 4
  },
  {
    name: "Marcus Vance",
    role: "Lead Photographer & Visual Artist",
    badge: "Photo",
    imageUrl: "assets/images/DSC01274.webp",
    shortBio: "Specializes in unscripted documentary-style moments, emotional teary glances, and candid celebration shots.",
    fullBio: "Marcus has covered over 180+ luxury weddings across Belgium, France, and Italy. His unobtrusive approach allows couples to remain entirely authentic while he captures raw, unposed emotion.",
    order: 5
  },
  {
    name: "Clara Moreau",
    role: "Editorial Producer & Client Director",
    badge: "Producer",
    imageUrl: "assets/images/excellents/DSC07134.webp",
    shortBio: "Orchestrates seamless wedding day timelines, client consultations, and boutique album distribution.",
    fullBio: "Clara is the heart of client care at RamG Production. She coordinates with event planners, venues, and floral designers to guarantee a stress-free experience from booking to final gallery delivery.",
    order: 6
  },
  {
    name: "Lucas Van de Berg",
    role: "Sound Designer & Senior Video Editor",
    badge: "Audio",
    imageUrl: "assets/images/DSC01397.webp",
    shortBio: "Weaves voiceover vows, ambient acoustics, and custom musical scores into deeply moving wedding films.",
    fullBio: "Lucas is dedicated to sonic excellence. By blending natural speech, vows, audio engineering, and custom music licensing, he creates wedding films that evoke tears and joy for decades.",
    order: 7
  },
  {
    name: "Amara Okafor",
    role: "Lighting Director & Second Shooter",
    badge: "Lighting",
    imageUrl: "assets/images/DSC04842.webp",
    shortBio: "Architect of cinematic off-camera lighting, atmospheric night portraits, and ambient candlelit scenes.",
    fullBio: "Amara ensures perfect illumination in any environment—from candlelit cathedrals to sunset coastlines. Her expertise in off-camera flash and continuous lighting brings depth to every shot.",
    order: 8
  },
  {
    name: "David Sterling",
    role: "Master Retoucher & Print Curator",
    badge: "Print",
    imageUrl: "assets/images/DSC00386.webp",
    shortBio: "Crafts museum-quality retouching, archival fine-art prints, and handcrafted leather wedding albums.",
    fullBio: "David brings 10+ years of fine art printing experience. He works directly with Italian print artisans to craft heirloom leather albums and metallic prints designed to last generations.",
    order: 9
  },
  {
    name: "Nina Kowalski",
    role: "Social Content Director & BTS Curator",
    badge: "Social",
    imageUrl: "assets/images/excellents/DSC07715.webp",
    shortBio: "Captures instant vertical reels, 4K mobile highlights, and real-time social stories for tech-savvy couples.",
    fullBio: "Nina provides same-day behind-the-scenes content and vertical video highlights so couples can share their wedding joy with friends and family worldwide within 24 hours of saying 'I do'.",
    order: 10
  }
];

// ================================================
// LOAD TEAM MEMBERS FROM FIRESTORE
// ================================================
async function loadTeamMembers() {
  if (!loadingState || !teamGrid) return;

  loadingState.style.display = "grid";
  if (errorState) errorState.style.display = "none";
  if (emptyState) emptyState.style.display = "none";
  teamGrid.style.display = "none";

  try {
    const querySnapshot = await getDocs(collection(db, "team"));
    
    // Seed default team members if database is empty
    if (querySnapshot.empty) {
      console.log("[Admin Team] Collection /team is empty. Seeding default 10 team members...");
      await seedDefaultTeam();
      return loadTeamMembers();
    }

    currentTeamMembers = [];
    querySnapshot.forEach((docSnap) => {
      currentTeamMembers.push({ id: docSnap.id, ...docSnap.data() });
    });

    currentTeamMembers.sort((a, b) => (a.order || 0) - (b.order || 0));

    loadingState.style.display = "none";

    // Update Counter & Disable Add button if limit reached
    updateCounterUI();

    if (currentTeamMembers.length === 0) {
      if (emptyState) emptyState.style.display = "block";
    } else {
      renderTeamGrid(currentTeamMembers);
      teamGrid.style.display = "grid";
    }

  } catch (err) {
    console.error("[Admin Team] Error loading team members:", err);
    loadingState.style.display = "none";
    if (errorState) {
      errorState.textContent = `Failed to load team members: ${err.message}`;
      errorState.style.display = "block";
    }
  }
}

async function seedDefaultTeam() {
  for (const item of DEFAULT_SEED_TEAM) {
    const newRef = doc(collection(db, "team"));
    await setDoc(newRef, {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

function updateCounterUI() {
  const count = currentTeamMembers.length;
  if (teamCounter) {
    teamCounter.textContent = `(${count} / ${MAX_TEAM_MEMBERS} Max)`;
  }

  if (btnAddNewTeam) {
    if (count >= MAX_TEAM_MEMBERS) {
      btnAddNewTeam.disabled = true;
      btnAddNewTeam.title = `Maximum of ${MAX_TEAM_MEMBERS} team members reached`;
      btnAddNewTeam.style.opacity = "0.5";
      btnAddNewTeam.style.cursor = "not-allowed";
    } else {
      btnAddNewTeam.disabled = false;
      btnAddNewTeam.title = "";
      btnAddNewTeam.style.opacity = "1";
      btnAddNewTeam.style.cursor = "pointer";
    }
  }
}

// ================================================
// RENDER ADMIN TEAM CARDS GRID
// ================================================
function renderTeamGrid(items) {
  teamGrid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "admin-review-card"; // Reuse sleek admin card styles

    const avatarSrc = item.imageUrl || "assets/images/r_DSC00241_full.webp";

    card.innerHTML = `
      <div class="admin-review-card__header">
        <div style="display: flex; gap: 14px; align-items: center;">
          <img src="${avatarSrc}" alt="${item.name}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--clr-gold);" />
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: var(--clr-white); font-family: var(--font-serif);">${item.name || 'Team Member'}</h3>
            <p style="margin: 0; font-size: 0.78rem; color: var(--clr-gold); text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">${item.role || 'Member'}</p>
          </div>
        </div>
        <span class="admin-review-card__badge">${item.badge || 'Team'}</span>
      </div>

      <div style="margin-top: 12px; font-size: 0.85rem; color: var(--clr-muted); line-height: 1.5;">
        <p><strong>Short Bio:</strong> ${item.shortBio || 'No summary bio provided.'}</p>
        ${item.fullBio ? `<p style="margin-top: 6px; font-size: 0.8rem; color: rgba(255,255,255,0.7);"><strong>Full Bio (See More):</strong> ${item.fullBio}</p>` : ''}
      </div>

      <div class="admin-review-card__footer" style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">Order #${item.order || 1}</span>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-action btn-edit" data-id="${item.id}">Edit</button>
          <button type="button" class="btn-action btn-delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;

    // Attach Event Listeners
    card.querySelector(".btn-edit").addEventListener("click", () => openEditModal(item));
    card.querySelector(".btn-delete").addEventListener("click", () => openDeleteModal(item));

    teamGrid.appendChild(card);
  });
}

// ================================================
// ADD & EDIT MODAL HANDLERS
// ================================================
if (btnAddNewTeam) {
  btnAddNewTeam.addEventListener("click", () => {
    if (currentTeamMembers.length >= MAX_TEAM_MEMBERS) {
      alert(`You have reached the maximum limit of ${MAX_TEAM_MEMBERS} team members.`);
      return;
    }
    openAddModal();
  });
}

function openAddModal() {
  if (!teamModal || !teamForm) return;

  teamForm.reset();
  if (inputId) inputId.value = "";
  if (teamModalTitle) teamModalTitle.textContent = "Add New Team Member";
  if (teamFormError) teamFormError.style.display = "none";
  if (inputOrder) inputOrder.value = currentTeamMembers.length + 1;

  teamModal.showModal();
}

function openEditModal(item) {
  if (!teamModal || !teamForm) return;

  teamForm.reset();
  if (inputId) inputId.value = item.id;
  if (inputName) inputName.value = item.name || "";
  if (inputRole) inputRole.value = item.role || "";
  if (inputBadge) inputBadge.value = item.badge || "Team";
  if (inputImageUrl) inputImageUrl.value = item.imageUrl || "";
  if (inputShortBio) inputShortBio.value = item.shortBio || "";
  if (inputFullBio) inputFullBio.value = item.fullBio || "";
  if (inputOrder) inputOrder.value = item.order || 1;

  if (teamModalTitle) teamModalTitle.textContent = `Edit Team Member: ${item.name}`;
  if (teamFormError) teamFormError.style.display = "none";

  teamModal.showModal();
}

function closeTeamModal() {
  if (teamModal) teamModal.close();
}

if (teamModalClose) teamModalClose.addEventListener("click", closeTeamModal);
if (teamModalCancel) teamModalCancel.addEventListener("click", closeTeamModal);

// ================================================
// CLOUDINARY UPLOAD HELPER
// ================================================
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
// FORM SUBMIT HANDLER (CREATE / UPDATE)
// ================================================
if (teamForm) {
  teamForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (teamFormError) teamFormError.style.display = "none";
    if (teamModalSubmit) {
      teamModalSubmit.disabled = true;
      teamModalSubmit.textContent = "Saving...";
    }

    try {
      const id = inputId.value;
      const isEditing = Boolean(id);

      let finalImageUrl = inputImageUrl ? inputImageUrl.value.trim() : "";

      // Handle Image File Upload if provided
      if (inputImage && inputImage.files && inputImage.files[0]) {
        finalImageUrl = await uploadToCloudinary(inputImage.files[0]);
      }

      if (!finalImageUrl) {
        finalImageUrl = "assets/images/r_DSC00241_full.webp";
      }

      const teamData = {
        name: inputName.value.trim(),
        role: inputRole.value.trim(),
        badge: inputBadge ? inputBadge.value.trim() : "Team",
        imageUrl: finalImageUrl,
        shortBio: inputShortBio.value.trim(),
        fullBio: inputFullBio ? inputFullBio.value.trim() : "",
        order: parseInt(inputOrder.value) || 1,
        updatedAt: serverTimestamp()
      };

      if (isEditing) {
        await updateDoc(doc(db, "team", id), teamData);
        closeTeamModal();
        if (window.showAppPopup) {
          window.showAppPopup("Member Updated", `${teamData.name}'s profile has been updated successfully!`, "edit");
        }
      } else {
        if (currentTeamMembers.length >= MAX_TEAM_MEMBERS) {
          throw new Error(`Cannot add member. Limit of ${MAX_TEAM_MEMBERS} team members reached.`);
        }

        teamData.createdAt = serverTimestamp();
        const newDocRef = doc(collection(db, "team"));
        await setDoc(newDocRef, teamData);
        closeTeamModal();
        if (window.showAppPopup) {
          window.showAppPopup("Member Added", `${teamData.name} has been added to the About team!`, "add");
        }
      }

      await loadTeamMembers();

    } catch (err) {
      console.error("[Admin Team] Submit error:", err);
      if (teamFormError) {
        teamFormError.textContent = err.message || "Error saving team member.";
        teamFormError.style.display = "block";
      }
    } finally {
      if (teamModalSubmit) {
        teamModalSubmit.disabled = false;
        teamModalSubmit.textContent = "Save Member";
      }
    }
  });
}

// ================================================
// DELETE MODAL HANDLERS
// ================================================
function openDeleteModal(item) {
  memberToDelete = item;
  if (!deleteTeamModal) return;

  if (deleteTeamItemTitle) deleteTeamItemTitle.textContent = `"${item.name}" (${item.role})`;
  if (deleteTeamModalError) deleteTeamModalError.style.display = "none";

  deleteTeamModal.showModal();
}

function closeDeleteModal() {
  if (deleteTeamModal) deleteTeamModal.close();
  memberToDelete = null;
}

if (deleteTeamModalClose) deleteTeamModalClose.addEventListener("click", closeDeleteModal);
if (deleteTeamModalCancel) deleteTeamModalCancel.addEventListener("click", closeDeleteModal);

if (deleteTeamModalConfirm) {
  deleteTeamModalConfirm.addEventListener("click", async () => {
    if (!memberToDelete) return;

    deleteTeamModalConfirm.disabled = true;
    deleteTeamModalConfirm.textContent = "Deleting...";

    try {
      await deleteDoc(doc(db, "team", memberToDelete.id));
      const deletedName = memberToDelete.name;
      closeDeleteModal();

      if (window.showAppPopup) {
        window.showAppPopup("Member Deleted", `"${deletedName}" has been removed from the team.`, "delete");
      }

      await loadTeamMembers();

    } catch (err) {
      console.error("[Admin Team] Delete error:", err);
      if (deleteTeamModalError) {
        deleteTeamModalError.textContent = `Delete failed: ${err.message}`;
        deleteTeamModalError.style.display = "block";
      }
    } finally {
      deleteTeamModalConfirm.disabled = false;
      deleteTeamModalConfirm.textContent = "Delete Member";
    }
  });
}
