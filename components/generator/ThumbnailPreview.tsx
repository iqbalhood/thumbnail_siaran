'use client';

import React from 'react';

interface ThumbnailData {
  title: string;
  speakerName: string;
  speakerPosition: string;
  presenterBgUrl: string | null;
  speakerPhotoUrl: string | null;
  rriLogoUrl: string | null;
  pro1LogoUrl: string | null;
}

interface ThumbnailPreviewProps {
  data: ThumbnailData;
  id?: string;
}

export function ThumbnailPreview({ data, id = 'thumbnail-svg' }: ThumbnailPreviewProps) {
  const {
    title = 'JUDUL DIALOG DISINI',
    speakerName = 'NAMA NARASUMBER',
    speakerPosition = 'JABATAN NARASUMBER',
    presenterBgUrl,
    speakerPhotoUrl,
    rriLogoUrl,
    pro1LogoUrl,
  } = data;

  return (
    <div className="w-full aspect-video bg-slate-200 rounded-xl overflow-hidden shadow-2xl border border-slate-300 relative">
      <svg
        id={id}
        viewBox="0 0 1280 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 1. Background Layer */}
        {presenterBgUrl ? (
          <image href={presenterBgUrl} width="1280" height="720" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <rect width="1280" height="720" fill="#1e293b" />
        )}

        {/* 2. Speaker Photo Layer (Left side) */}
        {speakerPhotoUrl && (
          <g>
            <defs>
              <clipPath id="speaker-clip">
                <circle cx="340" cy="360" r="240" />
              </clipPath>
            </defs>
            {/* Shadow/Glow for speaker */}
            <circle cx="340" cy="360" r="250" fill="white" fillOpacity="0.1" />
            <image
              href={speakerPhotoUrl}
              x="100"
              y="120"
              width="480"
              height="480"
              clipPath="url(#speaker-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* White Border around circle */}
            <circle cx="340" cy="360" r="240" stroke="white" strokeWidth="8" fill="none" />
          </g>
        )}

        {/* 3. Gradient Overlay for Text Readability (Bottom/Right) */}
        <defs>
          <linearGradient id="text-grad" x1="1280" y1="720" x2="640" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="black" stopOpacity="0.6" />
            <stop offset="1" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#text-grad)" />

        {/* 4. Branding Logos (Top Right) */}
        <g transform="translate(1080, 40)">
          {rriLogoUrl && (
            <image href={rriLogoUrl} x="0" y="0" width="160" height="50" preserveAspectRatio="xMaxYMid meet" />
          )}
          {pro1LogoUrl && (
            <image href={pro1LogoUrl} x="0" y="60" width="160" height="40" preserveAspectRatio="xMaxYMid meet" />
          )}
        </g>

        {/* 5. Text Overlays */}
        <g transform="translate(680, 420)">
          {/* Title - Uppercase, Bold, Large */}
          <text
            fill="white"
            style={{ whiteSpace: 'pre-wrap' }}
            fontFamily="Inter, sans-serif"
            fontSize="48"
            fontWeight="900"
            letterSpacing="-0.02em"
          >
            {title.toUpperCase().split('\n').map((line, i) => (
              <tspan x="0" dy={i === 0 ? 0 : 54} key={i}>{line}</tspan>
            ))}
          </text>

          {/* Speaker Name - Orange Accent */}
          <g transform={`translate(0, ${title.split('\n').length * 54 + 20})`}>
            <rect width="400" height="4" fill="#f97316" rx="2" />
            <text
              y="45"
              fill="white"
              fontFamily="Inter, sans-serif"
              fontSize="32"
              fontWeight="700"
            >
              {speakerName}
            </text>
            <text
              y="85"
              fill="#cbd5e1"
              fontFamily="Inter, sans-serif"
              fontSize="18"
              fontWeight="500"
              style={{ maxWidth: '500px' }}
            >
              {speakerPosition}
            </text>
          </g>
        </g>
        
        {/* Bottom Banner Info */}
        <text
          x="1240"
          y="690"
          textAnchor="end"
          fill="white"
          fillOpacity="0.5"
          fontFamily="Inter, sans-serif"
          fontSize="14"
          fontWeight="600"
          letterSpacing="0.1em"
        >
          RRI PRO 1 BANDA ACEH • 97.7 FM
        </text>
      </svg>
      
      {!presenterBgUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white/90 px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Preview Mode</span>
          </div>
        </div>
      )}
    </div>
  );
}
