/* =========================================================
   NAV.JS
   Small, page-independent script for the top bar's expandable
   menu. Used by BOTH index.html and profiles.html.
   Kept separate from script.js on purpose: script.js expects
   quiz elements (like #start-btn) that don't exist on
   profiles.html, so mixing the two would cause errors there.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  // If either element is missing, just stop — nothing to wire up.
  if (!menuToggle || !navMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the menu if someone clicks anywhere outside of it.
  document.addEventListener("click", (event) => {
    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggleButton = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggleButton) {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});
