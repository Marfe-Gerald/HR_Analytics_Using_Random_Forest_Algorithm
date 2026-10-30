// History screen: loads this visitor's past predictions from the API and shows them in a table.
const statusEl = document.getElementById("history-status");
const table = document.getElementById("history-table");
const body = document.getElementById("history-body");
const clearBtn = document.getElementById("clear-btn");

const pct = (v) => Math.round(v * 100) + "%";
const yn = (v) => (v === 1 ? "Yes" : "No");
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

function render(items) {
  if (!items.length) {
    statusEl.textContent = "No predictions yet. Make one on the Data Collection screen.";
    statusEl.hidden = false; table.hidden = true; clearBtn.hidden = true;
    return;
  }
  statusEl.hidden = true; table.hidden = false; clearBtn.hidden = false;
  body.innerHTML = items.map((it) => {
    const i = it.input, risk = Math.round(it.result.probability_left * 100);
    const level = risk >= 60 ? "high" : risk >= 30 ? "mid" : "low";
    const date = it.created_at ? new Date(it.created_at).toLocaleString() : "-";
    return "<tr><td>" + date + "</td><td>" + pct(i.satisfaction_level) + "</td><td>" + pct(i.last_evaluation) +
      "</td><td>" + i.number_project + "</td><td>" + i.average_monthly_hours + "</td><td>" + i.time_spend_company +
      "</td><td>" + cap(i.salary) + "</td><td>" + yn(i.Work_accident) + "</td><td>" + yn(i.promotion_last_5years) +
      '</td><td class="risk risk-' + level + '">' + risk + "%</td></tr>";
  }).join("");
}

async function load() {
  try {
    render(await fetchHistory());
  } catch (err) {
    statusEl.textContent = (err.message || "Could not reach the API.") + " Check that the API is running and that API_URL in src/utils/config.js is correct.";
  }
}

clearBtn.addEventListener("click", async () => {
  if (!confirm("Delete all your saved predictions?")) return;
  try { await clearHistory(); await load(); }
  catch (err) { statusEl.hidden = false; statusEl.textContent = err.message; }
});

load();
