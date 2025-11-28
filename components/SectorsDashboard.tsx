import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAyanamsa } from "../contexts/AyanamsaContext";
import { ZodiacWheel } from "./ZodiacWheel";
import { DateLocationInput } from "./DateLocationInput";
import { Pane } from "./Pane";
import type {
  Location,
  PlanetPosition,
  ActiveSector,
  PlanetDignity,
} from "../types";
import {
  fetchPlanetaryData,
  getCacheStats,
  clearCache,
  formatDateTime,
  getSectorsForPlanet,
  getSectorsForSign,
  getOwnedSigns,
  getAspectedSigns,
} from "../lib/sectors";
import type { AyanamsaType } from "../contexts/AyanamsaContext";

// --- Sub-components ---

const StatCard = ({
  label,
  value,
  accent = false,
  subValue,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  subValue?: string;
}) => (
  <div className="group relative flex flex-col justify-between overflow-hidden border border-zinc-800/60 bg-black/40 px-4 py-3 backdrop-blur-sm transition-all hover:border-zinc-700">
    {accent && (
      <div className="absolute left-0 top-0 h-full w-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
    )}
    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400">
      {label}
    </p>
    <div className="mt-1">
      <p
        className={`font-mono text-lg font-medium tracking-tight ${
          accent ? "text-emerald-400 drop-shadow-sm" : "text-zinc-200"
        }`}
      >
        {value}
      </p>
      {subValue && <p className="text-[10px] text-zinc-600">{subValue}</p>}
    </div>
  </div>
);

const DignityBadge = ({ dignity }: { dignity: PlanetDignity }) => {
    let colorClass = "bg-zinc-800 text-zinc-400 border-zinc-700";
    let label = "Neutral";

    switch (dignity) {
        case 'exalted':
            colorClass = "bg-purple-900/30 text-purple-300 border-purple-800/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]";
            label = "Exalted";
            break;
        case 'own_sign':
            colorClass = "bg-emerald-900/30 text-emerald-300 border-emerald-800/50";
            label = "Own Sign";
            break;
        case 'debilitated':
            colorClass = "bg-red-900/30 text-red-300 border-red-800/50";
            label = "Debilitated";
            break;
        case 'n/a':
            label = "—";
            break;
    }

    if (label === "—") return null;

    return (
        <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${colorClass}`}>
            {label}
        </span>
    );
};

// --- Main Dashboard Component ---

export function SectorsDashboard() {
  const { ayanamsa } = useAyanamsa();

  // State
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState<Location>({
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    name: "New York, NY",
  });
  const [planets, setPlanets] = useState<PlanetPosition[]>([]);
  const [activeSectors, setActiveSectors] = useState<ActiveSector[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0); 
  const [chartType, setChartType] = useState<'diamond' | 'circle'>('diamond');

  // Fetch Logic
  const fetchData = useCallback(
    async (
      targetDate: Date,
      targetLocation: Location,
      targetAyanamsa: AyanamsaType,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const dateISO = targetDate.toISOString().split("T")[0];
        const response = await fetchPlanetaryData(
          targetLocation.latitude,
          targetLocation.longitude,
          targetLocation.timezone,
          dateISO,
          targetAyanamsa,
        );

        setPlanets(response.planets);
        setActiveSectors(response.activeSectors);
        setLastUpdate(new Date());
        
      } catch (err) {
        console.error("Error fetching planetary data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to retrieve planetary telemetry",
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial Load & Ayanamsa Change
  const mountedRef = useRef(false);
  
  useEffect(() => {
    if (!mountedRef.current) {
        mountedRef.current = true;
        void fetchData(date, location, ayanamsa);
        return;
    }
    void fetchData(date, location, ayanamsa);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayanamsa]); 

  const handleDateLocationSubmit = (
    newDate: Date,
    newLocation: Location,
    newAyanamsa: AyanamsaType,
  ) => {
    setDate(newDate);
    setLocation(newLocation);
    void fetchData(newDate, newLocation, newAyanamsa);
  };

  // Interaction Handlers
  const handlePlanetClick = (planet: PlanetPosition) => {
    setSelectedPlanet(planet);
    setSelectedSign(planet.sign);
  };

  const handleSignClick = (sign: string) => {
    setSelectedSign(sign);
    setSelectedPlanet(null);
  };

  const handleClearCache = () => {
    clearCache();
    setCacheVersion(v => v + 1);
  };

  // Derived Data
  const cacheStats = getCacheStats();
  const sortedSectors = [...activeSectors].sort(
    (a, b) => b.focusIntensity - a.focusIntensity,
  );
  
  // Use first 3 sectors as "Prime Focus" highlight
  const topSectors = sortedSectors.slice(0, 3);

  // Get specific lists for selected items
  const selectedPlanetSectors = selectedPlanet ? getSectorsForPlanet(selectedPlanet.name) : [];
  const selectedSignSectors = selectedSign ? getSectorsForSign(selectedSign) : [];

  // Calculate Relationship Highlights (Ownership, Aspect)
  const ownedSigns = selectedPlanet ? getOwnedSigns(selectedPlanet.name) : [];
  const aspectedSigns = (selectedPlanet && selectedSign) ? getAspectedSigns(selectedPlanet.name, selectedSign) : [];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-12 lg:gap-6">
      {/* LEFT COLUMN: Controls & Stats */}
      <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-3">
        <Pane title="Mission Control" className="h-full">
          <div className="flex flex-col gap-6 p-4">
            <DateLocationInput
              initialDate={date}
              initialLocation={location}
              onSubmit={handleDateLocationSubmit}
              isLoading={isLoading}
            />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Status"
                value={
                    <span className={`flex items-center gap-2 text-xs uppercase tracking-wider ${isLoading ? "text-amber-400" : "text-emerald-400"}`}>
                        <span className={`h-2 w-2 rounded-full ${isLoading ? "animate-ping bg-amber-400" : "bg-emerald-400"}`} />
                        {isLoading ? "Syncing" : "Online"}
                    </span>
                }
              />
              <StatCard
                label="Ayanamsa"
                value={ayanamsa.toUpperCase()}
                accent
              />
              <StatCard
                label="Last Update"
                value={lastUpdate ? lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                subValue={lastUpdate ? lastUpdate.toLocaleDateString() : undefined}
              />
              <StatCard
                label="Cache Keys"
                value={cacheStats.validEntries.toString()}
              />
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={handleClearCache}
                className="group flex w-full items-center justify-center gap-2 border border-red-900/30 bg-red-950/10 px-4 py-3 font-mono text-xs font-medium uppercase tracking-widest text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-900/20 hover:text-red-200"
              >
                <span>Purge Cache</span>
              </button>
              {error && (
                <div className="mt-3 border-l-2 border-red-500 bg-red-900/10 px-3 py-2 font-mono text-[10px] text-red-200">
                  ERROR: {error}
                </div>
              )}
            </div>
          </div>
        </Pane>
      </div>

      {/* MIDDLE COLUMN: Visualization */}
      <div className="lg:col-span-8 xl:col-span-6">
        <Pane 
          title="Vedic Radar" 
          className="h-full min-h-[500px]"
        >
          <div className="relative flex h-full flex-col bg-zinc-950/50 p-1">
             {/* Header Overlay */}
            <div className="flex w-full justify-between p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600 border-b border-zinc-900/30">
               <span>{location.name}</span>
               <span>{formatDateTime(date)}</span>
            </div>

            {/* Graphic */}
            <div className="flex flex-1 items-center justify-center overflow-hidden py-8">
                 <ZodiacWheel
                    planets={planets}
                    activeSectors={activeSectors}
                    selectedPlanet={selectedPlanet?.name}
                    selectedSign={selectedSign}
                    onPlanetClick={handlePlanetClick}
                    onSignClick={handleSignClick}
                    highlightedSigns={{
                        placed: selectedPlanet?.sign || null,
                        owned: ownedSigns,
                        aspected: aspectedSigns
                    }}
                    variant={chartType}
                  />
            </div>
            
             {/* Footer Controls */}
            <div className="flex justify-end p-3 border-t border-zinc-900/30 bg-black/10">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => setChartType('diamond')}
                      title="Diamond Chart (North Indian)"
                      className={`flex h-6 w-6 items-center justify-center rounded-sm border text-[9px] font-bold transition-all ${chartType === 'diamond' ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-zinc-800 bg-black/40 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
                    >
                      D
                    </button>
                    <button 
                      onClick={() => setChartType('circle')}
                      title="Circular Chart (South/Western)"
                      className={`flex h-6 w-6 items-center justify-center rounded-sm border text-[9px] font-bold transition-all ${chartType === 'circle' ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-zinc-800 bg-black/40 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
                    >
                      C
                    </button>
                  </div>
            </div>
          </div>
        </Pane>
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6">
        
        {/* Selected Object Detail Pane */}
        <Pane title="Details" className="h-full min-h-[300px]">
          <div className="p-4 h-full">
            {selectedPlanet || selectedSign ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                
                {/* 1. PLANET DETAILS (If selected) */}
                {selectedPlanet && (
                  <div className="border-b border-zinc-800 pb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="font-mono text-2xl text-emerald-400">{selectedPlanet.name}</h3>
                            <div className="mt-1 flex gap-2">
                                <DignityBadge dignity={selectedPlanet.dignity} />
                            </div>
                        </div>
                        <div className={`rounded-sm px-2 py-1 text-[10px] uppercase tracking-wider ${selectedPlanet.retrograde ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                            {selectedPlanet.retrograde ? "Retrograde" : "Direct"}
                        </div>
                    </div>
                    
                    {/* Vedic Relationships */}
                    <div className="mb-4 space-y-2 rounded bg-zinc-900/30 p-2 font-mono text-[10px]">
                        <div className="flex items-start gap-2">
                            <span className="w-16 text-zinc-500 uppercase">Placed In</span>
                            <span className="text-emerald-400 font-bold">{selectedPlanet.sign}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="w-16 text-zinc-500 uppercase">Owns</span>
                            <span className="text-green-400/90">{ownedSigns.join(", ") || "None"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="w-16 text-zinc-500 uppercase">Aspects</span>
                            <span className="text-orange-400">{aspectedSigns.join(", ") || "None"}</span>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 font-mono text-xs">
                         <div>
                            <span className="block text-[9px] text-zinc-600">Longitude</span>
                            <span className="text-zinc-300">{selectedPlanet.longitude.toFixed(2)}°</span>
                         </div>
                         <div>
                            <span className="block text-[9px] text-zinc-600">Nakshatra</span>
                            <div className="flex flex-col">
                                <span className="text-amber-200">{selectedPlanet.nakshatra || "—"}</span>
                                {selectedPlanet.nakshatraLord && (
                                    <span className="text-[9px] text-zinc-500">Lord: {selectedPlanet.nakshatraLord}</span>
                                )}
                            </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                       <div>
                           <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500">Planet Sectors</p>
                           <div className="flex flex-wrap gap-1.5">
                            {selectedPlanetSectors.map((ind, i) => (
                                <span key={i} className="inline-block rounded-sm bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.5 text-[10px] text-emerald-300">
                                    {ind}
                                </span>
                            ))}
                            {selectedPlanetSectors.length === 0 && <span className="text-[10px] text-zinc-600 italic">No specific sector data</span>}
                           </div>
                       </div>
                       
                       {selectedPlanet.commodities.length > 0 && (
                           <div>
                               <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500">Nakshatra Commodities</p>
                               <div className="flex flex-wrap gap-1.5">
                                {selectedPlanet.commodities.map((ind, i) => (
                                    <span key={i} className="inline-block rounded-sm bg-amber-950/20 border border-amber-900/30 px-1.5 py-0.5 text-[10px] text-amber-300">
                                        {ind}
                                    </span>
                                ))}
                               </div>
                           </div>
                       )}
                    </div>
                  </div>
                )}

                {/* 2. SIGN DETAILS (If selected or implicit from planet) */}
                {selectedSign && (
                  <div>
                    <div className="mb-3">
                         <h3 className="font-mono text-xl text-zinc-200">{selectedSign}</h3>
                         <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Sign Environment</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                       {selectedSignSectors.map((ind, i) => (
                           <span key={i} className="inline-block rounded-sm bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                               {ind}
                           </span>
                       ))}
                       {selectedSignSectors.length === 0 && <span className="text-[10px] text-zinc-600 italic">No specific sector data</span>}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-40 min-h-[250px]">
                 <div className="h-12 w-12 rounded-full border-2 border-dashed border-zinc-600 mb-4" />
                 <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No Selection</p>
                 <p className="text-[10px] text-zinc-600 mt-2">Select a planet or sign on the radar</p>
              </div>
            )}
          </div>
        </Pane>
      </div>
    </div>
  );
}