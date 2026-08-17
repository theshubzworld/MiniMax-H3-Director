import React from 'react';

interface DirectorLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const DirectorLogo: React.FC<DirectorLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Luminous Vector Logo Emblem */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 group cursor-pointer`}>
        {/* Glow halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-blue-500/30 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-80" />

        {/* Outer Icon Box */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-cyan-950/80 border border-cyan-500/40 p-1.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="logoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="logoAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Aperture 35mm Shutter Blades */}
            <circle cx="50" cy="50" r="42" stroke="url(#logoCyan)" strokeWidth="4" strokeDasharray="14 6" opacity="0.6" />
            <circle cx="50" cy="50" r="32" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.4" />

            {/* Central Film Director Clapper / Camera Eye */}
            <polygon points="40,32 70,50 40,68" fill="url(#logoCyan)" opacity="0.9" />
            
            {/* Golden Horizon Lens Flare */}
            <line x1="16" y1="50" x2="84" y2="50" stroke="url(#logoAmber)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            
            {/* Optical Core Dot */}
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[14px] sm:text-[15px] tracking-tight text-zinc-100 dark:text-zinc-100 font-sans">
              MINIMAX
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-black text-cyan-400 font-mono tracking-wide">
              H3
            </span>
          </div>
          <span className="font-mono font-bold text-[9px] sm:text-[10px] tracking-[0.25em] text-cyan-500 dark:text-cyan-400 uppercase -mt-0.5">
            DIRECTOR STUDIO
          </span>
        </div>
      )}
    </div>
  );
};
