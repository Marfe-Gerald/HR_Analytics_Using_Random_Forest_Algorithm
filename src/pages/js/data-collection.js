// Data Collection screen: front-end only. Nothing is sent to a server.
// Values are kept in the browser (localStorage) so the Result and History
// screens can display them.

const form = document.getElementById("input-form");
const statusEl = document.getElementById("form-status");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // stay on the page; no request is made

  // Collect the 7 X variables (the input "name" attributes are the variable names)
  const inputs = {};
  new FormData(form).forEach((value, key) => { inputs[key] = Number(value); });
  const record = { savedAt: new Date().toISOString(), inputs };

  // ------------------------------------------------------------------
  // BACKEND HOOK: when the backend is ready, send `inputs` to it here,
  // e.g. fetch("/predict", { method: "POST", body: JSON.stringify(inputs) })
  // and put the returned prediction into `record.prediction`.
  // ------------------------------------------------------------------

  try {
    localStorage.setItem("hr_latest_input", JSON.stringify(record));
    const history = JSON.parse(localStorage.getItem("hr_history") || "[]");
    history.unshift(record);
    localStorage.setItem("hr_history", JSON.stringify(history.slice(0, 50)));
    statusEl.textContent = "Saved in this browser. View it on the Result screen.";
  } catch (err) {
    statusEl.textContent = "Could not save in this browser.";
  }
});

form.addEventListener("reset", () => { statusEl.textContent = ""; });
