import React, { useState, useEffect } from 'react';
import type { Location } from '../types';
import type { AyanamsaType } from '../contexts/AyanamsaContext';
import { useAyanamsa } from '../contexts/AyanamsaContext';

interface DateLocationInputProps {
  initialDate: Date;
  initialLocation: Location;
  onSubmit: (date: Date, location: Location, ayanamsa: AyanamsaType) => void;
  isLoading?: boolean;
}

const PRESET_LOCATIONS = [
  { name: "New York (ET)", lat: 40.7128, long: -74.0060, tz: "America/New_York" },
  { name: "UTC", lat: 51.4769, long: 0.0005, tz: "UTC" },
  { name: "London (GMT/BST)", lat: 51.5074, long: -0.1278, tz: "Europe/London" },
  { name: "India (IST)", lat: 28.6139, long: 77.2090, tz: "Asia/Kolkata" },
  { name: "Singapore", lat: 1.3521, long: 103.8198, tz: "Asia/Singapore" },
  { name: "Sydney (AET)", lat: -33.8688, long: 151.2093, tz: "Australia/Sydney" },
];

export const DateLocationInput: React.FC<DateLocationInputProps> = ({
  initialDate,
  initialLocation,
  onSubmit,
  isLoading
}) => {
  const { ayanamsa, setAyanamsa } = useAyanamsa();
  const [localDate, setLocalDate] = useState(initialDate.toISOString().split('T')[0]);
  const [localTime, setLocalTime] = useState(initialDate.toTimeString().split(' ')[0].substring(0, 5));
  
  const [localLocation, setLocalLocation] = useState(initialLocation);
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
      const match = PRESET_LOCATIONS.find(p => p.name === initialLocation.name);
      return match ? match.name : "Custom...";
  });

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setSelectedPreset(val);
      
      if (val === "Custom...") {
          setLocalLocation(prev => ({ ...prev, name: "Custom Location" }));
      } else {
          const loc = PRESET_LOCATIONS.find(l => l.name === val);
          if (loc) {
              setLocalLocation({
                  latitude: loc.lat,
                  longitude: loc.long,
                  timezone: loc.tz,
                  name: loc.name
              });
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDate = new Date(`${localDate}T${localTime}`);
    onSubmit(newDate, localLocation, ayanamsa);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-widest text-zinc-500">Date</label>
          <input
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 bg-zinc-900/50 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-widest text-zinc-500">Time</label>
          <input
            type="time"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 bg-zinc-900/50 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Location Row */}
      <div className="space-y-2">
        <label className="text-[9px] uppercase tracking-widest text-zinc-500">Location / Timezone</label>
        <div className="relative">
             <select
                value={selectedPreset}
                onChange={handlePresetChange}
                className="w-full appearance-none rounded-sm border border-zinc-800 bg-black px-3 py-2 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none hover:border-zinc-700 transition-colors"
             >
                {PRESET_LOCATIONS.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
                <option value="Custom...">Custom...</option>
             </select>
             {/* Chevron Icon */}
             <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
        </div>

        {/* Manual Coordinates if Custom */}
        {selectedPreset === "Custom..." && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Lat"
                        step="0.0001"
                        value={localLocation.latitude}
                        onChange={(e) => setLocalLocation({...localLocation, latitude: parseFloat(e.target.value)})}
                        className="w-full rounded-sm border border-zinc-800 bg-zinc-900/30 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600">LAT</span>
                </div>
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Long"
                        step="0.0001"
                        value={localLocation.longitude}
                        onChange={(e) => setLocalLocation({...localLocation, longitude: parseFloat(e.target.value)})}
                        className="w-full rounded-sm border border-zinc-800 bg-zinc-900/30 px-2 py-1.5 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600">LON</span>
                </div>
            </div>
        )}
      </div>

      {/* Ayanamsa */}
      <div className="space-y-1.5">
         <label className="text-[9px] uppercase tracking-widest text-zinc-500">Ayanamsa Model</label>
         <div className="relative">
            <select
                value={ayanamsa}
                onChange={(e) => setAyanamsa(e.target.value as AyanamsaType)}
                className="w-full appearance-none rounded-sm border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
            >
                <option value="lahiri">Lahiri (Chitra Paksha)</option>
                <option value="raman">Raman</option>
                <option value="kp">Krishnamurti Paddhati</option>
                <option value="tropical">Tropical (Sayana)</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
         </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Synchronizing..." : "Update Telemetry"}
      </button>
    </form>
  );
};