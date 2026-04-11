'use client';

import { useEffect, useState, useRef } from 'react';
import { advertisementsService } from '@/services/advertisements.service';

const SESSION_KEY = 'popup_ad_shown_count';
const MAX_SHOWS = 2;

export default function PopupAd() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const shown = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
    if (shown >= MAX_SHOWS) return;

    advertisementsService.getActivePopupAd()
      .then((res) => {
        const data = res.data;
        if (!data || !data.id) return;
        setAd(data);
        if (data.is_skippable && data.skip_after_seconds > 0) {
          setCountdown(data.skip_after_seconds);
        }
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, String(shown + 1));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible || countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [visible, countdown]);

  const close = () => setVisible(false);

  if (!visible || !ad) return null;

  const canSkip = ad.is_skippable && countdown === 0;
  const imgSrc = isMobile ? ad.mobile_image : ad.desktop_image;
  const maxWidth = isMobile ? 'w-[min(400px,90vw)]' : 'w-full max-w-2xl';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`flex flex-col ${maxWidth}`}>

        {/* Top bar — always outside the image */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-t-2xl px-4 py-2">
          <span className="text-white/70 text-xs">Advertisement</span>
          <SkipButton ad={ad} canSkip={canSkip} countdown={countdown} onClose={close} />
        </div>

        {/* Image */}
        <div className="rounded-b-2xl overflow-hidden shadow-2xl">
          {ad.link ? (
            <a href={ad.link} target={ad.open_in_new_tab ? '_blank' : '_self'} rel="noopener noreferrer" onClick={close} className="block">
              <img src={imgSrc} alt="Advertisement" className="w-full object-contain block" draggable={false} />
            </a>
          ) : (
            <img src={imgSrc} alt="Advertisement" className="w-full object-contain block" draggable={false} />
          )}
        </div>

      </div>
    </div>
  );
}

function SkipButton({ ad, canSkip, countdown, onClose }) {
  const [nonSkipReady, setNonSkipReady] = useState(false);

  useEffect(() => {
    if (ad.is_skippable) return;
    const t = setTimeout(() => setNonSkipReady(true), 30000);
    return () => clearTimeout(t);
  }, [ad.is_skippable]);

  if (!ad.is_skippable) {
    if (!nonSkipReady) return <span className="text-white/40 text-xs">Non-skippable</span>;
    return (
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-800 hover:bg-gray-100 transition-colors"
      >
        Close
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    );
  }

  return (
    <button
      onClick={canSkip ? onClose : undefined}
      disabled={!canSkip}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors
        ${canSkip
          ? 'bg-white text-slate-800 hover:bg-gray-100 cursor-pointer'
          : 'bg-white/20 text-white cursor-default'
        }`}
    >
      {canSkip ? (
        <>
          Skip
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </>
      ) : (
        <>Skip in {countdown}s</>
      )}
    </button>
  );
}
