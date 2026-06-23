import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  className?: string;
  iconOnly?: boolean;
}

export function LogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm rounded-lg",
    md: "w-11 h-11 text-lg rounded-xl",
    lg: "w-16 h-16 text-2xl rounded-2xl",
    xl: "w-32 h-32 text-5xl rounded-[2rem]",
  };

  return (
    <div 
      className={`relative shrink-0 flex items-center justify-center select-none bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-lg shadow-purple-500/10 ${sizeClasses[size]} ${className}`}
      id="brand-cb-badge"
    >
      {/* Decorative gradient soft radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-orange-500/10 opacity-70 rounded-inherit" />

      {/* Styled CB typography with premium design-friendly display font */}
      <span className="relative flex items-center leading-none font-display font-black tracking-tighter">
        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">C</span>
        <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">B</span>
      </span>

      {/* Decorative dots */}
      <div className="absolute top-1 right-1 w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
    </div>
  );
}

export default function Logo({ size = "md", className = "", iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return <LogoIcon size={size === "custom" ? "md" : size} className={className} />;
  }

  // Preset sizes for the full brand lockup
  const lockupSizes = {
    sm: {
      icon: "sm" as const,
      title: "text-lg tracking-[0.12em]",
      subtitle: "text-[7.5px] tracking-[0.14em]",
      container: "gap-2.5",
    },
    md: {
      icon: "md" as const,
      title: "text-xl sm:text-2xl tracking-[0.16em]",
      subtitle: "text-[9px] sm:text-[10px] tracking-[0.24em]",
      container: "gap-3",
    },
    lg: {
      icon: "lg" as const,
      title: "text-2xl sm:text-3xl tracking-[0.2em]",
      subtitle: "text-[11px] sm:text-[12px] tracking-[0.3em]",
      container: "gap-4.5",
    },
    xl: {
      icon: "xl" as const,
      title: "text-4xl sm:text-5xl tracking-[0.24em]",
      subtitle: "text-[14px] sm:text-[16px] tracking-[0.34em]",
      container: "gap-6",
    },
    custom: {
      icon: "md" as const,
      title: "text-xl tracking-[0.15em]",
      subtitle: "text-[8.5px] tracking-[0.25em]",
      container: "gap-3",
    }
  };

  const current = lockupSizes[size];

  return (
    <div className={`flex items-center ${current.container} ${className} select-none`}>
      {/* Dynamic graphic icon with particles */}
      <LogoIcon size={current.icon} />

      {/* Styled corporate letters according to official image */}
      <div className="flex flex-col justify-center text-left whitespace-nowrap">
        <h1 className={`font-display font-black uppercase text-white leading-none whitespace-nowrap ${current.title}`}>
          CORE<span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">BIT</span>
        </h1>
        <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
          <span className={`block font-sans font-bold text-slate-400 uppercase leading-none whitespace-nowrap ${current.subtitle}`}>
            — SOLUTIONS PVT LTD —
          </span>
        </div>
      </div>
    </div>
  );
}
