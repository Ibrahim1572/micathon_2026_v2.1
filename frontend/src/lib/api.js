/* ── API utility — all fetch calls to the FastAPI backend ──
   Uses Vite's dev proxy (/api → http://127.0.0.1:8000/api).
   NO arrow functions per project guardrails.
──────────────────────────────────────────────────────────── */

function handleResponse(res) {
  if (!res.ok) {
    throw new Error('Server returned ' + res.status)
  }
  return res.json()
}

/** POST /api/upload — send a receipt image to Gemini for parsing */
function uploadReceipt(file) {
  var formData = new FormData()
  formData.append('image', file)

  return fetch('/api/upload', {
    method: 'POST',
    body: formData
  }).then(handleResponse)
}

/** POST /api/parse — parse raw receipt text into categorised item lists */
function parseReceipt(receiptText) {
  return fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt_text: receiptText }),
  }).then(handleResponse)
}

/** POST /api/substitutions — match item names to local alternative products */
function getSubstitutions(items) {
  return fetch('/api/substitutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: items }),
  }).then(handleResponse)
}

/** POST /api/surplus — compute original total, new total, and surplus */
function calculateSurplus(acceptedSubs) {
  return fetch('/api/surplus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accepted_substitutions: acceptedSubs }),
  }).then(handleResponse)
}

export { uploadReceipt, parseReceipt, getSubstitutions, calculateSurplus }
