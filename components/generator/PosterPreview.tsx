'use client';

import React from 'react';
import { ThumbnailData } from './ThumbnailPreview';

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
    showRriLogo = true,
    showProgramLogo = true,
    showHutRiLogo,
    rriLogoPosition = 'left',
    programLogoPosition = 'right',
    titleColor = '#FFFFFF',
    infoColor = '#FFFFFF',
    speakerColor = '#FFFFFF',
    titleXOffset = 0,
    titleYOffset = 0,
    showEventName = true,
    speakerSpacingOffset = 0,
    speakerYOffset = 0,
    eventInfoYOffset = 0,
    eventInfoXSpacing = 0,
    phoneNumber = '0811 6881 2123',
  } = data;

  const isAugust = date.toUpperCase().includes('AGUSTUS');

  // Determine logo positions and visibility
  const showRri = showRriLogo !== false && Boolean(rriLogoUrl);
  const showProg = showProgramLogo !== false && Boolean(programLogoUrl);

  let rriX = 70;
  let rriY = 60;
  let progX = 850;
  let progY = 55;

  if (showRri && showProg) {
    if (rriLogoPosition === 'right' && programLogoPosition === 'left') {
      rriX = 850;
      rriY = 55;
      progX = 70;
      progY = 60;
    } else if (rriLogoPosition === 'left' && programLogoPosition === 'left') {
      rriX = 70;
      rriY = 60;
      progX = 250;
      progY = 55;
    } else if (rriLogoPosition === 'right' && programLogoPosition === 'right') {
      rriX = 670;
      rriY = 55;
      progX = 850;
      progY = 55;
    } else {
      rriX = 70;
      rriY = 60;
      progX = 850;
      progY = 55;
    }
  } else if (showRri) {
    rriX = rriLogoPosition === 'right' ? 850 : 70;
    rriY = rriLogoPosition === 'right' ? 55 : 60;
  } else if (showProg) {
    progX = programLogoPosition === 'left' ? 70 : 850;
    progY = programLogoPosition === 'left' ? 60 : 55;
  }

  // Speaker layout configurations for 1080 x 1350 (4:5)
  const speakerLayouts: Record<number, any> = {
    1: {
      positions: [{ x: 540, y: 700 }],
      circleR: 140,
      textWidth: 700,
      fontSize: 30,
      posFontSize: 19,
    },
    2: {
      positions: [{ x: 310, y: 710 }, { x: 770, y: 710 }],
      circleR: 115,
      textWidth: 380,
      fontSize: 24,
      posFontSize: 16,
    },
    3: {
      positions: [{ x: 190, y: 720 }, { x: 540, y: 720 }, { x: 890, y: 720 }],
      circleR: 90,
      textWidth: 280,
      fontSize: 19,
      posFontSize: 13,
    },
    4: {
      positions: [
        { x: 320, y: 640 },
        { x: 760, y: 640 },
        { x: 320, y: 920 },
        { x: 760, y: 920 },
      ],
      circleR: 80,
      textWidth: 380,
      fontSize: 20,
      posFontSize: 14,
    },
    5: {
      positions: [
        { x: 200, y: 640 },
        { x: 540, y: 640 },
        { x: 880, y: 640 },
        { x: 360, y: 920 },
        { x: 720, y: 920 },
      ],
      circleR: 72,
      textWidth: 280,
      fontSize: 17,
      posFontSize: 12,
    },
  };

  const count = Math.min(Math.max(speakers.length, 1), 5);
  const layout = speakerLayouts[count];

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
          {/* Subtle gradient to keep header text always sharp */}
          <linearGradient id={`${id}-header-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060f2c" stopOpacity="0.88" />
            <stop offset="65%" stopColor="#060f2c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#060f2c" stopOpacity="0" />
          </linearGradient>
          {/* Subtle gradient for bottom text & footer */}
          <linearGradient id={`${id}-footer-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060f2c" stopOpacity="0" />
            <stop offset="45%" stopColor="#060f2c" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#060f2c" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`${id}-ring-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>

        {/* 1. Background Layer */}
        {presenterBgUrl ? (
          <>
            <image href={presenterBgUrl} width="1080" height="1350" preserveAspectRatio="xMidYMid slice" />
            {/* Overlays for enhanced readability on uploaded portrait backgrounds */}
            <rect width="1080" height="520" fill={`url(#${id}-header-grad)`} />
            <rect y="740" width="1080" height="610" fill={`url(#${id}-footer-grad)`} />
          </>
        ) : (
          /* Jika background belum di-upload, gunakan warna hitam polos */
          <rect width="1080" height="1350" fill="#000000" />
        )}

        {/* 2. Logo RRI */}
        {showRri && rriLogoUrl && (
          <image
            href={rriLogoUrl}
            x={rriX}
            y={rriY}
            width="160"
            height="80"
            preserveAspectRatio={rriX > 500 ? "xMaxYMid meet" : "xMinYMid meet"}
          />
        )}

        {/* 3. Logo Program (PRO 1 / PRO 2 / PRO 4) */}
        {showProg && programLogoUrl && (
          <image
            href={programLogoUrl}
            x={progX}
            y={progY}
            width="160"
            height="80"
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

            // Calculate responsive spacing offsets
            let xOffset = 0;
            if (count === 1) {
              xOffset = 0;
            } else if (count === 2) {
              xOffset = (i === 0 ? -1 : 1) * speakerSpacingOffset;
            } else if (count === 3) {
              xOffset = (i - 1) * speakerSpacingOffset;
            } else if (count === 4) {
              xOffset = (i % 2 === 0 ? -1 : 1) * speakerSpacingOffset;
            } else if (count === 5) {
              if (i < 3) {
                xOffset = (i === 0 ? -1 : i === 2 ? 1 : 0) * speakerSpacingOffset;
              } else {
                xOffset = (i === 3 ? -1 : 1) * speakerSpacingOffset;
              }
            }

            const currentX = pos.x + xOffset;
            const currentY = pos.y + speakerYOffset;

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
                  x={currentX}
                  y={currentY + r + 28}
                  fill={speakerColor}
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.fontSize}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {speaker.name}
                </text>

                {/* Speaker Position */}
                <text
                  x={currentX}
                  y={currentY + r + 28 + (layout.fontSize * 1.2)}
                  fill={speakerColor}
                  fontFamily="Inter, sans-serif"
                  fontSize={layout.posFontSize}
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {wrapText(speaker.position.toUpperCase(), Math.floor(layout.textWidth / (layout.posFontSize * 0.55))).slice(0, 3).map((line, li) => (
                    <tspan
                      key={li}
                      x={currentX}
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

        {/* 9. Footer Medsos Bar (Exact match to official RRI Banda Aceh branding) */}
        <g transform="translate(45, 1245)">
          <defs>
            <linearGradient id={`${id}-ig-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#feda75" />
              <stop offset="25%" stopColor="#fa7e1e" />
              <stop offset="50%" stopColor="#d62976" />
              <stop offset="75%" stopColor="#962fbf" />
              <stop offset="100%" stopColor="#4f5bd5" />
            </linearGradient>
          </defs>

          {/* White Background Pill */}
          <rect x={0} y={0} width={570} height={42} rx={21} fill="white"/>
          
          {/* Item 1: TikTok + Instagram + @rri_bandaaceh */}
          {/* TikTok Icon */}
          <g transform="translate(10, 9)">
            <circle cx="12" cy="12" r="12" fill="#000000" />
            <g transform="translate(4.8, 3.8) scale(0.66)">
              <path fill="#25F4EE" transform="translate(-0.8, -0.6)" d="M16.6 5.82C15.92 5.42 15.34 4.85 14.9 4.17C14.42 3.43 14.16 2.55 14.16 1.65V1H10.85V14.13C10.85 15.36 9.85 16.36 8.62 16.36C7.4 16.36 6.4 15.36 6.4 14.13C6.4 12.91 7.4 11.91 8.62 11.91C8.95 11.91 9.27 11.98 9.55 12.11V8.74C9.25 8.7 8.94 8.68 8.62 8.68C5.62 8.68 3.18 11.13 3.18 14.13C3.18 17.13 5.62 19.58 8.62 19.58C11.62 19.58 14.07 17.13 14.07 14.13V8.05C15.21 8.85 16.59 9.32 18.09 9.32V6C17.55 6 17.04 5.94 16.6 5.82Z"/>
              <path fill="#FE2C55" transform="translate(0.8, 0.6)" d="M16.6 5.82C15.92 5.42 15.34 4.85 14.9 4.17C14.42 3.43 14.16 2.55 14.16 1.65V1H10.85V14.13C10.85 15.36 9.85 16.36 8.62 16.36C7.4 16.36 6.4 15.36 6.4 14.13C6.4 12.91 7.4 11.91 8.62 11.91C8.95 11.91 9.27 11.98 9.55 12.11V8.74C9.25 8.7 8.94 8.68 8.62 8.68C5.62 8.68 3.18 11.13 3.18 14.13C3.18 17.13 5.62 19.58 8.62 19.58C11.62 19.58 14.07 17.13 14.07 14.13V8.05C15.21 8.85 16.59 9.32 18.09 9.32V6C17.55 6 17.04 5.94 16.6 5.82Z"/>
              <path fill="#FFFFFF" d="M16.6 5.82C15.92 5.42 15.34 4.85 14.9 4.17C14.42 3.43 14.16 2.55 14.16 1.65V1H10.85V14.13C10.85 15.36 9.85 16.36 8.62 16.36C7.4 16.36 6.4 15.36 6.4 14.13C6.4 12.91 7.4 11.91 8.62 11.91C8.95 11.91 9.27 11.98 9.55 12.11V8.74C9.25 8.7 8.94 8.68 8.62 8.68C5.62 8.68 3.18 11.13 3.18 14.13C3.18 17.13 5.62 19.58 8.62 19.58C11.62 19.58 14.07 17.13 14.07 14.13V8.05C15.21 8.85 16.59 9.32 18.09 9.32V6C17.55 6 17.04 5.94 16.6 5.82Z"/>
            </g>
          </g>

          {/* Instagram Icon */}
          <g transform="translate(38, 9)">
            <rect x="0" y="0" width="24" height="24" rx="7" fill={`url(#${id}-ig-grad)`} />
            <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="white" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3.6" fill="none" stroke="white" strokeWidth="1.6" />
            <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
          </g>

          {/* Username @rri_bandaaceh */}
          <text x="69" y="26" fill="#000000" fontSize="13.5" fontWeight="600" fontFamily="Inter, sans-serif">
            @rri_bandaaceh
          </text>

          {/* Item 2: Facebook + @RRIBandaAcehOfficial */}
          <g transform="translate(198, 9)">
            <path fill="#1877F2" d="M22 11C22 4.92 17.08 0 11 0C4.92 0 0 4.92 0 11C0 16.49 4.02 21.04 9.28 21.87V14.18H6.49V11H9.28V8.58C9.28 5.83 10.92 4.31 13.43 4.31C14.63 4.31 15.89 4.52 15.89 4.52V7.22H14.5C13.13 7.22 12.7 8.07 12.7 8.95V11H15.76L15.27 14.18H12.7V21.87C17.98 21.04 22 16.49 22 11Z" transform="scale(1.09)"/>
          </g>
          <text x="229" y="26" fill="#000000" fontSize="13.5" fontWeight="600" fontFamily="Inter, sans-serif">
            @RRIBandaAcehOfficial
          </text>

          {/* Item 3: YouTube + @rribandaaceh */}
          <g transform="translate(405, 9)">
            <circle cx="12" cy="12" r="12" fill="#FF0000" />
            <polygon points="9.5,7.2 16.5,12 9.5,16.8" fill="white" />
          </g>
          <text x="435" y="26" fill="#000000" fontSize="13.5" fontWeight="600" fontFamily="Inter, sans-serif">
            @rribandaaceh
          </text>
        </g>

        {/* 10. Info Promosi Bubble */}
        <g transform="translate(640, 1242)">
          <circle cx="24" cy="24" r="24" fill="#22c55e" />
          <path transform="translate(12, 12) scale(1)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text
            x="60"
            y="18"
            fill="white"
            fontFamily="Inter, sans-serif"
            fontSize="15"
            fontWeight="700"
          >
            INFO PROMOSI & KERJASAMA
          </text>
          <text
            x="60"
            y="40"
            fill="white"
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
