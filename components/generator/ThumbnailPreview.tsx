'use client';

import React from 'react';

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

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
  speakerSpacingOffset?: number;
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
    speakerSpacingOffset = 0,
  } = data;  // Left-aligned speaker layouts starting from x=80
  const speakerLayouts: Record<number, any> = {
    1: { positions: [{ x: 160, y: 405 }], circleR: 80, textWidth: 240, fontSize: 16, posFontSize: 12 },
    2: { positions: [{ x: 150, y: 405 }, { x: 410, y: 405 }], circleR: 70, textWidth: 200, fontSize: 15, posFontSize: 11 },
    3: { positions: [{ x: 145, y: 405 }, { x: 365, y: 405 }, { x: 585, y: 405 }], circleR: 65, textWidth: 180, fontSize: 14, posFontSize: 11 },
    4: { positions: [{ x: 135, y: 405 }, { x: 335, y: 405 }, { x: 535, y: 405 }, { x: 735, y: 405 }], circleR: 55, textWidth: 160, fontSize: 13, posFontSize: 10 },
  };

  const count = Math.min(Math.max(speakers.length, 1), 4);
  const layout = speakerLayouts[count];
  const speakerY = 405;

  return (
    <div className="w-full aspect-video bg-slate-200 rounded-xl overflow-hidden shadow-2xl border border-slate-300 relative group">
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
          <rect width="1280" height="720" fill="#060f2c" />
        )}

        {/* 2. Logo RRI */}
        {rriLogoUrl && (
          <image href={rriLogoUrl} x="80" y="50" width="140" height="70" preserveAspectRatio="xMinYMid meet" />
        )}

        {/* 3. Logo PRO 1 */}
        {pro1LogoUrl && (
          <image href={pro1LogoUrl} x="1080" y="45" width="140" height="70" preserveAspectRatio="xMaxYMid meet" />
        )}

        {/* 4. Title */}
        <text
          x="80"
          y="180"
          fill="white"
          fontFamily="Space Grotesk, sans-serif"
          fontSize="36"
          fontWeight="700"
          textAnchor="start"
        >
          {title.toUpperCase().split('\n').map((line, i) => (
            <tspan x="80" dy={i === 0 ? 0 : 50} key={i}>{line}</tspan>
          ))}
        </text>

        {/* 5. Event Name */}
        <text
          x="80"
          y="295"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="22"
          fontWeight="700"
          letterSpacing="1"
        >
          {eventName.toUpperCase()}
        </text>

        {/* 6. Date with Calendar Icon */}
        <g transform="translate(420, 275)">
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="32"
            y="18"
            fill="white"
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {date.toUpperCase()}
          </text>
        </g>

        {/* 7. Time with Clock Icon */}
        <g transform="translate(750, 273)">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
          <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x="32"
            y="20"
            fill="white"
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {time}
          </text>
        </g>

        {/* 8. Speaker Circles (Y-anchor: 380) */}
        {speakers.length > 0 ? (
          speakers.slice(0, 4).map((speaker, i) => {
            const pos = layout.positions[i];
            const currentX = pos.x + (i * speakerSpacingOffset);
            const r = layout.circleR;
            return (
              <g key={i}>
                <defs>
                  <clipPath id={`speaker-clip-${i}`}>
                    <circle cx={currentX} cy={pos.y} r={r} />
                  </clipPath>
                  <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
                {/* Outer Ring */}
                <circle cx={currentX} cy={pos.y} r={r + 5} stroke="url(#ring-grad)" strokeWidth="4" fill="none" />
                {/* Speaker Photo */}
                {speaker.photoUrl ? (
                  <image
                    href={speaker.photoUrl}
                    x={currentX - r}
                    y={pos.y - r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#speaker-clip-${i})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle cx={currentX} cy={pos.y} r={r} fill="#1e293b" />
                )}
                
                {/* Name - Left Aligned (Issue Fix) */}
                <text
                  x={currentX - r}
                  y={pos.y + r + 28}
                  fill="white"
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.fontSize}
                  fontWeight="700"
                  textAnchor="start"
                >
                  {speaker.name}
                </text>
                
                {/* Position - SVG text with manual wrap */}
                <text
                  x={currentX - r}
                  y={pos.y + r + 58}
                  fill="white"
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.posFontSize}
                  fontWeight="500"
                  textAnchor="start"
                >
                  {wrapText(speaker.position.toUpperCase(), Math.floor(layout.textWidth / (layout.posFontSize * 0.55))).slice(0, 4).map((line, li) => (
                    <tspan key={li} x={currentX - r} dy={li === 0 ? 0 : layout.posFontSize * 1.3}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })
        ) : (
          <text x="380" y="450" fill="white" fillOpacity="0.3" textAnchor="middle" fontSize="20" fontWeight="700">PILIH PEMBICARA</text>
        )}

        {/* 9. Footer Medsos Pill (Proper SVG Paths - Issue 2) */}
        <g transform="translate(80, 615)">
          <rect x={0} y={0} width={310} height={48} rx={24} fill="white"/>
          
          {/* Instagram - x=18 */}
          <g transform="translate(18, 13)" fill="#0c1e4a">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" transform="scale(0.91)"/>
          </g>
          
          {/* Facebook - x=48 */}
          <g transform="translate(48, 13)" fill="#0c1e4a">
            <path d="M22 11C22 4.92 17.08 0 11 0C4.92 0 0 4.92 0 11C0 16.49 4.02 21.04 9.28 21.87V14.18H6.49V11H9.28V8.58C9.28 5.83 10.92 4.31 13.43 4.31C14.63 4.31 15.89 4.52 15.89 4.52V7.22H14.5C13.13 7.22 12.7 8.07 12.7 8.95V11H15.76L15.27 14.18H12.7V21.87C17.98 21.04 22 16.49 22 11Z" transform="scale(0.91)"/>
          </g>
          
          {/* TikTok - x=78 */}
          <g transform="translate(78, 13)" fill="#0c1e4a">
            <path d="M16.6 5.82C15.92 5.42 15.34 4.85 14.9 4.17C14.42 3.43 14.16 2.55 14.16 1.65V1H10.85V14.13C10.85 15.36 9.85 16.36 8.62 16.36C7.4 16.36 6.4 15.36 6.4 14.13C6.4 12.91 7.4 11.91 8.62 11.91C8.95 11.91 9.27 11.98 9.55 12.11V8.74C9.25 8.7 8.94 8.68 8.62 8.68C5.62 8.68 3.18 11.13 3.18 14.13C3.18 17.13 5.62 19.58 8.62 19.58C11.62 19.58 14.07 17.13 14.07 14.13V8.05C15.21 8.85 16.59 9.32 18.09 9.32V6C17.55 6 17.04 5.94 16.6 5.82Z" transform="scale(0.91)"/>
          </g>
          
          {/* YouTube - x=108 */}
          <g transform="translate(108, 15)" fill="#0c1e4a">
            <path d="M21.58 3.18C21.34 2.27 20.62 1.55 19.7 1.31C18.05 0.85 11.39 0.85 11.39 0.85C11.39 0.85 4.74 0.85 3.08 1.31C2.17 1.55 1.45 2.27 1.21 3.18C0.75 4.84 0.75 8.32 0.75 8.32C0.75 8.32 0.75 11.79 1.21 13.45C1.45 14.36 2.17 15.05 3.08 15.29C4.74 15.75 11.39 15.75 11.39 15.75C11.39 15.75 18.05 15.75 19.7 15.29C20.62 15.05 21.34 14.36 21.58 13.45C22.04 11.79 22.04 8.32 22.04 8.32C22.04 8.32 22.04 4.84 21.58 3.18ZM9.27 11.49V5.14L14.79 8.32L9.27 11.49Z" transform="scale(0.91)"/>
          </g>
          
          {/* Username text */}
          <text x={150} y={31} fill="#0c1e4a" fontSize="17" fontWeight="700" fontFamily="Inter, sans-serif">
            @rri_bandaaceh
          </text>
        </g>

        {/* 10. Info Promosi Bubble */}
        <g transform="translate(440, 615)">
          <circle cx="24" cy="24" r="24" fill="#22c55e" />
          <path transform="translate(12, 12) scale(1)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="60"
            y="18"
            fill="white"
            fontFamily="Inter, sans-serif"
            fontSize="16"
            fontWeight="700"
          >
            INFO PROMOSI & KERJASAMA
          </text>
          <text
            x="60"
            y="40"
            fill="white"
            fontFamily="Inter, sans-serif"
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
