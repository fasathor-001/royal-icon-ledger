// src/components/HelpTip.jsx
//
// Contextual help tooltip — premium, minimal, click-activated.
//
// Usage:
//   <HelpTip title="Protect Mode">
//     Activated when your buffer falls below...
//   </HelpTip>
//
// Drop it inline next to any heading or label. Renders a small ⓘ button;
// clicking opens a floating panel positioned relative to the trigger.
// Click outside or press × to dismiss.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle } from 'lucide-react';

const POPOVER_WIDTH = 268;
const MARGIN        = 12; // min gap from viewport edge

export default function HelpTip({ title, children }) {
  const [open, setOpen]   = useState(false);
  const [style, setStyle] = useState({});
  const triggerRef        = useRef(null);
  const popoverRef        = useRef(null);

  // ── Position calculation ───────────────────────────────────────────────────
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r  = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: prefer left-aligned to trigger, clamp to viewport
    let left = r.left;
    if (left + POPOVER_WIDTH > vw - MARGIN) left = vw - POPOVER_WIDTH - MARGIN;
    if (left < MARGIN) left = MARGIN;

    // Vertical: prefer below, flip above if not enough room
    const spaceBelow = vh - r.bottom;
    const above      = spaceBelow < 180 && r.top > 180;

    setStyle({
      position: 'fixed',
      width:    POPOVER_WIDTH,
      left,
      ...(above
        ? { bottom: vh - r.top + 6 }
        : { top:    r.bottom + 6   }),
      zIndex: 9999,
    });
  }, []);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    calcPosition();
    setOpen(true);
  };

  // ── Close on outside interaction ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        popoverRef.current  && !popoverRef.current.contains(e.target) &&
        triggerRef.current  && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  // ── Reposition on scroll / resize while open ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    const reposition = () => calcPosition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, calcPosition]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        aria-label={`Help: ${title}`}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'none',
          border:         'none',
          padding:        0,
          marginLeft:     '7px',
          cursor:         'pointer',
          flexShrink:     0,
          color:          open ? '#C4A96B' : '#6B6358',
          transition:     'color 0.15s',
          verticalAlign:  'middle',
          position:       'relative',
          top:            '-1px',
          lineHeight:     1,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = '#C4A96B'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = '#6B6358'; }}
      >
        <HelpCircle size={14} strokeWidth={1.75} />
      </button>

      {/* Popover — rendered into <body> to avoid clipping */}
      {open && createPortal(
        <div
          ref={popoverRef}
          style={{
            ...style,
            background:   '#0C0A08',
            border:       '1px solid #2A2218',
            borderRadius: '7px',
            boxShadow:    '0 12px 40px rgba(0,0,0,0.72), 0 2px 10px rgba(0,0,0,0.5)',
            overflow:     'hidden',
            animation:    'rl-helptip-in 0.12s ease',
          }}
        >
          {/* Header strip */}
          <div style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            padding:         '9px 12px 8px',
            borderBottom:    '1px solid #1A1610',
            background:      '#0F0D0A',
          }}>
            <span style={{
              fontSize:      '9px',
              fontWeight:    700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         '#C4A96B',
              fontFamily:    'Inter, sans-serif',
            }}>
              {title}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      '#4A4038',
                padding:    '2px',
                display:    'flex',
                lineHeight: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B8478'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A4038'}
            >
              <X size={11} />
            </button>
          </div>

          {/* Body */}
          <div style={{
            padding:    '10px 13px 13px',
            fontSize:   '12px',
            lineHeight: '1.65',
            color:      '#8B8478',
            fontFamily: 'Inter, sans-serif',
          }}>
            {children}
          </div>
        </div>,
        document.body
      )}

      {/* Keyframe — injected once via a style tag */}
      {open && createPortal(
        <style>{`
          @keyframes rl-helptip-in {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0);   }
          }
        `}</style>,
        document.head
      )}
    </>
  );
}
