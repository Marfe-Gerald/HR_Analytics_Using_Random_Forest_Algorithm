// Shared script: builds the sidebar navigator and runs the card entrance effect.
// To rename / add / remove a screen, edit the SCREENS list below
// (and create or delete the matching .html file).
const SCREENS = [
  { file: "index.html",              name: "Dashboard",              icon: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-7h6v7"/>' },
  { file: "data-collection.html",    name: "Data Collection Screen", icon: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>' },
  { file: "result.html",             name: "Result Screen",          icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
  { file: "history.html",            name: "History Screen",         uc: true, icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
];

// Sidebar
const current = location.pathname.split("/").pop() || "index.html";
const side = document.getElementById("sidebar");
side.className = "sidebar";
side.innerHTML =
  '<div class="brand"><span class="brand-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M12 8l-5 4M12 8l5 4M12 13l-7 5M12 13l7 5"/></svg></span>HR Analytics</div>' +
  '<div class="nav-label">Navigation</div><nav class="nav">' +
  SCREENS.map(s =>
    `<a href="${s.file}" class="${s.file === current ? "active" : ""}">` +
    `<svg viewBox="0 0 24 24">${s.icon}</svg>${s.name}${s.uc ? '<span class="pill">Soon</span>' : ""}</a>`
  ).join("") + "</nav>";

// Staggered card entrance
document.querySelectorAll(".card").forEach((el, i) => {
  el.style.transitionDelay = i * 90 + "ms";
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
  setTimeout(() => { el.style.transitionDelay = "0ms"; el.classList.add("settled"); }, 700 + i * 90);
});
