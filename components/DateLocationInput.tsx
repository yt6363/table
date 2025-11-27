import React, { useState } from 'react';
import type { Location } from '../types';
import type { AyanamsaType } from '../contexts/AyanamsaContext';
import { useAyanamsa } from '../contexts/AyanamsaContext';

interface DateLocationInputProps {
  initialDate: Date;
  initialLocation: Location;
  onSubmit: (date: Date, location: Location, ayanamsa: AyanamsaType) => void;
  isLoading?: boolean;
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDate = new Date(`${localDate}T${localTime}`);
    onSubmit(newDate, localLocation, ayanamsa);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-widest text-zinc-500">Date</label>
          <input
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-300 placeholder-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-widest text-zinc-500">Time</label>
          <input
            type="time"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-widest text-zinc-500">Location Coordinates</label>
        <div className="grid grid-cols-2 gap-2">
            <input
                type="number"
                placeholder="Lat"
                step="0.0001"
                value={localLocation.latitude}
                onChange={(e) => setLocalLocation({...localLocation, latitude: parseFloat(e.target.value)})}
                className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
            />
            <input
                type="number"
                placeholder="Long"
                step="0.0001"
                value={localLocation.longitude}
                onChange={(e) => setLocalLocation({...localLocation, longitude: parseFloat(e.target.value)})}
                className="w-full border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
            />
        </div>
      </div>

      <div className="space-y-1">
         <label className="text-[9px] uppercase tracking-widest text-zinc-500">Calculation Model</label>
         <select
            value={ayanamsa}
            onChange={(e) => setAyanamsa(e.target.value as AyanamsaType)}
            className="w-full appearance-none border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
         >
            <option value="lahiri">Lahiri (Chitra Paksha)</option>
            <option value="raman">Raman</option>
            <option value="kp">Krishnamurti Paddhati</option>
            <option value="tropical">Tropical (Sayana)</option>
         </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full bg-emerald-900/20 border border-emerald-900/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-900/40 hover:text-emerald-300 disabled:opacity-50"
      >
        {isLoading ? "Computing..." : "Update Telemetry"}
      </button>
    </form>
  );
};