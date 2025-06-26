// Initialize Lucide icons
lucide.createIcons();

// Mobile menu toggle
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Dropdown functionality
document.addEventListener("DOMContentLoaded", function () {
  const userMenuButton = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");

  // Toggle dropdown on button click
  userMenuButton.addEventListener("click", function (e) {
    e.stopPropagation();
    const isHidden = userDropdown.classList.contains("hidden");

    if (isHidden) {
      userDropdown.classList.remove("hidden");
      userMenuButton.setAttribute("aria-expanded", "true");
    } else {
      userDropdown.classList.add("hidden");
      userMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !userMenuButton.contains(e.target) &&
      !userDropdown.contains(e.target)
    ) {
      userDropdown.classList.add("hidden");
      userMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  // Close dropdown on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      userDropdown.classList.add("hidden");
      userMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  // Password toggle functionality
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = this.querySelector("i");
    if (type === "password") {
      icon.setAttribute("data-lucide", "eye");
    } else {
      icon.setAttribute("data-lucide", "eye-off");
    }
    lucide.createIcons();
  });
});
