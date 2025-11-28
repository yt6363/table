import React from 'react';
import { AyanamsaProvider } from './contexts/AyanamsaContext';
import { SectorsDashboard } from './components/SectorsDashboard';

const App = () => {
  return (
    <AyanamsaProvider>
      <div className="flex min-h-screen flex-col bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black text-zinc-300 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h1 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-100">
                Sidereal<span className="text-emerald-500">.OS</span>
              </h1>
            </div>
            <div className="font-mono text-[10px] text-zinc-500">
              V.2.5.0-ALPHA
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col w-full p-4 lg:p-6">
          <SectorsDashboard />
        </main>
      </div>
    </AyanamsaProvider>
  );
};

export default App;