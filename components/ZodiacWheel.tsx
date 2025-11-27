import React, { useMemo } from 'react';
import type { PlanetPosition, ActiveSector } from '../types';

interface ZodiacWheelProps {
  planets: PlanetPosition[];
  activeSectors: ActiveSector[];
  onPlanetClick: (planet: PlanetPosition) => void;
  onSectorClick: (sector: ActiveSector) => void;
  selectedPlanet?: string;
  selectedSector?: ActiveSector | null;
  config?: { width: number; height: number };
}

export const ZodiacWheel: React.FC<ZodiacWheelProps> = ({
  planets,
  activeSectors,
  onPlanetClick,
  onSectorClick,
  selectedPlanet,
  selectedSector,
}) => {
  // Signs of Zodiac
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  // Visual Helper: Create a circle with SVG
  const radius = 180;
  const center = 250;

  return (
    <div className="relative h-[500px] w-[500px] select-none">
       {/* Static SVG */}
      <svg width="500" height="500" viewBox="0 0 500 500">
        
        {/* Background Rings */}
        <circle cx={center} cy={center} r={radius + 40} stroke="#27272a" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx={center} cy={center} r={radius} stroke="#27272a" strokeWidth="2" fill="none" />
        <circle cx={center} cy={center} r={radius - 60} stroke="#27272a" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.5" />

        {/* Sectors/Signs */}
        {signs.map((sign, i) => {
          // Standard Zodiac: Aries at 9 o'clock moving counter-clockwise is 0 degrees. 
          // However, for UI visual balance, we often put Aries at Top (12 o'clock).
          // SVG 0 is 3 o'clock. 
          // i*30 degrees per sign.
          const angleDeg = i * 30; 
          const rotationAdjustment = -90; // Rotate so Aries is at top (12 o'clock)
          
          const angleRad = (angleDeg + rotationAdjustment) * (Math.PI / 180);
          
          // Check if this sign is active in sectors
          const activeSec = activeSectors.find(s => s.sign === sign);
          const isActive = !!activeSec;
          const isSelected = selectedSector?.sign === sign;

          // Calculate line positions
          const xLine = center + radius * Math.cos(angleRad);
          const yLine = center + radius * Math.sin(angleRad);

          return (
            <g key={sign}>
              {/* Divider Lines */}
              <line 
                x1={center + (radius - 20) * Math.cos(angleRad)} 
                y1={center + (radius - 20) * Math.sin(angleRad)} 
                x2={center + (radius + 10) * Math.cos(angleRad)} 
                y2={center + (radius + 10) * Math.sin(angleRad)} 
                stroke="#3f3f46" 
                strokeWidth="1"
              />
              
              {/* Highlight Active Sector - Arc */}
              {/* We draw a wedge path for the sign */}
              {isActive && (
                <path
                  d={`
                    M ${center} ${center}
                    L ${center + radius * Math.cos(angleRad)} ${center + radius * Math.sin(angleRad)}
                    A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos((angleDeg + 30 + rotationAdjustment) * Math.PI / 180)} ${center + radius * Math.sin((angleDeg + 30 + rotationAdjustment) * Math.PI / 180)}
                    Z
                  `}
                  fill={isSelected ? "rgba(16, 185, 129, 0.15)" : "transparent"}
                  stroke="none"
                  className="transition-colors duration-300"
                />
              )}
              
              {/* Text Label */}
              {/* Position text in middle of wedge */}
              <text 
                x={center + (radius + 25) * Math.cos((angleDeg + 15 + rotationAdjustment) * Math.PI / 180)} 
                y={center + (radius + 25) * Math.sin((angleDeg + 15 + rotationAdjustment) * Math.PI / 180)} 
                fill={isActive ? (isSelected ? "#10b981" : "#e4e4e7") : "#52525b"} 
                fontSize="10" 
                fontWeight={isSelected ? "bold" : "normal"}
                fontFamily="monospace"
                textAnchor="middle"
                alignmentBaseline="middle"
                className="cursor-pointer"
                onClick={() => activeSec && onSectorClick(activeSec)}
              >
                {sign.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Planets Overlay */}
      <div className="absolute inset-0 pointer-events-none">
          {planets.map((planet, i) => {
             // Calculate precise visual angle based on longitude
             // Longitude 0 = Aries 0.
             // Our Aries 0 starts at -90 degrees (12 o'clock).
             
             // Visual Angle = Longitude - 90
             const angleDeg = planet.longitude - 90;
             const angleRad = angleDeg * (Math.PI / 180);

             // Stagger radius to avoid overlap if multiple planets are close
             // Simple hash of index to vary radius between radius-60 and radius-20
             const r = radius - 35 - (i % 3) * 12; 

             const isSelected = selectedPlanet === planet.name;

             return (
                 <div
                    key={planet.name}
                    className={`absolute flex cursor-pointer pointer-events-auto items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 hover:z-50 ${
                        isSelected 
                        ? "z-40 h-8 w-8 border-emerald-400 bg-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
                        : "z-20 h-6 w-6 border-zinc-700 bg-zinc-900 text-zinc-400 shadow-md hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                    style={{
                        left: `calc(50% + ${r * Math.cos(angleRad)}px - ${isSelected ? 16 : 12}px)`,
                        top: `calc(50% + ${r * Math.sin(angleRad)}px - ${isSelected ? 16 : 12}px)`,
                    }}
                    onClick={() => onPlanetClick(planet)}
                    title={`${planet.name} in ${planet.sign}`}
                 >
                    <span className="text-[9px] font-bold tracking-tighter">{planet.name.substring(0, 2)}</span>
                    
                    {/* Retrograde Indicator */}
                    {planet.retrograde && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-black bg-red-500" />
                    )}
                 </div>
             );
          })}
      </div>
      
      {/* Center Decoration */}
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-800 bg-[#050505] shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center z-10">
          <div className="h-px w-full bg-zinc-900 absolute top-1/2 -translate-y-1/2" />
          <div className="h-full w-px bg-zinc-900 absolute left-1/2 -translate-x-1/2" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse z-20" />
      </div>
    </div>
  );
};