import React, { useMemo } from "react";
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Terminal, 
  Lock, 
  Server, 
  Layers, 
  Clock, 
  Network, 
  TrendingUp, 
  LineChart 
} from "lucide-react";

interface SystemMockInterfaceProps {
  projectName: string;
  companyName: string;
  projectOverview?: string;
  screenIndex: number;
}

export default function SystemMockInterface({ 
  projectName, 
  companyName, 
  projectOverview = "", 
  screenIndex 
}: SystemMockInterfaceProps) {
  
  // 1. Detect Category/Niche from Project context
  const projectNiche = useMemo(() => {
    const text = (projectName + " " + projectOverview).toLowerCase();
    
    if (text.match(/(fund|chit|payment|finance|ledger|crypto|trading|bank|money|billing|price|pricing|revenue)/)) {
      return {
        id: "finance",
        primaryColor: "emerald",
        accentColor: "teal",
        badge: "AUTHORIZED FINANCIAL LEDGER",
        metricLabel: "TRANSACTION THRUPUT",
        metricUnit: "txs/sec",
        columns: ["Transaction UUID", "Ledger Credit", "Escrow Hold", "Status"],
        records: [
          ["TX-9821-CBIT", "₹4,12,000.00", "₹12,400.00", "Settled"],
          ["TX-5512-CBIT", "₹8,90,000.00", "₹0.00", "Settled"],
          ["TX-3011-CBIT", "₹13,000.00", "₹13,000.00", "In Escrow"],
          ["TX-1189-CBIT", "₹12,45,600.00", "₹45,000.00", "Sovereign Bonded"],
        ]
      };
    }
    
    if (text.match(/(health|medical|patient|hospital|clinical|portal|dental|doctor|nurse|prescription)/)) {
      return {
        id: "healthcare",
        primaryColor: "cyan",
        accentColor: "sky",
        badge: "HIPAA-SECURED PATIENT PORTAL",
        metricLabel: "EHR ENCRYPTION HASH",
        metricUnit: "H/sec",
        columns: ["Patient UUID", "Record Decryption Status", "Access Log IP", "Cryptographic Checksum"],
        records: [
          ["PAT-512-RVO", "Encrypted (AES-256)", "172.56.12.98", "PASS (SHA256)"],
          ["PAT-319-KLO", "Handshake Verified", "109.112.5.42", "PASS (SHA256)"],
          ["PAT-009-PLA", "Archived Sandbox", "172.56.12.98", "PASS (SHA256)"],
          ["PAT-774-MND", "Active Teleconsultation", "198.11.23.4", "SYNC ACTIVE"],
        ]
      };
    }

    if (text.match(/(logistics|warehouse|gps|fleet|routes|map|shipping|delivery|truck|container|transit)/)) {
      return {
        id: "logistics",
        primaryColor: "amber",
        accentColor: "orange",
        badge: "DISPATCH LOGISTICS TRACKING MATRIX",
        metricLabel: "ACTIVE TRANSIT FLEETS",
        metricUnit: "routes/min",
        columns: ["Route Container ID", "Transit Point", "ETA Deviation", "Telemetry Health"],
        records: [
          ["CONT-ZG-882", "Mumbai Terminus A", "0.0 min (On-Time)", "99.8% Online"],
          ["CONT-ZG-119", "KG Chavadi Checkpoint", "-12.5 min (Ahead)", "100% Online"],
          ["CONT-ZG-664", "Singapore Port B", "+4.2 min (Stable)", "94.2% Diagnostic"],
          ["CONT-ZG-055", "Suez Canal Transit", "+2.0 hrs (Idle Queue)", "100% Locked"],
        ]
      };
    }

    if (text.match(/(ai|agent|bot|intelligence|brain|learning|model|llm|copilot|predict)/)) {
      return {
        id: "ai",
        primaryColor: "violet",
        accentColor: "rose",
        badge: "NEURAL COGNITIVE DEPLOYMENT MATRIX",
        metricLabel: "TOKEN DENSITY LOAD",
        metricUnit: "tokens/ms",
        columns: ["Prompt Agent Hash", "Execution Pipeline", "Latency Load", "Response Quality"],
        records: [
          ["AGN-8041-A", "Deep Reasoning Engine", "145ms", "99.7% Score"],
          ["AGN-3367-B", "Semantic Context Router", "22ms", "100% Cache Hit"],
          ["AGN-7701-F", "Metadata Retrieval Vector", "84ms", "98.9% Perfect"],
          ["AGN-2209-X", "Grounding Search Verification", "340ms", "Grounding Verified"],
        ]
      };
    }

    // Default Enterprise Management portal
    return {
      id: "enterprise",
      primaryColor: "sky",
      accentColor: "indigo",
      badge: "ENTERPRISE CORE OPERATIONS ENGINE",
      metricLabel: "ACTIVE NODE SOCKETS",
      metricUnit: "sockets/sec",
      columns: ["Component Node", "Replication", "Session Footprint", "Diagnostic Status"],
      records: [
        ["Core Gateway [API v4]", "Sync Live", "12.4 MB/s", "HEALTHY"],
        ["Distributed Scheduler", "Sync Live", "1.2 MB/s", "HEALTHY"],
        ["Client Access Controller", "Replication Bound", "456 KB/s", "VERIFIED"],
        ["Analytics Compilator", "Idle Cache Buffer", "0 Bytes", "STABLE"],
      ]
    };
  }, [projectName, projectOverview]);

  // 2. Map screen content based on thumbnail index (Page index clicked)
  const screenContent = useMemo(() => {
    switch (screenIndex % 5) {
      case 0:
        return {
          title: "System Sandbox & Staging Monitor",
          tag: "Core Analytics",
          icon: <Activity className="w-5 h-5 text-orange-400" />,
          desc: "Live performance graphs, core diagnostic metrics, and socket request frequencies."
        };
      case 1:
        return {
          title: "Cryptographic Vault & Access Rules",
          tag: "Security Matrix",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          desc: "Secure end-to-end hashes, active administrator sessions auditing, and firewall telemetry."
        };
      case 2:
        return {
          title: "Distributed Query Cluster Database",
          tag: "Data Warehouse",
          icon: <Database className="w-5 h-5 text-cyan-400" />,
          desc: "Active document shards replication status, timeout indices, and local fallbacks storage activity."
        };
      case 3:
        return {
          title: "System Thread Pool & CPU Telemetry",
          tag: "Cluster Processing",
          icon: <Cpu className="w-5 h-5 text-violet-400" />,
          desc: "System virtual threads, CPU footprint utilization, microservices orchestrator queues."
        };
      case 4:
      default:
        return {
          title: "Live Terminal Handshake Logstream",
          tag: "Terminal Streams",
          icon: <Terminal className="w-5 h-5 text-amber-400" />,
          desc: "Timestamped transaction handshakes, telemetry streams, and query metrics."
        };
    }
  }, [screenIndex]);

  // Styling maps
  const colorMap = {
    emerald: {
      from: "from-emerald-500/20",
      to: "to-teal-500/5",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      dot: "bg-emerald-500",
      ring: "ring-emerald-500/30",
    },
    teal: {
      from: "from-teal-500/20",
      to: "to-cyan-500/5",
      border: "border-teal-500/20",
      text: "text-teal-400",
      bg: "bg-teal-500/10",
      dot: "bg-teal-500",
      ring: "ring-teal-500/30",
    },
    cyan: {
      from: "from-cyan-500/20",
      to: "to-sky-500/5",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      dot: "bg-cyan-400",
      ring: "ring-cyan-500/30",
    },
    sky: {
      from: "from-sky-500/20",
      to: "to-indigo-500/5",
      border: "border-sky-500/20",
      text: "text-sky-400",
      bg: "bg-sky-500/10",
      dot: "bg-sky-500",
      ring: "ring-sky-500/30",
    },
    amber: {
      from: "from-amber-500/20",
      to: "to-orange-500/5",
      border: "border-amber-500/20",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      dot: "bg-amber-500",
      ring: "ring-amber-500/30",
    },
    orange: {
      from: "from-orange-500/20",
      to: "to-red-500/5",
      border: "border-orange-500/20",
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      dot: "bg-orange-500",
      ring: "ring-orange-500/30",
    },
    violet: {
      from: "from-violet-500/20",
      to: "to-rose-500/5",
      border: "border-violet-500/20",
      text: "text-violet-400",
      bg: "bg-violet-500/10",
      dot: "bg-violet-500",
      ring: "ring-violet-500/30",
    },
    rose: {
      from: "from-rose-500/20",
      to: "to-red-500/5",
      border: "border-rose-500/20",
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      dot: "bg-rose-500",
      ring: "ring-rose-500/30",
    },
    indigo: {
      from: "from-indigo-500/20",
      to: "to-blue-500/5",
      border: "border-indigo-500/20",
      text: "text-indigo-400",
      bg: "bg-indigo-500/10",
      dot: "bg-indigo-500",
      ring: "ring-indigo-500/30",
    }
  };

  const currentTheme = colorMap[projectNiche.primaryColor as keyof typeof colorMap] || colorMap.sky;

  return (
    <div id="system-mock-container" className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 font-sans overflow-hidden select-none select-none">
      
      {/* 2.1 STAGING WATERMARK/NOTICE BANNER */}
      <div id="staging-grid-banner" className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentTheme.dot} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentTheme.dot}`}></span>
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
            {projectNiche.badge}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
          <Lock className="w-2.5 h-2.5 text-orange-400" />
          <span className="text-[8px] font-mono font-bold text-orange-300 tracking-tight uppercase">
            Proprietary Secure Portal Simulator
          </span>
        </div>
      </div>

      {/* 2.2 MAIN REPLICATION LAYOUT */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left Column: Virtual Telemetry Metric Boards */}
        <div className="space-y-2.5 flex flex-col justify-between col-span-1">
          {/* Main Module Card */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              {screenContent.icon}
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${currentTheme.text}`}>
                {screenContent.tag}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-display font-medium text-white tracking-wide">
              {screenContent.title}
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {screenContent.desc}
            </p>
          </div>

          {/* Core Dynamic Stats Counter */}
          <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl grid grid-cols-2 gap-2 h-[80px]">
            <div className="border-r border-white/5 pr-2">
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                {projectNiche.metricLabel}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-base sm:text-lg font-mono font-bold tracking-tight ${currentTheme.text}`}>
                  {screenIndex % 2 === 0 ? "1,489" : "3,254"}
                </span>
                <span className="text-[8px] font-mono text-slate-400">{projectNiche.metricUnit}</span>
              </div>
            </div>
            <div className="pl-2">
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                SYSTEM REACHABILITY
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base sm:text-lg font-mono font-bold tracking-tight text-emerald-400">
                  99.98%
                </span>
                <span className="text-[8px] font-mono text-slate-400">uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Staged Ledger Database Sandbox Table */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-between bg-zinc-950/40 border border-white/5 rounded-xl p-3">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
            <span className="text-[9px] font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-500" /> Staged Core Data View ({companyName})
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-slate-400 font-mono">
              <Clock className="w-2.5 h-2.5 text-slate-500" /> Sync: 0s ago
            </div>
          </div>

          {/* Mini Interactive-looking Record Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-none min-h-0 text-[10px] space-y-1.5">
            {/* Header row */}
            <div className="grid grid-cols-4 font-mono text-[8px] text-slate-500 uppercase pb-1 border-b border-white/5 tracking-wider">
              {projectNiche.columns.map((col, idx) => (
                <div key={idx} className={idx === 3 ? "text-right" : ""}>
                  {col}
                </div>
              ))}
            </div>

            {/* Matrix details */}
            {projectNiche.records.map((rec, rIdx) => (
              <div 
                key={rIdx} 
                className={`grid grid-cols-4 py-1.5 border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-slate-300 align-center rounded ${rIdx % 2 === 0 ? "bg-white/[0.01]" : ""}`}
              >
                <div className="text-slate-400 font-medium truncate pr-1">
                  {rec[0]}
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-1 h-1 rounded-full ${rec[3] === "Settled" || rec[3] === "PASS (SHA256)" || rec[3] === "100% Online" || rec[3] === "100% Locked" || rec[3] === "100% Cache Hit" || rec[3] === "HEALTHY" || rec[3] === "VERIFIED" ? "bg-emerald-400" : "bg-orange-400"}`} />
                  <span className="truncate">{rec[1]}</span>
                </div>
                <div className="text-slate-500 truncate pr-1">
                  {rec[2]}
                </div>
                <div className={`text-right font-medium truncate ${
                  rec[3].includes("Settled") || rec[3].includes("PASS") || rec[3].includes("Online") || rec[3].includes("Healthy") || rec[3].includes("Score")
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}>
                  {rec[3]}
                </div>
              </div>
            ))}
          </div>

          {/* System Telemetry Console Output */}
          <div className="mt-2.5 p-2 bg-black/60 rounded-lg border border-white/5 font-mono text-[8px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Network className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="text-slate-500 truncate">
                CBIT_REPL_PING: <span className="text-slate-300">"pong"</span> [12ms] | SEC_ENC_ALG: <span className="text-slate-300">"SHA256"</span>
              </span>
            </div>
            <div className="text-emerald-500 shrink-0 font-bold ml-1">
              ● HOST PORT 3000
            </div>
          </div>

        </div>
      </div>

      {/* 2.3 FOOTER SYSTEM COMPILER PATHS */}
      <div id="staging-simulation-notice" className="mt-2.5 pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 font-mono text-[8.5px] gap-2">
        <span className="text-center sm:text-left flex items-center gap-1 text-slate-400">
          <Server className="w-3 h-3 text-orange-400/90" />
          Virtual presentation generated from enterprise meta-coordinates.
        </span>
        <span className="text-slate-400 text-center sm:text-right">
          Build Target: CbitAppletContainer v1.4.2 [Production Mode]
        </span>
      </div>

    </div>
  );
}
