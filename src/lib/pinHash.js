// src/lib/pinHash.js
//
// Browser-safe PIN hashing using the Web Crypto API (SHA-256).
//
// Security model:
//   The PIN is a 4–6 digit user-chosen number.  A bare SHA-256 of the PIN
//   is brute-forceable in milliseconds (max 1 million values).
//   We mitigate this by including a compound salt:
//     APP_SALT + user email (lowercased) + PIN
//   This ensures:
//     - Two users with the same PIN produce different hashes.
//     - The hash is application-specific (cannot be reused from other breaches).
//     - Without the email, an attacker cannot pre-compute a rainbow table.
//
// This is a behavioural guardrail for an in-app PIN gate, not an authentication
// system.  The hash lives in localStorage alongside other app data.
// For a higher-security system, replace this with PBKDF2 + a per-user random salt.
//
// Functions are async because crypto.subtle.digest is promise-based.
// ─────────────────────────────────────────────────────────────────────────────

const APP_SALT = 'royal-ledger-pin-v1';

/**
 * Hash a PIN for storage.
 * @param {string} pin        - The raw PIN digits (e.g. "1234")
 * @param {string} userEmail  - The user's email address (used as salt)
 * @returns {Promise<string>} - Lowercase hex string (64 chars)
 */
export async function hashPin(pin, userEmail) {
  const input = `${APP_SALT}:${(userEmail || '').toLowerCase().trim()}:${pin}`;
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify an entered PIN against a stored hash.
 * @param {string} enteredPin  - The PIN the user just typed
 * @param {string} userEmail   - The user's email address (must match what was used during setup)
 * @param {string} storedHash  - The hash retrieved from data.pinHash
 * @returns {Promise<boolean>}
 */
export async function verifyPin(enteredPin, userEmail, storedHash) {
  if (!storedHash || !enteredPin) return false;
  const hash = await hashPin(enteredPin, userEmail);
  return hash === storedHash;
}
