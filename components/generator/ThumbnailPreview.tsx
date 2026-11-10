'use client';

import React from 'react';
import { RRI_SOCIAL_MEDIA_IMAGE_BASE64 } from '@/lib/constants/socialMedia';

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
  programLogoUrl: string | null;
  hutRiLogoUrl?: string | null;
  socialMediaLogoUrl?: string | null;
  showRriLogo?: boolean;
  showProgramLogo?: boolean;
  showSocialMediaLogo?: boolean;
  rriLogoPosition?: 'left' | 'right';
  programLogoPosition?: 'left' | 'right';
  rriLogoScale?: number;
  programLogoScale?: number;
  titleColor?: string;
  infoColor?: string;
  speakerColor?: string;
  promoColor?: string;
  titleXOffset?: number;
  titleYOffset?: number;
  showEventName?: boolean;
  showHutRiLogo?: boolean;
  rriLogoTheme?: 'white' | 'dark';
  programLogoTheme?: 'white' | 'dark';
  hutRiLogoTheme?: 'white' | 'dark';
  speakerXOffset?: number;
  speakerSpacingOffset?: number;
  speakerYOffset?: number;
  speakerTextOffset?: number;
  speakerTextYOffset?: number;
  speakerLayoutMode?: 'row' | 'grid';
  speakerRowSpacingOffset?: number;
  eventInfoYOffset?: number;
  eventInfoXSpacing?: number;
  phoneNumber?: string;
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
    programLogoUrl,
    hutRiLogoUrl,
    socialMediaLogoUrl,
    showRriLogo = true,
    showProgramLogo = true,
    showSocialMediaLogo = true,
    showHutRiLogo,
    rriLogoPosition = 'left',
    programLogoPosition = 'right',
    rriLogoScale = 100,
    programLogoScale = 100,
    titleColor = '#FFFFFF',
    infoColor = '#FFFFFF',
    speakerColor = '#FFFFFF',
    promoColor = '#FFFFFF',
    titleXOffset = 0,
    titleYOffset = 0,
    showEventName = true,
    speakerXOffset = 0,
    speakerSpacingOffset = 0,
    speakerYOffset = 0,
    speakerTextOffset = 0,
    speakerTextYOffset = 0,
    speakerLayoutMode = 'row',
    speakerRowSpacingOffset = 0,
    eventInfoYOffset = 0,
    eventInfoXSpacing = 0,
    phoneNumber = '0811 6881 2123',
  } = data;
  
  // Check if date contains AGUSTUS
  const isAugust = date.toUpperCase().includes('AGUSTUS');

  // Determine logo positions, sizes, and visibility
  const showRri = showRriLogo !== false && Boolean(rriLogoUrl);
  const showProg = showProgramLogo !== false && Boolean(programLogoUrl);

  const rriW = Math.round(140 * (rriLogoScale / 100));
  const rriH = Math.round(70 * (rriLogoScale / 100));
  const progW = Math.round(140 * (programLogoScale / 100));
  const progH = Math.round(70 * (programLogoScale / 100));

  let rriX = 80;
  let rriY = Math.round(85 - rriH / 2);
  let progX = 1220 - progW;
  let progY = Math.round(80 - progH / 2);

  if (showRri && showProg) {
    if (rriLogoPosition === 'right' && programLogoPosition === 'left') {
      rriX = 1220 - rriW;
      rriY = Math.round(80 - rriH / 2);
      progX = 80;
      progY = Math.round(85 - progH / 2);
    } else if (rriLogoPosition === 'left' && programLogoPosition === 'left') {
      rriX = 80;
      rriY = Math.round(85 - rriH / 2);
      progX = 80 + rriW + 20;
      progY = Math.round(80 - progH / 2);
    } else if (rriLogoPosition === 'right' && programLogoPosition === 'right') {
      progX = 1220 - progW;
      progY = Math.round(80 - progH / 2);
      rriX = progX - 20 - rriW;
      rriY = Math.round(80 - rriH / 2);
    } else {
      rriX = 80;
      rriY = Math.round(85 - rriH / 2);
      progX = 1220 - progW;
      progY = Math.round(80 - progH / 2);
    }
  } else if (showRri) {
    rriX = rriLogoPosition === 'right' ? 1220 - rriW : 80;
    rriY = Math.round((rriLogoPosition === 'right' ? 80 : 85) - rriH / 2);
  } else if (showProg) {
    progX = programLogoPosition === 'left' ? 80 : 1220 - progW;
    progY = Math.round((programLogoPosition === 'left' ? 85 : 80) - progH / 2);
  }

  // Left-aligned single-row speaker layouts starting from x=80
  const rowSpeakerLayouts: Record<number, any> = {
    1: { positions: [{ x: 180, y: 405 }], circleR: 90, textWidth: 600, fontSize: 32, posFontSize: 20 },
    2: { positions: [{ x: 150, y: 405 }, { x: 410, y: 405 }], circleR: 70, textWidth: 200, fontSize: 15, posFontSize: 11 },
    3: { positions: [{ x: 145, y: 405 }, { x: 365, y: 405 }, { x: 585, y: 405 }], circleR: 65, textWidth: 180, fontSize: 14, posFontSize: 11 },
    4: { positions: [{ x: 135, y: 405 }, { x: 335, y: 405 }, { x: 535, y: 405 }, { x: 735, y: 405 }], circleR: 55, textWidth: 160, fontSize: 13, posFontSize: 10 },
    5: { positions: [{ x: 120, y: 405 }, { x: 290, y: 405 }, { x: 460, y: 405 }, { x: 630, y: 405 }, { x: 800, y: 405 }], circleR: 48, textWidth: 140, fontSize: 12, posFontSize: 9 },
  };

  // 2-row Grid speaker layouts for 3, 4, and 5 speakers
  const gridSpeakerLayouts: Record<number, any> = {
    3: {
      positions: [
        { x: 185, y: 365, row: 0, colOffset: -1 },
        { x: 435, y: 365, row: 0, colOffset: 1 },
        { x: 310, y: 510, row: 1, colOffset: 0 },
      ],
      circleR: 46,
      textWidth: 215,
      fontSize: 13.5,
      posFontSize: 10,
    },
    4: {
      positions: [
        { x: 185, y: 365, row: 0, colOffset: -1 },
        { x: 435, y: 365, row: 0, colOffset: 1 },
        { x: 185, y: 510, row: 1, colOffset: -1 },
        { x: 435, y: 510, row: 1, colOffset: 1 },
      ],
      circleR: 46,
      textWidth: 215,
      fontSize: 13.5,
      posFontSize: 10,
    },
    5: {
      positions: [
        { x: 145, y: 365, row: 0, colOffset: -1 },
        { x: 355, y: 365, row: 0, colOffset: 0 },
        { x: 565, y: 365, row: 0, colOffset: 1 },
        { x: 250, y: 510, row: 1, colOffset: -0.6 },
        { x: 460, y: 510, row: 1, colOffset: 0.6 },
      ],
      circleR: 42,
      textWidth: 185,
      fontSize: 13,
      posFontSize: 9.5,
    },
  };

  const count = Math.min(Math.max(speakers.length, 1), 5);
  const isGridLayout = count > 2 && speakerLayoutMode === 'grid';
  const layout = isGridLayout ? gridSpeakerLayouts[count] : rowSpeakerLayouts[count];

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
        {showRri && rriLogoUrl && (
          <image
            href={rriLogoUrl}
            x={rriX}
            y={rriY}
            width={rriW}
            height={rriH}
            preserveAspectRatio={rriLogoPosition === 'right' ? "xMaxYMid meet" : "xMinYMid meet"}
          />
        )}

        {/* 3. Logo Program (PRO 1 / PRO 2 / PRO 4) */}
        {showProg && programLogoUrl && (
          <image
            href={programLogoUrl}
            x={progX}
            y={progY}
            width={progW}
            height={progH}
            preserveAspectRatio={programLogoPosition === 'right' ? "xMaxYMid meet" : "xMinYMid meet"}
          />
        )}

        {/* 3.5 Logo HUT RI (Shown if enabled or in August) */}
        {(showHutRiLogo ?? isAugust) && hutRiLogoUrl && (
          <image href={hutRiLogoUrl} x="720" y="25" width="340" height="110" preserveAspectRatio="xMaxYMid meet" />
        )}

        {/* 4. Title */}
        <text
          x={80 + titleXOffset}
          y={180 + titleYOffset}
          fill={titleColor}
          fontFamily="Space Grotesk, sans-serif"
          fontSize="36"
          fontWeight="700"
          textAnchor="start"
        >
          {title.toUpperCase().split('\n').map((line, i) => (
            <tspan x={80 + titleXOffset} dy={i === 0 ? 0 : 50} key={i}>{line}</tspan>
          ))}
        </text>

        {/* 5. Event Name */}
        {showEventName !== false && (
          <text
            x="80"
            y={295 + eventInfoYOffset}
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="22"
            fontWeight="700"
            letterSpacing="1"
          >
            {eventName.toUpperCase()}
          </text>
        )}

        {/* 6. Date with Calendar Icon */}
        <g transform={`translate(${showEventName !== false ? (420 + eventInfoXSpacing) : (80 + eventInfoXSpacing)}, ${275 + eventInfoYOffset})`}>
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke={infoColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke={infoColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke={infoColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke={infoColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="32"
            y="18"
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {date.toUpperCase()}
          </text>
        </g>

        {/* 7. Time with Clock Icon */}
        <g transform={`translate(${showEventName !== false ? (750 + eventInfoXSpacing * 2) : (440 + eventInfoXSpacing * 2)}, ${273 + eventInfoYOffset})`}>
          <circle cx="12" cy="12" r="10" stroke={infoColor} strokeWidth="2" />
          <path d="M12 6V12L16 14" stroke={infoColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x="32"
            y="20"
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="700"
          >
            {time}
          </text>
        </g>

        {/* 8. Speaker Circles (Y-anchor: 380) */}
        {speakers.length > 0 ? (
          speakers.slice(0, 5).map((speaker, i) => {
            const pos = layout.positions[i];
            const currentX =
              pos.x +
              speakerXOffset +
              (isGridLayout
                ? (pos.colOffset ?? 0) * speakerSpacingOffset
                : count === 1
                ? 0
                : i * speakerSpacingOffset);
            const currentY =
              pos.y +
              speakerYOffset +
              (isGridLayout && pos.row === 1 ? speakerRowSpacingOffset : 0);
            const r = layout.circleR;
            const textX =
              (count === 1
                ? currentX + r + 30
                : isGridLayout
                ? currentX
                : currentX - r) + speakerTextOffset;
            const nameY =
              (count === 1
                ? currentY - 5
                : isGridLayout
                ? currentY + r + 18
                : currentY + r + 28) + speakerTextYOffset;
            const posY =
              (count === 1
                ? currentY + 35
                : isGridLayout
                ? currentY + r + 35
                : currentY + r + 58) + speakerTextYOffset;
            const anchor = isGridLayout ? 'middle' : 'start';
            return (
              <g key={i}>
                <defs>
                  <clipPath id={`${id}-speaker-clip-${i}`}>
                    <circle cx={currentX} cy={currentY} r={r} />
                  </clipPath>
                  <linearGradient id={`${id}-ring-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
                {/* Outer Ring */}
                <circle cx={currentX} cy={currentY} r={r + 5} stroke={`url(#${id}-ring-grad)`} strokeWidth="4" fill="none" />
                {/* Speaker Photo */}
                {speaker.photoUrl ? (
                  <image
                    href={speaker.photoUrl}
                    x={currentX - r}
                    y={currentY - r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#${id}-speaker-clip-${i})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <circle cx={currentX} cy={currentY} r={r} fill="#1e293b" />
                )}
                
                {/* Name */}
                <text
                  x={textX}
                  y={nameY}
                  fill={speakerColor}
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.fontSize}
                  fontWeight="700"
                  textAnchor={anchor}
                >
                  {speaker.name}
                </text>
                
                {/* Position - SVG text with manual wrap */}
                <text
                  x={textX}
                  y={posY}
                  fill={speakerColor}
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.posFontSize}
                  fontWeight="500"
                  textAnchor={anchor}
                >
                  {wrapText(speaker.position.toUpperCase(), Math.floor(layout.textWidth / (layout.posFontSize * 0.55))).slice(0, isGridLayout ? 2 : 4).map((line, li) => (
                    <tspan key={li} x={textX} dy={li === 0 ? 0 : layout.posFontSize * 1.3}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })
        ) : (
          <text x="380" y="450" fill="white" fillOpacity="0.3" textAnchor="middle" fontSize="20" fontWeight="700">PILIH PEMBICARA</text>
        )}

        {/* 9. Footer Medsos Image (Untouched image placed directly at bottom-left corner, scaled -20%) */}
        {showSocialMediaLogo !== false && (
          <image
            href={socialMediaLogoUrl || RRI_SOCIAL_MEDIA_IMAGE_BASE64}
            x={60}
            y={623}
            width={462}
            height={38}
            preserveAspectRatio="xMinYMid meet"
          />
        )}

        {/* 10. Info Promosi Bubble */}
        <g transform="translate(550, 620)">
          <circle cx="22" cy="22" r="22" fill="#22c55e" />
          <path transform="translate(11, 11) scale(0.9)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="54"
            y="16"
            fill={promoColor}
            fontFamily="Inter, sans-serif"
            fontSize="14"
            fontWeight="700"
          >
            INFO PROMOSI & KERJASAMA
          </text>
          <text
            x="54"
            y="36"
            fill={promoColor}
            fontFamily="Inter, sans-serif"
            fontSize="16"
            fontWeight="700"
          >
            {phoneNumber}
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
