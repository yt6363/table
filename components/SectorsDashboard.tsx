import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAyanamsa } from "../contexts/AyanamsaContext";
import { ZodiacWheel } from "./ZodiacWheel";
import { DateLocationInput } from "./DateLocationInput";
import { Pane } from "./Pane";
import type {
  Location,
  PlanetPosition,
  ActiveSector,
} from "../types";
import {
  fetchPlanetaryData,
  getCacheStats,
  clearCache,
  formatDateTime,
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
  const [selectedSector, setSelectedSector] = useState<ActiveSector | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0); 

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
    const relatedSector = activeSectors.find((s) => s.planet === planet.name);
    if (relatedSector) setSelectedSector(relatedSector);
  };

  const handleSectorClick = (sector: ActiveSector) => {
    setSelectedSector(sector);
    const relatedPlanet = planets.find((p) => p.name === sector.planet);
    if (relatedPlanet) setSelectedPlanet(relatedPlanet);
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

  return (
    <div className="grid gap-6 lg:grid-cols-12">
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
        <Pane title="Zodiac Radar" className="h-full min-h-[500px]">
          <div className="relative flex h-full flex-col bg-zinc-950/50 p-1">
             {/* Header Overlay */}
            <div className="absolute left-0 top-0 z-10 flex w-full justify-between p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
               <span>{location.name}</span>
               <span>{formatDateTime(date)}</span>
            </div>

            {/* Graphic */}
            <div className="flex flex-1 items-center justify-center overflow-hidden py-8">
               <ZodiacWheel
                  planets={planets}
                  activeSectors={activeSectors}
                  selectedPlanet={selectedPlanet?.name}
                  selectedSector={selectedSector}
                  onPlanetClick={handlePlanetClick}
                  onSectorClick={handleSectorClick}
                />
            </div>

            {/* Quick Stats Footer */}
            {topSectors.length > 0 && (
              <div className="border-t border-zinc-900 bg-black/40 p-3">
                 <div className="mb-2 text-[9px] uppercase tracking-widest text-zinc-500">Global Market Leaders</div>
                 <div className="flex flex-wrap gap-2">
                    {topSectors.slice(0, 5).flatMap(s => s.industries.slice(0, 1)).map((industry, i) => (
                        <span key={i} className="rounded-full border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 font-mono text-[10px] text-emerald-400">
                            {industry}
                        </span>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </Pane>
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="lg:col-span-12 xl:col-span-3 grid gap-6 md:grid-cols-2 xl:grid-cols-1">
        
        {/* Selected Object Detail */}
        <Pane title="Telemetry" className="min-h-[300px]">
          <div className="p-4">
            {selectedPlanet ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                        <h3 className="font-mono text-2xl text-emerald-400">{selectedPlanet.name}</h3>
                        <p className="font-mono text-xs text-zinc-500">{selectedPlanet.sign}</p>
                    </div>
                    <div className={`rounded-sm px-2 py-1 text-[10px] uppercase tracking-wider ${selectedPlanet.retrograde ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                        {selectedPlanet.retrograde ? "Retrograde" : "Direct"}
                    </div>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Longitude</span>
                    <span className="text-zinc-200">{selectedPlanet.longitude.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Nakshatra</span>
                    <span className="text-amber-200">{selectedPlanet.nakshatra || "Unknown"}</span>
                  </div>
                  
                  {/* Sectors for specific planet */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="mb-2 block text-[10px] uppercase tracking-widest text-zinc-500">Impacted Sectors</span>
                    <div className="flex flex-wrap gap-1.5">
                       {selectedSector?.industries.map((ind, i) => (
                           <span key={i} className="inline-block rounded-sm bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                               {ind}
                           </span>
                       ))}
                       {!selectedSector && <span className="text-zinc-600 italic">None detected</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-center opacity-40">
                 <div className="h-12 w-12 rounded-full border-2 border-dashed border-zinc-600 mb-4" />
                 <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">No Signal Acquired</p>
                 <p className="text-[10px] text-zinc-600 mt-2">Select a planet on the radar</p>
              </div>
            )}
          </div>
        </Pane>

        {/* Active Sectors List */}
        <Pane title="Market Analysis" className="flex-1">
          {sortedSectors.length > 0 ? (
            <div className="scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent max-h-[400px] overflow-y-auto p-2">
              <div className="space-y-2">
                {sortedSectors.map((sector, idx) => {
                   const isSelected = selectedSector === sector;
                   return (
                      <button
                        key={`${sector.planet}-${sector.sign}-${idx}`}
                        onClick={() => handleSectorClick(sector)}
                        className={`group flex w-full flex-col gap-2 border border-zinc-900/50 p-3 text-left transition-all ${
                            isSelected 
                            ? "bg-zinc-800/80 border-emerald-500/50 shadow-lg shadow-emerald-900/10" 
                            : "bg-black/40 hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                            <div className={`font-mono text-xs font-bold uppercase tracking-wider ${isSelected ? "text-emerald-400" : "text-zinc-400 group-hover:text-emerald-300"}`}>
                                {sector.planet}
                            </div>
                            <div className="text-[10px] text-zinc-600">in {sector.sign}</div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                            {sector.industries.slice(0, 4).map((ind, i) => (
                                <span key={i} className={`text-[10px] ${isSelected ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                                    {ind}{i < Math.min(3, sector.industries.length -1) ? " • " : ""}
                                </span>
                            ))}
                            {sector.industries.length > 4 && (
                                <span className="text-[10px] text-zinc-600 italic">+{sector.industries.length - 4} more</span>
                            )}
                        </div>
                      </button>
                   );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center p-4 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-700">
              No active sectors detected
            </div>
          )}
        </Pane>
      </div>
    </div>
  );
}