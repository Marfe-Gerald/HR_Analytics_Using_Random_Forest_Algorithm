// API calls. Sends one employee record to the model API and returns its prediction.

// Anonymous visitor id, stored in a first-party cookie (1 year). No login, no personal data.
// It is sent to the API in a header so the server can keep each visitor's history separate.
function getVisitorId() {
  const match = document.cookie.match(/(?:^|; )visitor_id=([^;]+)/);
  let id = match ? match[1] : null;
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() :
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      }));
    document.cookie = "visitor_id=" + id + "; max-age=31536000; path=/; SameSite=Lax";
  }
  return id;
}

async function apiError(res) {
  let detail = "";
  try { detail = " " + JSON.stringify((await res.json()).detail); } catch (e) {}
  return new Error("The API returned an error (" + res.status + ")." + detail);
}

async function fetchHistory() {
  const res = await fetch(API_URL + "/history", { headers: { "X-Visitor-Id": getVisitorId() } });
  if (!res.ok) throw await apiError(res);
  return (await res.json()).items;
}

async function clearHistory() {
  const res = await fetch(API_URL + "/history", { method: "DELETE", headers: { "X-Visitor-Id": getVisitorId() } });
  if (!res.ok) throw await apiError(res);
  return res.json();
}

async function predictAttrition(payload) {
  const res = await fetch(API_URL + "/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Visitor-Id": getVisitorId() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw await apiError(res);
  return res.json(); // { will_leave: boolean, probability_left: number }
}
