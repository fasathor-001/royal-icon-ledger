// src/lib/pinHash.js
//
// Browser-safe PIN hashing using the Web Crypto API — PBKDF2.
//
// Security model:
//   The PIN is a 4–6 digit user-chosen number.  A bare SHA-256 of the PIN
//   is brute-forceable in milliseconds (max 1 million values).
//
//   PBKDF2 with 100,000 rounds makes each check ~100 ms instead of <1 µs,
//   raising the cost of an offline brute-force attack by ~8 orders of magnitude.
//
//   Salt design:
//     APP_SALT + ":" + email.toLowerCase()
//   This is deterministic (no separate salt storage needed) while still
//   ensuring that:
//     - Two users with the same PIN produce different hashes.
//     - The hash is application-specific (cannot be reused from other breaches).
//
//   Output: Base64-encoded 256-bit derived key.  The old SHA-256 output was a
//   64-char lowercase hex string — format is distinct, so verifyPin can detect
//   which algorithm to use and verify legacy hashes transparently.
//
// Do NOT store the raw PIN anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const APP_SALT       = 'royal-ledger-pin-v1';
const PBKDF2_ITERS   = 100_000;
const PBKDF2_BITS    = 256;

// ── Helpers ───────────────────────────────────────────────────────────────────

function saltFor(userEmail) {
  return new TextEncoder().encode(
    `${APP_SALT}:${(userEmail || '').toLowerCase().trim()}`
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Hash a PIN for storage using PBKDF2-SHA256.
 *
 * @param {string} pin       - Raw PIN digits, e.g. "1234"
 * @param {string} userEmail - User's email address (used as per-user salt)
 * @returns {Promise<string>} Base64-encoded 256-bit key (≈44 chars)
 */
export async function hashPin(pin, userEmail) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltFor(userEmail), iterations: PBKDF2_ITERS, hash: 'SHA-256' },
    keyMaterial,
    PBKDF2_BITS,
  );
  // Base64-encode the raw bytes
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

/**
 * Verify an entered PIN against a stored hash.
 *
 * Handles two hash formats transparently:
 *  • Legacy SHA-256  — 64-char lowercase hex string (migrated to PBKDF2 on next save)
 *  • Current PBKDF2  — Base64 string (~44 chars)
 *
 * @param {string} enteredPin - PIN the user just typed
 * @param {string} userEmail  - Must match the email used when the hash was created
 * @param {string} storedHash - data.pinHash value
 * @returns {Promise<boolean>}
 */
export async function verifyPin(enteredPin, userEmail, storedHash) {
  if (!storedHash || !enteredPin) return false;

  // ── Legacy SHA-256 path (64-char hex) ──
  if (/^[0-9a-f]{64}$/.test(storedHash)) {
    return (await _sha256Hex(enteredPin, userEmail)) === storedHash;
  }

  // ── Current PBKDF2 path ──
  return (await hashPin(enteredPin, userEmail)) === storedHash;
}

// ── Internal: legacy SHA-256 (kept only for verifying old hashes) ─────────────

async function _sha256Hex(pin, userEmail) {
  const input   = `${APP_SALT}:${(userEmail || '').toLowerCase().trim()}:${pin}`;
  const encoded = new TextEncoder().encode(input);
  const buffer  = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
