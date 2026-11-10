'use client';

import React from 'react';
import { ThumbnailData } from './ThumbnailPreview';
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

interface PosterPreviewProps {
  data: ThumbnailData;
  id?: string;
}

export function PosterPreview({ data, id = 'poster-svg' }: PosterPreviewProps) {
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
    speakerLayoutMode = 'grid',
    speakerRowSpacingOffset = 0,
    eventInfoYOffset = 0,
    eventInfoXSpacing = 0,
    phoneNumber = '0811 6881 2123',
  } = data;

  const isAugust = date.toUpperCase().includes('AGUSTUS');

  // Determine logo positions, scale, and visibility
  const showRri = showRriLogo !== false && Boolean(rriLogoUrl);
  const showProg = showProgramLogo !== false && Boolean(programLogoUrl);

  const rriW = Math.round(160 * (rriLogoScale / 100));
  const rriH = Math.round(80 * (rriLogoScale / 100));
  const progW = Math.round(160 * (programLogoScale / 100));
  const progH = Math.round(80 * (programLogoScale / 100));

  let rriX = 70;
  let rriY = Math.round(100 - rriH / 2);
  let progX = 1010 - progW;
  let progY = Math.round(95 - progH / 2);

  if (showRri && showProg) {
    if (rriLogoPosition === 'right' && programLogoPosition === 'left') {
      rriX = 1010 - rriW;
      rriY = Math.round(95 - rriH / 2);
      progX = 70;
      progY = Math.round(100 - progH / 2);
    } else if (rriLogoPosition === 'left' && programLogoPosition === 'left') {
      rriX = 70;
      rriY = Math.round(100 - rriH / 2);
      progX = 70 + rriW + 20;
      progY = Math.round(95 - progH / 2);
    } else if (rriLogoPosition === 'right' && programLogoPosition === 'right') {
      progX = 1010 - progW;
      progY = Math.round(95 - progH / 2);
      rriX = progX - rriW - 20;
      rriY = Math.round(95 - rriH / 2);
    } else {
      rriX = 70;
      rriY = Math.round(100 - rriH / 2);
      progX = 1010 - progW;
      progY = Math.round(95 - progH / 2);
    }
  } else if (showRri) {
    rriX = rriLogoPosition === 'right' ? 1010 - rriW : 70;
    rriY = Math.round((rriLogoPosition === 'right' ? 95 : 100) - rriH / 2);
  } else if (showProg) {
    progX = programLogoPosition === 'left' ? 70 : 1010 - progW;
    progY = Math.round((programLogoPosition === 'left' ? 100 : 95) - progH / 2);
  }

  // Single-row speaker layouts for 1080 x 1350 (4:5)
  const rowSpeakerLayouts: Record<number, any> = {
    1: {
      positions: [{ x: 185, y: 700, row: 0, colOffset: 0 }],
      circleR: 115,
      textWidth: 660,
      fontSize: 32,
      posFontSize: 20,
    },
    2: {
      positions: [
        { x: 310, y: 710, row: 0, colOffset: -1 },
        { x: 770, y: 710, row: 0, colOffset: 1 },
      ],
      circleR: 115,
      textWidth: 380,
      fontSize: 24,
      posFontSize: 16,
    },
    3: {
      positions: [
        { x: 190, y: 720, row: 0, colOffset: -1 },
        { x: 540, y: 720, row: 0, colOffset: 0 },
        { x: 890, y: 720, row: 0, colOffset: 1 },
      ],
      circleR: 90,
      textWidth: 280,
      fontSize: 19,
      posFontSize: 13,
    },
    4: {
      positions: [
        { x: 150, y: 720, row: 0, colOffset: -1.5 },
        { x: 410, y: 720, row: 0, colOffset: -0.5 },
        { x: 670, y: 720, row: 0, colOffset: 0.5 },
        { x: 930, y: 720, row: 0, colOffset: 1.5 },
      ],
      circleR: 72,
      textWidth: 220,
      fontSize: 16,
      posFontSize: 11.5,
    },
    5: {
      positions: [
        { x: 130, y: 720, row: 0, colOffset: -2 },
        { x: 335, y: 720, row: 0, colOffset: -1 },
        { x: 540, y: 720, row: 0, colOffset: 0 },
        { x: 745, y: 720, row: 0, colOffset: 1 },
        { x: 950, y: 720, row: 0, colOffset: 2 },
      ],
      circleR: 58,
      textWidth: 180,
      fontSize: 14,
      posFontSize: 10,
    },
  };

  // 2-row Grid speaker layouts for 3, 4, and 5 speakers on 1080 x 1350 (4:5)
  const gridSpeakerLayouts: Record<number, any> = {
    3: {
      positions: [
        { x: 320, y: 640, row: 0, colOffset: -1 },
        { x: 760, y: 640, row: 0, colOffset: 1 },
        { x: 540, y: 920, row: 1, colOffset: 0 },
      ],
      circleR: 85,
      textWidth: 360,
      fontSize: 20,
      posFontSize: 14,
    },
    4: {
      positions: [
        { x: 320, y: 640, row: 0, colOffset: -1 },
        { x: 760, y: 640, row: 0, colOffset: 1 },
        { x: 320, y: 920, row: 1, colOffset: -1 },
        { x: 760, y: 920, row: 1, colOffset: 1 },
      ],
      circleR: 80,
      textWidth: 380,
      fontSize: 20,
      posFontSize: 14,
    },
    5: {
      positions: [
        { x: 200, y: 640, row: 0, colOffset: -1 },
        { x: 540, y: 640, row: 0, colOffset: 0 },
        { x: 880, y: 640, row: 0, colOffset: 1 },
        { x: 360, y: 920, row: 1, colOffset: -1 },
        { x: 720, y: 920, row: 1, colOffset: 1 },
      ],
      circleR: 72,
      textWidth: 280,
      fontSize: 17,
      posFontSize: 12,
    },
  };

  const count = Math.min(Math.max(speakers.length, 1), 5);
  const isGridLayout = count > 2 && speakerLayoutMode === 'grid';
  const layout = isGridLayout ? gridSpeakerLayouts[count] : rowSpeakerLayouts[count];

  return (
    <div className="w-full max-w-[480px] mx-auto aspect-[4/5] bg-slate-200 rounded-2xl overflow-hidden shadow-2xl border border-slate-300 relative group">
      <svg
        id={id}
        viewBox="0 0 1080 1350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`${id}-ring-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>

        {/* 1. Background Layer */}
        {presenterBgUrl ? (
          <image href={presenterBgUrl} width="1080" height="1350" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <rect width="1080" height="1350" fill="#060f2c" />
        )}

        {/* 2. Logo RRI */}
        {showRri && rriLogoUrl && (
          <image
            href={rriLogoUrl}
            x={rriX}
            y={rriY}
            width={rriW}
            height={rriH}
            preserveAspectRatio={rriX > 500 ? "xMaxYMid meet" : "xMinYMid meet"}
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
            preserveAspectRatio={progX > 500 ? "xMaxYMid meet" : "xMinYMid meet"}
          />
        )}

        {/* 3.5 Logo HUT RI (Shown if enabled or in August) */}
        {(showHutRiLogo ?? isAugust) && hutRiLogoUrl && (
          <image href={hutRiLogoUrl} x="420" y="45" width="280" height="95" preserveAspectRatio="xMidYMid meet" />
        )}

        {/* 4. Title */}
        <text
          x={70 + titleXOffset}
          y={225 + titleYOffset}
          fill={titleColor}
          fontFamily="Space Grotesk, sans-serif"
          fontSize="42"
          fontWeight="700"
          textAnchor="start"
        >
          {title.toUpperCase().split('\n').map((line, i) => (
            <tspan x={70 + titleXOffset} dy={i === 0 ? 0 : 56} key={i}>{line}</tspan>
          ))}
        </text>

        {/* 5. Event Name */}
        {showEventName !== false && (
          <text
            x="70"
            y={380 + eventInfoYOffset}
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="24"
            fontWeight="700"
            letterSpacing="1.5"
          >
            {eventName.toUpperCase()}
          </text>
        )}

        {/* 6. Date with Calendar Icon */}
        <g transform={`translate(70, ${425 + eventInfoYOffset})`}>
          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke={infoColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6" stroke={infoColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 2V6" stroke={infoColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 10H21" stroke={infoColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="34"
            y="18"
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="22"
            fontWeight="700"
          >
            {date.toUpperCase()}
          </text>
        </g>

        {/* 7. Time with Clock Icon */}
        <g transform={`translate(${540 + eventInfoXSpacing}, ${423 + eventInfoYOffset})`}>
          <circle cx="12" cy="12" r="10" stroke={infoColor} strokeWidth="2.2" />
          <path d="M12 6V12L16 14" stroke={infoColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x="34"
            y="20"
            fill={infoColor}
            fontFamily="Inter, sans-serif"
            fontSize="22"
            fontWeight="700"
          >
            {time}
          </text>
        </g>

        {/* Subtle separator line */}
        <line
          x1="70"
          y1={480 + eventInfoYOffset}
          x2="1010"
          y2={480 + eventInfoYOffset}
          stroke={infoColor}
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        {/* 8. Speaker Circles */}
        {speakers.length > 0 ? (
          speakers.slice(0, 5).map((speaker, i) => {
            const pos = layout.positions[i];
            const r = layout.circleR;

            const xOffset = (pos.colOffset ?? 0) * speakerSpacingOffset;
            const yRowOffset = isGridLayout && pos.row === 1 ? speakerRowSpacingOffset : 0;

            const currentX = pos.x + speakerXOffset + xOffset;
            const currentY = pos.y + speakerYOffset + yRowOffset;
            const textX = (count === 1 ? currentX + r + 35 : currentX) + speakerTextOffset;
            const nameY = (count === 1 ? currentY - 6 : currentY + r + 28) + speakerTextYOffset;
            const posY =
              (count === 1
                ? currentY + 36
                : currentY + r + 28 + layout.fontSize * 1.2) + speakerTextYOffset;
            const anchor = count === 1 ? 'start' : 'middle';

            return (
              <g key={i}>
                <defs>
                  <clipPath id={`${id}-speaker-clip-${i}`}>
                    <circle cx={currentX} cy={currentY} r={r} />
                  </clipPath>
                </defs>

                {/* Outer Ring */}
                <circle
                  cx={currentX}
                  cy={currentY}
                  r={r + 5}
                  stroke={`url(#${id}-ring-grad)`}
                  strokeWidth="4"
                  fill="none"
                />

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

                {/* Speaker Name */}
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

                {/* Speaker Position */}
                <text
                  x={textX}
                  y={posY}
                  fill={speakerColor}
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.posFontSize}
                  fontWeight="500"
                  textAnchor={anchor}
                >
                  {wrapText(speaker.position.toUpperCase(), Math.floor(layout.textWidth / (layout.posFontSize * 0.55))).slice(0, count === 1 ? 4 : 3).map((line, li) => (
                    <tspan
                      key={li}
                      x={textX}
                      dy={li === 0 ? 0 : layout.posFontSize * 1.3}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })
        ) : (
          <text x="540" y="750" fill="white" fillOpacity="0.3" textAnchor="middle" fontSize="24" fontWeight="700">
            PILIH PEMBICARA
          </text>
        )}

        {/* 9. Footer Medsos Image (Untouched image placed directly at bottom-left corner, scaled -20%) */}
        {showSocialMediaLogo !== false && (
          <image
            href={socialMediaLogoUrl || RRI_SOCIAL_MEDIA_IMAGE_BASE64}
            x={50}
            y={1246}
            width={432}
            height={36}
            preserveAspectRatio="xMinYMid meet"
          />
        )}

        {/* 10. Info Promosi Bubble */}
        <g transform="translate(515, 1240)">
          <circle cx="24" cy="24" r="24" fill="#22c55e" />
          <path transform="translate(12, 12) scale(1)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="60"
            y="18"
            fill={promoColor}
            fontFamily="Inter, sans-serif"
            fontSize="15"
            fontWeight="700"
          >
            INFO PROMOSI & KERJASAMA
          </text>
          <text
            x="60"
            y="40"
            fill={promoColor}
            fontFamily="Inter, sans-serif"
            fontSize="17"
            fontWeight="700"
          >
            {phoneNumber}
          </text>
        </g>
      </svg>
    </div>
  );
}
