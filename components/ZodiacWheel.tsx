import React, { useMemo } from 'react';
import type { PlanetPosition, ActiveSector } from '../types';

interface ZodiacWheelProps {
  planets: PlanetPosition[];
  activeSectors: ActiveSector[];
  onPlanetClick: (planet: PlanetPosition) => void;
  onSignClick: (sign: string) => void;
  selectedPlanet?: string;
  selectedSign?: string | null;
  highlightedSigns?: {
      placed: string | null;
      owned: string[];
      aspected: string[];
  };
  variant?: 'diamond' | 'circle';
}

interface AspectDef {
  name: string;
  angle: number;
  color: string;
  dash?: string;
  isMajor: boolean;
}

const ASPECTS: AspectDef[] = [
    { name: "Conjunction", angle: 0,   color: "#fbbf24", isMajor: true }, // Amber
    { name: "Opposition",  angle: 180, color: "#ef4444", isMajor: true }, // Red
    { name: "Trine",       angle: 120, color: "#4ade80", isMajor: true }, // Green
    { name: "Square",      angle: 90,  color: "#ef4444", isMajor: true }, // Red
    { name: "Sextile",     angle: 60,  color: "#4ade80", isMajor: true }, // Green
    
    { name: "Semisextile", angle: 30,  color: "#52525b", dash: "2 2", isMajor: false }, // Zinc 600
    { name: "Quincunx",    angle: 150, color: "#52525b", dash: "2 2", isMajor: false },
    { name: "Semisquare",  angle: 45,  color: "#52525b", dash: "4 4", isMajor: false },
    { name: "Sesquisquare",angle: 135, color: "#52525b", dash: "4 4", isMajor: false },
    { name: "Quintile",    angle: 72,  color: "#6366f1", dash: "1 3", isMajor: false }, // Indigo
    { name: "Biquintile",  angle: 144, color: "#6366f1", dash: "1 3", isMajor: false },
];

export const ZodiacWheel: React.FC<ZodiacWheelProps> = ({
  planets,
  onPlanetClick,
  onSignClick,
  selectedPlanet,
  selectedSign,
  highlightedSigns,
  variant = 'diamond'
}) => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  // Helper to get highlighting colors
  const getHighlightStyle = (signName: string) => {
    const isPlaced = highlightedSigns?.placed === signName;
    const isSelected = selectedSign === signName;
    const isOwned = highlightedSigns?.owned.includes(signName);
    const isAspected = highlightedSigns?.aspected.includes(signName);

    // Base Style (Grid)
    let fill = "rgba(10, 10, 12, 0.4)";
    let stroke = "#27272a"; // Default dark grey grid
    let strokeWidth = 1;
    let opacity = 0.8;
    let textFill = "#71717a";
    let strokeDasharray: string | undefined = undefined; // Solid by default

    if (isPlaced) {
        // Dark Green for Placement
        fill = "rgba(21, 128, 61, 0.25)"; // green-700 opacity
        stroke = "#15803d";
        strokeDasharray = "4 2";
        opacity = 1;
        textFill = "#fff";
    } else if (isSelected) {
        // Dark Green for Selection
        fill = "rgba(21, 128, 61, 0.15)"; 
        stroke = "#15803d";
        strokeDasharray = "4 2";
        opacity = 1;
        textFill = "#fff";
    } else if (isOwned) {
        // Light Green for Ownership
        fill = "rgba(74, 222, 128, 0.05)"; // green-400 opacity
        stroke = "#4ade80";
        strokeDasharray = "2 4";
        textFill = "#86efac"; // green-300
    } else if (isAspected) {
        // Orange for Aspects
        fill = "rgba(249, 115, 22, 0.1)"; // orange-500 opacity
        stroke = "#f97316";
        strokeDasharray = "2 4";
        textFill = "#fdba74"; // orange-300
    }

    return { fill, stroke, strokeWidth, opacity, textFill, strokeDasharray, isSelected, isPlaced };
  };

  // --- DIAMOND CHART (North Indian) ---
  const renderDiamond = () => {
    // H1 = Top Diamond
    const houses = [
        { id: 1,  signIndex: 0,  points: "250,250 375,125 250,0 125,125", cx: 250, cy: 100 }, // Top Diamond (Aries)
        { id: 2,  signIndex: 1,  points: "125,125 250,0 0,0",            cx: 125, cy: 40 },  // Top Left Triangle (Taurus)
        { id: 3,  signIndex: 2,  points: "0,0 0,250 125,125",            cx: 40,  cy: 125 }, // Left Top Triangle (Gemini)
        { id: 4,  signIndex: 3,  points: "250,250 125,125 0,250 125,375",cx: 125, cy: 250 }, // Left Diamond (Cancer)
        { id: 5,  signIndex: 4,  points: "0,250 0,500 125,375",          cx: 40,  cy: 375 }, // Left Bottom Triangle (Leo)
        { id: 6,  signIndex: 5,  points: "125,375 0,500 250,500",        cx: 125, cy: 460 }, // Bottom Left Triangle (Virgo)
        { id: 7,  signIndex: 6,  points: "250,250 125,375 250,500 375,375", cx: 250, cy: 400 }, // Bottom Diamond (Libra)
        { id: 8,  signIndex: 7,  points: "250,500 500,500 375,375",      cx: 375, cy: 460 }, // Bottom Right Triangle (Scorpio)
        { id: 9,  signIndex: 8,  points: "375,375 500,500 500,250",      cx: 460, cy: 375 }, // Right Bottom Triangle (Sagittarius)
        { id: 10, signIndex: 9,  points: "250,250 375,375 500,250 375,125", cx: 375, cy: 250 }, // Right Diamond (Capricorn)
        { id: 11, signIndex: 10, points: "500,250 500,0 375,125",        cx: 460, cy: 125 }, // Right Top Triangle (Aquarius)
        { id: 12, signIndex: 11, points: "375,125 500,0 250,0",          cx: 375, cy: 40 },  // Top Right Triangle (Pisces)
    ];

    return (
        <>
            <rect x="2" y="2" width="496" height="496" fill="none" stroke="#27272a" strokeWidth="2" />
            {houses.map((house) => {
                const signName = signs[house.signIndex];
                const housePlanets = planets.filter(p => p.sign === signName);
                const style = getHighlightStyle(signName);

                return (
                    <g key={house.id} onClick={() => onSignClick(signName)} className="cursor-pointer transition-all hover:opacity-100">
                        <polygon
                            points={house.points}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth={style.strokeWidth}
                            strokeDasharray={style.strokeDasharray}
                            opacity={style.opacity}
                            className="transition-all duration-300"
                        />
                        <text 
                            x={house.cx} 
                            y={house.cy - (housePlanets.length > 0 ? 12 : 0)} 
                            fill={style.textFill}
                            fontSize="9" 
                            fontWeight="bold"
                            textAnchor="middle" 
                            fontFamily="monospace"
                            className="uppercase tracking-widest pointer-events-none"
                        >
                            {signName.substring(0, 3)}
                        </text>

                        {housePlanets.length > 0 && (
                            <g transform={`translate(${house.cx}, ${house.cy + 5})`}>
                                {housePlanets.map((planet, i) => {
                                    const isPlanetSelected = selectedPlanet === planet.name;
                                    const offsetY = (i * 12);
                                    return (
                                        <text
                                            key={planet.name}
                                            y={offsetY}
                                            fill={isPlanetSelected ? "#4ade80" : "#d4d4d8"}
                                            fontSize="10"
                                            textAnchor="middle"
                                            fontWeight={isPlanetSelected ? "bold" : "normal"}
                                            className="transition-colors pointer-events-auto hover:fill-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPlanetClick(planet);
                                            }}
                                        >
                                            {planet.name.substring(0, 2)}{planet.retrograde ? "ᴿ" : ""}
                                        </text>
                                    );
                                })}
                            </g>
                        )}
                    </g>
                );
            })}
        </>
    );
  };

  // --- CIRCULAR CHART ---
  const renderCircle = () => {
    const cx = 250;
    const cy = 250;
    const r = 200; // Radius of outer wheel
    const aspectRadius = 140; // Radius where planet markers and aspect lines connect

    // Polar to Cartesian
    const getPos = (deg: number, rad: number) => {
        // SVG coordinate system: 0 deg is 3 o'clock. 
        // Zodiac usually starts 0 deg Aries at 9 o'clock (Western) or varies.
        // Here we map 0 deg (Aries start) to 9 o'clock (-180 or 180).
        // Let's standardise: 0 degrees Aries = 180 degrees in SVG (Left) or standard Polar -90?
        // Let's map 0 longitude to 180 degrees (Left side) to go counter-clockwise.
        
        // Actually, let's keep it simple: 0 deg = 3 o'clock is standard Math.
        // Astrological charts usually put Ascendant (Eastern Horizon) at 9 o'clock.
        // Let's assume standard: 0 deg Aries is at 180 deg (Left).
        const angleInRadians = (180 - deg) * (Math.PI / 180); 
        return {
             x: cx + rad * Math.cos(angleInRadians),
             y: cy + rad * Math.sin(angleInRadians)
        };
    };

    // Calculate Aspect Lines
    const aspectLines = useMemo(() => {
        const lines: { p1: {x:number, y:number}, p2: {x:number, y:number}, aspect: AspectDef, key: string }[] = [];
        
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];
                
                // Calculate angular distance
                let diff = Math.abs(p1.longitude - p2.longitude);
                if (diff > 180) diff = 360 - diff;

                // Check Aspects
                for (const aspect of ASPECTS) {
                    const orb = aspect.isMajor ? 6 : 3;
                    if (Math.abs(diff - aspect.angle) <= orb) {
                        // Filter: If a planet is selected, only show its aspects?
                        // Or show Major aspects always, and Minor only if selected?
                        // Rule: Show all Major. Show Minor only if one of the planets is selected.
                        
                        const isP1Selected = selectedPlanet === p1.name;
                        const isP2Selected = selectedPlanet === p2.name;
                        
                        // If aspect is minor, require selection
                        if (!aspect.isMajor && !isP1Selected && !isP2Selected && !selectedPlanet) {
                            continue; // Skip cluttering minor aspects if nothing selected
                        }

                        // Get coords
                        const c1 = getPos(p1.longitude, aspectRadius);
                        const c2 = getPos(p2.longitude, aspectRadius);
                        
                        lines.push({
                            p1: c1,
                            p2: c2,
                            aspect,
                            key: `${p1.name}-${p2.name}-${aspect.name}`
                        });
                        break; // Found the aspect, move to next pair
                    }
                }
            }
        }
        return lines;
    }, [planets, selectedPlanet]);

    return (
        <>
            <circle cx={cx} cy={cy} r={r} fill="rgba(0,0,0,0.2)" stroke="#27272a" strokeWidth="2" />
            
            {/* Inner Decoration Rings */}
            <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <circle cx={cx} cy={cy} r={r * 0.3} fill="none" stroke="#27272a" strokeWidth="1" opacity="0.3" />

            {/* Aspect Lines Layer (Behind Labels) */}
            <g className="aspect-lines">
                {aspectLines.map((line) => {
                     // Dim line if we have a selection and this line doesn't involve it
                     const isDimmed = selectedPlanet && 
                                      !line.key.includes(selectedPlanet);
                     
                     return (
                        <line
                            key={line.key}
                            x1={line.p1.x} y1={line.p1.y}
                            x2={line.p2.x} y2={line.p2.y}
                            stroke={line.aspect.color}
                            strokeWidth={line.aspect.isMajor ? 1.5 : 1}
                            strokeDasharray={line.aspect.dash}
                            opacity={isDimmed ? 0.1 : 0.6}
                        />
                     );
                })}
            </g>
            
            {/* Planet Markers on Inner Ring */}
            {planets.map(p => {
                const pos = getPos(p.longitude, aspectRadius);
                const isSelected = selectedPlanet === p.name;
                return (
                    <circle 
                        key={`marker-${p.name}`}
                        cx={pos.x} cy={pos.y} 
                        r={isSelected ? 3 : 2}
                        fill={isSelected ? "#10b981" : "#52525b"}
                    />
                );
            })}

            {/* Degree Ticks */}
            {Array.from({ length: 360 / 5 }).map((_, i) => {
                const angle = i * 5;
                const isMajor = angle % 30 === 0;
                const p1 = getPos(angle, r);
                const p2 = getPos(angle, r - (isMajor ? 10 : 5));
                return (
                    <line 
                        key={i} 
                        x1={p1.x} y1={p1.y} 
                        x2={p2.x} y2={p2.y} 
                        stroke={isMajor ? "#3f3f46" : "#27272a"} 
                        strokeWidth={isMajor ? 2 : 1} 
                    />
                );
            })}
            
            {signs.map((sign, i) => {
                const startAngle = i * 30;
                const endAngle = (i + 1) * 30;
                
                // Draw Wedge Arc
                // SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
                const p1 = getPos(startAngle, r);
                const p2 = getPos(endAngle, r);
                // Large arc flag is 0 for 30 deg. Sweep flag 0 for counter-clockwise in Cartesian, but our getPos inverted it. 
                // Let's trace path carefully. getPos(0) = 180 deg (Left). getPos(30) = 150 deg.
                // We are drawing counter-clockwise visually? 180 -> 150 is clockwise in standard SVG coords (y down).
                // d: Move to center, Line to P1, Arc to P2, Close.
                
                const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`;

                const style = getHighlightStyle(sign);
                const housePlanets = planets.filter(p => p.sign === sign);

                // Label Position (at r + 20)
                const midAngle = startAngle + 15;
                const labelPos = getPos(midAngle, r + 25);
                
                // Planet Cluster Position (at r * 0.8)
                const planetCenterPos = getPos(midAngle, r * 0.82);

                return (
                    <g key={sign} onClick={() => onSignClick(sign)}>
                        <path 
                            d={d} 
                            fill={style.fill} 
                            stroke={style.stroke} 
                            strokeWidth={style.strokeWidth}
                            strokeDasharray={style.strokeDasharray}
                            opacity={style.opacity}
                            className="cursor-pointer transition-all duration-300 hover:opacity-90"
                        />
                        
                        {/* Sign Label on Rim */}
                        <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill={style.textFill}
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="monospace"
                            className="uppercase tracking-widest pointer-events-none select-none"
                        >
                            {sign.substring(0,3)}
                        </text>

                        {/* Planets Text Cluster */}
                        {housePlanets.length > 0 && (
                             <g transform={`translate(${planetCenterPos.x}, ${planetCenterPos.y})`}>
                                {housePlanets.map((planet, idx) => {
                                    const isPlanetSelected = selectedPlanet === planet.name;
                                    // Stack them vertically if multiple
                                    const yOff = (idx - (housePlanets.length-1)/2) * 14; 
                                    return (
                                        <text
                                            key={planet.name}
                                            x={0}
                                            y={yOff}
                                            fill={isPlanetSelected ? "#4ade80" : "#d4d4d8"}
                                            fontSize="11"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontWeight={isPlanetSelected ? "bold" : "normal"}
                                            className="transition-colors cursor-pointer hover:fill-white drop-shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPlanetClick(planet);
                                            }}
                                        >
                                            {planet.name.substring(0, 2)}{planet.retrograde ? "ᴿ" : ""}
                                        </text>
                                    );
                                })}
                             </g>
                        )}
                    </g>
                );
            })}
            
            {/* Center Decoration */}
            <circle cx={cx} cy={cy} r={40} fill="#09090b" stroke="#27272a" />
            <circle cx={cx} cy={cy} r={3} fill="#10b981" className="animate-pulse" />
        </>
    );
  };

  return (
    <div className="relative aspect-square w-full max-w-[700px] select-none">
       {/* Static SVG with responsive viewBox */}
      <svg viewBox="0 0 500 500" className="h-full w-full drop-shadow-2xl">
        <defs>
             <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
             </filter>
        </defs>
        
        {variant === 'diamond' ? renderDiamond() : renderCircle()}

      </svg>
    </div>
  );
};
