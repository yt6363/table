import React from 'react';

interface PaneProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Pane: React.FC<PaneProps> = ({ title, children, className = "", actions }) => {
  return (
    <div className={`flex flex-col border border-zinc-800 bg-[#0a0a0c] shadow-2xl ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            {title}
          </h2>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="relative flex-1">
        {children}
        {/* Decoration Corners */}
        <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-zinc-700 opacity-50" />
        <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-zinc-700 opacity-50" />
        <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-zinc-700 opacity-50" />
        <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-zinc-700 opacity-50" />
      </div>
    </div>
  );
};