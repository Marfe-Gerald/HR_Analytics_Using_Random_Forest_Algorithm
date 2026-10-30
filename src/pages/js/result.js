// Result screen: shows the prediction saved by the Data Collection screen.
const box = document.getElementById("result-box");
let saved = null;
try { saved = JSON.parse(sessionStorage.getItem("hrPrediction")); } catch (e) {}

if (!saved) {
  box.innerHTML = '<p class="muted">No prediction yet.</p><a href="data-collection.html">Go to the Data Collection screen &rarr;</a>';
} else {
  const pct = Math.round(saved.result.probability_left * 100);
  const level = pct >= 60 ? "high" : pct >= 30 ? "mid" : "low";
  const labels = {
    satisfaction_level: "Satisfaction level", last_evaluation: "Last evaluation",
    number_project: "Projects", average_monthly_hours: "Monthly hours",
    time_spend_company: "Years at company", Work_accident: "Work accident",
    promotion_last_5years: "Promoted in last 5 years", salary: "Salary level"
  };
  const yesNo = (v) => (v === 1 ? "Yes" : "No");
  const shown = (k, v) => (k === "Work_accident" || k === "promotion_last_5years" ? yesNo(v) :
    (k === "satisfaction_level" || k === "last_evaluation") ? Math.round(v * 100) + "%" : v);
  const rows = Object.keys(labels).map((k) =>
    "<tr><th>" + labels[k] + "</th><td>" + shown(k, saved.input[k]) + "</td></tr>").join("");

  box.innerHTML =
    '<div class="risk-score risk-' + level + '">' + pct + '%</div>' +
    '<p class="risk-verdict">' + (saved.result.will_leave ? "Likely to leave" : "Likely to stay") + '</p>' +
    '<div class="meter" role="img" aria-label="Risk ' + pct + ' percent"><span class="risk-' + level + '"></span></div>' +
    '<p class="muted risk-note">This is a risk score from a model trained on balanced data, not an exact probability.</p>' +
    '<table class="inputs">' + rows + '</table>' +
    '<p><a href="data-collection.html">&larr; Predict another employee</a></p>';

  const bar = box.querySelector(".meter span");
  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = pct + "%"; }));
}
