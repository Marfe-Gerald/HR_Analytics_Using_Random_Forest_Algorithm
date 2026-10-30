// API calls. Sends one employee record to the model API and returns its prediction.
async function predictAttrition(payload) {
  const res = await fetch(API_URL + "/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let detail = "";
    try { detail = " " + JSON.stringify((await res.json()).detail); } catch (e) {}
    throw new Error("The API returned an error (" + res.status + ")." + detail);
  }
  return res.json(); // { will_leave: boolean, probability_left: number }
}
