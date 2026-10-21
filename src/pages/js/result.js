// Result screen: front-end only. Reads the latest input saved by the
// Data Collection screen. The prediction itself is a placeholder.
const VARIABLES = ["satisfaction_level","last_evaluation","number_project","average_monthly_hours","time_spend_company","Work_accident","promotion_last_5years"];
const box = document.getElementById("inputs");

let record = null;
try { record = JSON.parse(localStorage.getItem("hr_latest_input")); } catch (e) {}

if (!record) {
  box.innerHTML = '<p class="empty">No input yet. Fill in the Data Collection screen first.</p>';
} else {
  const table = document.createElement("table");
  table.className = "kv";
  VARIABLES.forEach((name) => {
    const tr = table.insertRow();
    const th = document.createElement("th"); th.textContent = name;
    const td = tr.insertCell(); td.textContent = record.inputs[name];
    tr.appendChild(th); tr.insertBefore(th, td);
  });
  box.replaceChildren(table);
}

// BACKEND HOOK: when a prediction exists (record.prediction), show it here:
// document.getElementById("prediction-value").textContent = record.prediction;
