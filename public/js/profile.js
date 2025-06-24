// Edit Modal Functions
function openEditModal() {
  document.getElementById("editModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside
document.getElementById("editModal").addEventListener("click", (e) => {
  if (e.target.id === "editModal") {
    closeEditModal();
  }
});

// Handle form submission
document.querySelector("#editModal form").addEventListener("submit", (e) => {
  e.preventDefault();
  // Handle form submission here
  alert("Profile updated successfully!");
  closeEditModal();
});

// Password Modal Functions
function openPasswordModal() {
  document.getElementById("passwordModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePasswordModal() {
  document.getElementById("passwordModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Image Modal Functions
function openImageModal() {
  document.getElementById("imageModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  // Set current image in preview
  const currentImage = document.getElementById("profileImage").src;
  document.getElementById("previewImage").src = currentImage;
}

function closeImageModal() {
  document.getElementById("imageModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("previewImage").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Select preset avatar
function selectPresetAvatar(imageSrc) {
  document.getElementById("previewImage").src = imageSrc;
}

// Save profile image
function saveProfileImage() {
  const newImageSrc = document.getElementById("previewImage").src;
  document.getElementById("profileImage").src = newImageSrc;
  closeImageModal();
  alert("Profile picture updated successfully!");
}

// Confirmation Modal Functions
function openConfirmModal(title, message, action) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmButton").onclick = action;
  document.getElementById("confirmModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  document.getElementById("confirmModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

function confirmLogout() {
  openConfirmModal(
    "Confirm Logout",
    "Are you sure you want to logout from your account?",
    function () {
      alert("Logging out...");
      window.location.href = "/auth/logout"; // logout
      closeConfirmModal();
    }
  );
}

function confirmDeleteAccount() {
  openConfirmModal(
    "Delete Account",
    "Are you sure you want to permanently delete your account? This action cannot be undone.",
    function () {
      alert("Account deletion requested...");
      // Add account deletion logic here
      closeConfirmModal();
    }
  );
}

// Close modals when clicking outside
document.getElementById("passwordModal").addEventListener("click", (e) => {
  if (e.target.id === "passwordModal") {
    closePasswordModal();
  }
});

document.getElementById("imageModal").addEventListener("click", (e) => {
  if (e.target.id === "imageModal") {
    closeImageModal();
  }
});

document.getElementById("confirmModal").addEventListener("click", (e) => {
  if (e.target.id === "confirmModal") {
    closeConfirmModal();
  }
});

// Handle password form submission
document
  .querySelector("#passwordModal form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Password updated successfully!");
    closePasswordModal();
  });
