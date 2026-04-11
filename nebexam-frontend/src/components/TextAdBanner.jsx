'use client';

import { useEffect, useState } from 'react';
import { advertisementsService } from '@/services/advertisements.service';

function AdCard({ ad, single }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${single ? 'w-full sm:w-auto sm:min-w-[420px] sm:max-w-[560px]' : 'flex-1 min-w-0'}`}
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: "url('/assets/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative flex items-center gap-4 px-5 py-3.5 sm:py-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm sm:text-[15px] leading-tight truncate">{ad.title}</p>
          {ad.description && (
            <p className="text-white/70 text-xs sm:text-[13px] leading-tight mt-0.5 truncate">{ad.description}</p>
          )}
        </div>
        {ad.link && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center px-4 py-1.5 bg-[#1CA3FD] hover:bg-[#0e8de0] text-white text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap"
          >
            {ad.link_text || 'Apply Now'}
          </a>
        )}
      </div>
    </div>
  );
}

export default function TextAdBanner({ page }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    advertisementsService.getActiveTextAds(page)
      .then((res) => setAds(res.data || []))
      .catch(() => {});
  }, [page]);

  if (!ads.length) return null;

  const single = ads.length === 1;

  return (
    <div className="w-full px-4 sm:px-6 py-2">
      <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 ${single ? 'sm:justify-center' : ''}`}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} single={single} />
        ))}
      </div>
    </div>
  );
}
