import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hapticDouble, hapticLight } from '@/utils/haptics';

/* ═══════════════════════════════════════════════════════════════
   THREE MINIMAL EASTER EGGS — each completely different

   EGG 1 · "The Archive"     → type "69"
           Fullscreen black reveal. Group.png centered. Nothing else.

   EGG 2 · "The Badge"       → triple-tap bottom-right corner
           A floating 69 badge drifts up from the tapped spot, shows
           a one-line quote, then dissolves. No overlay at all.

   EGG 3 · "The Signal"      → type "icmu"
           A slim banner slides in from the top edge,
           lingers 4 seconds, then vanishes. Very subtle.
═══════════════════════════════════════════════════════════════ */

const QUOTES = [
  "When perspective shapes reality.",
  "No sacrifice, no victory.",
  "You were not supposed to find this.",
  "Behind every frame, a story untold.",
  "ඔබ සොයාගත්තා.",
  "Everything is intentional.",
  "The lens never lies.",
  "69. Always has been.",
  "You are now part of the archive.",
];

const ICMU_CODE = 'icmu';

/* ── EGG 1: The Archive ── */
const ArchiveEgg = ({ visible, onDismiss }) => (
  <div
    onClick={onDismiss}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer"
    style={{
      background: '#000',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 0.8s ease',
    }}
  >
    <img
      src="/nethinethera/Group.png"
      alt=""
      draggable={false}
      className="object-contain select-none"
      style={{
        maxHeight: '75vh',
        maxWidth: '85vw',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 1s cubic-bezier(0.22,1,0.36,1) 0.1s, opacity 1s ease 0.1s',
        filter: 'drop-shadow(0 0 40px rgba(0,255,0,0.3))',
      }}
    />
    <p
      className="font-konexy text-white/20 mt-8 text-center"
      style={{
        fontSize: 9,
        letterSpacing: '0.6em',
        textTransform: 'uppercase',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.7s',
      }}
    >
      tap to close
    </p>
  </div>
);

/* ── EGG 2: The Badge ── */
const BadgeEgg = ({ visible, quote, origin }) => (
  <div
    className="fixed z-[9990] flex flex-col items-center gap-2 pointer-events-none"
    style={{
      left: origin.x,
      top: origin.y,
      transform: 'translate(-50%, -50%)',
      opacity: visible ? 1 : 0,
      transition: visible
        ? 'opacity 0.3s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)'
        : 'opacity 0.6s ease 0.2s, transform 0.6s ease',
      '--tw-translate-y': visible ? '-70px' : '0px',
    }}
  >
    <div
      style={{
        transform: visible ? 'translateY(-70px) scale(1)' : 'translateY(0px) scale(0.7)',
        transition: visible
          ? 'transform 0.7s cubic-bezier(0.22,1,0.36,1)'
          : 'transform 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <img
        src="/nethinethera/69.png"
        alt=""
        draggable={false}
        style={{
          height: 52,
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 16px rgba(0,255,0,0.8)) brightness(1.1)',
          animation: visible ? 'badgeSpin 0.5s cubic-bezier(0.22,1,0.36,1) both' : 'none',
        }}
      />
      {quote && (
        <p
          className="font-konexy text-white/70 text-center whitespace-nowrap"
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            maxWidth: 220,
            whiteSpace: 'normal',
            textAlign: 'center',
          }}
        >
          {quote}
        </p>
      )}
    </div>
  </div>
);

/* ── EGG 3: ICMU Signal Banner ── */
const IcmuBanner = ({ visible }) => (
  <div
    className="fixed top-0 inset-x-0 z-[9980] flex justify-center pointer-events-none"
    style={{
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: visible ? 1 : 0,
      transition: visible
        ? 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease'
        : 'transform 0.5s ease, opacity 0.4s ease',
    }}
  >
    <div
      className="flex items-center gap-3 px-6 py-3 border-b"
      style={{
        background: 'rgba(0,0,0,0.95)',
        borderColor: 'rgba(0,255,0,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#4bc433',
          boxShadow: '0 0 8px #4bc433',
          flexShrink: 0,
          animation: visible ? 'pulse 1.5s ease infinite' : 'none',
        }}
      />
      <span
        className="font-konexy text-white/70"
        style={{ fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase' }}
      >
        I C M U — Signal Received.
      </span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const EasterEgg69 = () => {
  // EGG 1
  const [archiveOpen, setArchiveOpen] = useState(false);

  // EGG 2
  const [badge, setBadge] = useState({ visible: false, quote: '', origin: { x: 0, y: 0 } });
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // EGG 3
  const [icmuVisible, setIcmuVisible] = useState(false);
  const icmuBuf = useRef('');

  // ── EGG 1 + 3: keyboard detection ──
  const keyBuf = useRef('');
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.length !== 1) return; // skip arrows, ctrl, etc.

      // "icmu" check (egg 3)
      icmuBuf.current += e.key.toLowerCase();
      if (icmuBuf.current.length > ICMU_CODE.length) {
        icmuBuf.current = icmuBuf.current.slice(-ICMU_CODE.length);
      }
      if (icmuBuf.current === ICMU_CODE) {
        hapticDouble();
        setIcmuVisible(true);
        icmuBuf.current = '';
        setTimeout(() => setIcmuVisible(false), 4000);
      }

      // "69" check (egg 1)
      keyBuf.current += e.key;
      if (keyBuf.current.length > 2) keyBuf.current = keyBuf.current.slice(-2);
      if (keyBuf.current === '69' && !archiveOpen) {
        hapticDouble();
        setArchiveOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [archiveOpen]);

  // ESC to close archive
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') setArchiveOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  // ── EGG 2: triple-tap ──
  const handleCornerTap = useCallback((e) => {
    hapticLight();
    clearTimeout(tapTimer.current);
    tapCount.current += 1;

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      const origin = { x: e.clientX, y: e.clientY };
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setBadge({ visible: true, quote, origin });
      setTimeout(() => setBadge(b => ({ ...b, visible: false })), 2800);
      setTimeout(() => setBadge({ visible: false, quote: '', origin: { x: 0, y: 0 } }), 3600);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1000);
    }
  }, []);

  return (
    <>
      <ArchiveEgg visible={archiveOpen} onDismiss={() => setArchiveOpen(false)} />
      <BadgeEgg visible={badge.visible} quote={badge.quote} origin={badge.origin} />
      <IcmuBanner visible={icmuVisible} />

      {/* Invisible corner trigger */}
      <div
        onClick={handleCornerTap}
        className="fixed bottom-0 right-0 w-14 h-14 z-[9970] opacity-0 cursor-pointer"
        aria-hidden="true"
      />

      <style>{`
        @keyframes badgeSpin {
          0%   { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          100% { transform: rotate(0deg)   scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default EasterEgg69;
