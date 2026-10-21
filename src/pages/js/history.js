// History screen: front-end only. Lists inputs saved on the Data Collection screen.
const VARIABLES = ["satisfaction_level","last_evaluation","number_project","average_monthly_hours","time_spend_company","Work_accident","promotion_last_5years"];
const wrap = document.getElementById("history-wrap");

function render() {
  let list = [];
  try { list = JSON.parse(localStorage.getItem("hr_history") || "[]"); } catch (e) {}
  if (!list.length) { wrap.innerHTML = '<p class="empty">No history yet.</p>'; return; }

  const table = document.createElement("table");
  table.className = "history";
  const head = table.createTHead().insertRow();
  ["Saved at", ...VARIABLES, "Prediction"].forEach((h) => {
    const th = document.createElement("th"); th.textContent = h; head.appendChild(th);
  });
  const body = table.createTBody();
  list.forEach((rec) => {
    const tr = body.insertRow();
    tr.insertCell().textContent = new Date(rec.savedAt).toLocaleString();
    VARIABLES.forEach((v) => { tr.insertCell().textContent = rec.inputs[v]; });
    tr.insertCell().textContent = rec.prediction ?? "—"; // BACKEND HOOK: prediction goes here
  });
  const holder = document.createElement("div");
  holder.className = "table-wrap";
  holder.appendChild(table);
  wrap.replaceChildren(holder);
}

document.getElementById("clear-history").addEventListener("click", () => {
  try { localStorage.removeItem("hr_history"); } catch (e) {}
  render();
});
render();
