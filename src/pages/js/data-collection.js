// Data Collection screen: reads the form, calls the API, then opens the Result screen.
const form = document.getElementById("form");
const btn = document.getElementById("predict-btn");
const msg = document.getElementById("form-error");
const val = (id) => document.getElementById(id).value;

// Live value next to each slider
document.querySelectorAll("input[type=range]").forEach((r) => {
  const out = document.getElementById(r.id + "_out");
  r.addEventListener("input", () => { out.textContent = r.value + "%"; });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Predicting…";

  // Keys must match the training columns the API expects
  const payload = {
    satisfaction_level: parseFloat(val("satisfaction_level")/100),
    last_evaluation: parseFloat(val("last_evaluation")/100),
    number_project: parseInt(val("number_project"), 10),
    average_monthly_hours: parseInt(val("average_monthly_hours"), 10),
    time_spend_company: parseInt(val("time_spend_company"), 10),
    Work_accident: parseInt(val("Work_accident"), 10),
    promotion_last_5years: parseInt(val("promotion_last_5years"), 10),
    salary: val("salary")
  };

  try {
    const result = await predictAttrition(payload);
    sessionStorage.setItem("hrPrediction", JSON.stringify({ input: payload, result: result }));
    location.href = "result.html";
  } catch (err) {
    msg.textContent = (err.message || "Could not reach the API.") + " Check that the API is running and that API_URL in src/utils/config.js is correct.";
    btn.disabled = false;
    btn.textContent = "Predict risk";
  }
});
