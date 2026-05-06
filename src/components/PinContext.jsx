// src/components/PinContext.jsx
//
// React context that makes PIN configuration available to PinGate hooks
// without prop-drilling through every component.
//
// Provider:  <PinContext.Provider value={{ pin, pinHash, email }}>
//   pin      — legacy plain-text PIN (data.overridePin), kept for migration
//   pinHash  — hashed PIN (data.pinHash), preferred
//   email    — user's email address, needed to verify the hash
//
// Consumers: usePinConfig() — read raw config
//            usePinVerify() — get an async (enteredPin) => boolean function
//            usePinActive() — boolean: does the user have any PIN protection?
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from 'react';
import { verifyPin } from '../lib/pinHash';

export const PinContext = createContext({
  pin:     '',
  pinHash: '',
  email:   '',
});

/**
 * Raw PIN config — only needed by the PinGate hooks internally.
 */
export function usePinConfig() {
  return useContext(PinContext);
}

/**
 * Returns an async function that verifies an entered PIN.
 * Prefers pinHash (hashed, secure); falls back to plain pin (legacy migration).
 *
 * Usage:
 *   const verify = usePinVerify();
 *   const ok = await verify(enteredValue);
 */
export function usePinVerify() {
  const { pin, pinHash, email } = usePinConfig();
  return useCallback(
    async (entered) => {
      if (pinHash) return verifyPin(entered, email, pinHash);
      if (pin)     return entered === pin;   // legacy overridePin
      return false;
    },
    [pin, pinHash, email],
  );
}

/**
 * Boolean: true if the user has any form of PIN protection (hash or legacy).
 * False means no PIN exists — gates should block and show the contact-admin notice.
 */
export function usePinActive() {
  const { pin, pinHash } = usePinConfig();
  return !!(pin || pinHash);
}
