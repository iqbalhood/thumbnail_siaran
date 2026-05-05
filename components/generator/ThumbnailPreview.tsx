'use client';

import React from 'react';

export interface SpeakerData {
  name: string;
  position: string;
  photoUrl: string | null;
}

export interface ThumbnailData {
  title: string;
  eventName: string;
  date: string;
  time: string;
  presenterBgUrl: string | null;
  speakers: SpeakerData[];
  rriLogoUrl: string | null;
  pro1LogoUrl: string | null;
}

interface ThumbnailPreviewProps {
  data: ThumbnailData;
  id?: string;
}

export function ThumbnailPreview({ data, id = 'thumbnail-svg' }: ThumbnailPreviewProps) {
  const {
    title = 'SEKOLAH RAKYAT DI ACEH:\nMENJAWAB TANTANGAN PENDIDIKAN PINGGIRAN',
    eventName = 'BANDA ACEH MENYAPA',
    date = 'SELASA, 29 JULI 2025',
    time = '09:00 – 10:00 WIB',
    presenterBgUrl,
    speakers = [],
    rriLogoUrl,
    pro1LogoUrl,
  } = data;

  // Speaker configuration based on count (Section 11.4)
  const getSpeakerConfig = (count: number) => {
    switch (count) {
      case 1: return { positions: [380], radius: 70 };
      case 2: return { positions: [290, 470], radius: 70 };
      case 3: return { positions: [200, 380, 560], radius: 65 };
      case 4: return { positions: [130, 290, 450, 610], radius: 55 };
      default: return { positions: [380], radius: 70 };
    }
  };

  const count = Math.min(Math.max(speakers.length, 1), 4);
  const { positions, radius } = getSpeakerConfig(count);
  const speakerY = 380;

  return (
    <div className="w-full aspect-video bg-slate-200 rounded-xl overflow-hidden shadow-2xl border border-slate-300 relative group">
      <svg
        id={id}
        viewBox="0 0 1280 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 1. Background Layer (Section 11.1) */}
        {presenterBgUrl ? (
          <image href={presenterBgUrl} width="1280" height="720" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <rect width="1280" height="720" fill="#060f2c" />
        )}

        {/* 2. Logo RRI (x=80, y=50) */}
        {rriLogoUrl && (
          <image href={rriLogoUrl} x="80" y="50" width="140" height="70" preserveAspectRatio="xMinYMid meet" />
        )}

        {/* 3. Logo PRO 1 (x=1080, y=45) */}
        {pro1LogoUrl && (
          <image href={pro1LogoUrl} x="1080" y="45" width="140" height="70" preserveAspectRatio="xMaxYMid meet" />
        )}

        {/* 4. Title (x=80, y=180, Space Grotesk 700, 36px) */}
        <text
          x="80"
          y="180"
          fill="white"
          fontFamily="var(--font-display), sans-serif"
          fontSize="36"
          fontWeight="700"
          textAnchor="start"
        >
          {title.toUpperCase().split('\n').map((line, i) => (
            <tspan x="80" dy={i === 0 ? 0 : 50} key={i}>{line}</tspan>
          ))}
        </text>

        {/* 5. Event Name (x=80, y=295) */}
        <text
          x="80"
          y="295"
          fill="white"
          fontFamily="var(--font-inter), sans-serif"
          fontSize="22"
          fontWeight="700"
          letterSpacing="1"
        >
          {eventName.toUpperCase()}
        </text>

        {/* 6. Date with Calendar Icon (x=420, y=275) */}
        <g transform="translate(420, 275)">
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="32"
            y="18"
            fill="white"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {date.toUpperCase()}
          </text>
        </g>

        {/* 7. Time with Clock Icon (x=750, y=273) */}
        <g transform="translate(750, 273)">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
          <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x="32"
            y="20"
            fill="white"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {time}
          </text>
        </g>

        {/* 8. Speaker Circles (Y-anchor: 380) */}
        {speakers.length > 0 ? (
          speakers.slice(0, 4).map((speaker, i) => {
            const x = positions[i];
            const r = radius;
            return (
              <g key={i}>
                <defs>
                  <clipPath id={`speaker-clip-${i}`}>
                    <circle cx={x} cy={speakerY} r={r} />
                  </clipPath>
                  <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
                {/* Outer Ring */}
                <circle cx={x} cy={speakerY} r={r + 5} stroke="url(#ring-grad)" strokeWidth="4" fill="none" />
                {/* Speaker Photo */}
                {speaker.photoUrl ? (
                  <image
                    href={speaker.photoUrl}
                    x={x - r}
                    y={speakerY - r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#speaker-clip-${i})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle cx={x} cy={speakerY} r={r} fill="#1e293b" />
                )}
                
                {/* Name */}
                <text
                  x={x}
                  y={speakerY + r + 30}
                  fill="white"
                  fontFamily="var(--font-inter), sans-serif"
                  fontSize={count === 4 ? 13 : 15}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {speaker.name}
                </text>
                
                {/* Position (using foreignObject for multi-line) */}
                <foreignObject
                  x={x - (count === 4 ? 75 : 95)}
                  y={speakerY + r + 40}
                  width={count === 4 ? 150 : 190}
                  height="60"
                >
                  <div 
                    style={{ 
                      color: 'white', 
                      fontFamily: 'var(--font-inter), sans-serif', 
                      fontSize: count === 4 ? '10px' : '11px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      lineHeight: '1.3',
                    }}
                  >
                    {speaker.position}
                  </div>
                </foreignObject>
              </g>
            );
          })
        ) : (
          <text x="380" y="450" fill="white" fillOpacity="0.3" textAnchor="middle" fontSize="20" fontWeight="700">PILIH PEMBICARA</text>
        )}

        {/* 9. Footer Medsos Pill (x=80, y=615, w=310, h=48) */}
        <g transform="translate(80, 615)">
          <rect width="310" height="48" rx="24" fill="white" />
          {/* IG Icon */}
          <g transform="translate(15, 12) scale(0.6)">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="black" strokeWidth="2" fill="none"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="black" strokeWidth="2" fill="none"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="black" strokeWidth="2"/>
          </g>
          {/* FB Icon */}
          <g transform="translate(50, 12) scale(0.6)">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="black" strokeWidth="2" fill="none"/>
          </g>
          {/* TikTok Icon */}
          <g transform="translate(85, 12) scale(0.6)">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="black" strokeWidth="2" fill="none"/>
          </g>
          {/* YT Icon */}
          <g transform="translate(120, 12) scale(0.6)">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 2.9 2.9 0 0 0-.46-5.33z" stroke="black" strokeWidth="2" fill="none"/>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="black"/>
          </g>
          <text
            x="155"
            y="31"
            fill="black"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="14"
            fontWeight="700"
          >
            @RRI_BANDAACEH
          </text>
        </g>

        {/* 10. Info Promosi Bubble (x=440, y=615) */}
        <g transform="translate(440, 615)">
          <circle cx="24" cy="24" r="24" fill="#22c55e" />
          <path transform="translate(12, 12) scale(1)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="60"
            y="18"
            fill="white"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="16"
            fontWeight="700"
          >
            INFO PROMOSI & KERJASAMA
          </text>
          <text
            x="60"
            y="40"
            fill="white"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="16"
            fontWeight="700"
          >
            0811 6881 2123
          </text>
        </g>
      </svg>
      
      {/* Visual Overlay for placeholder */}
      {!presenterBgUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-20">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em]">Pilih Presenter</span>
             </div>
             <p className="text-[10px] text-slate-400 font-medium">Background akan muncul di sini</p>
          </div>
        </div>
      )}
    </div>
  );
}
