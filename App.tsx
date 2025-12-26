
import React, { useState, useEffect, useCallback } from 'react';
import { getPeakHourPredictions } from './services/geminiService';
import { Hotspot, Prediction, GroundingSource, DriverStatus } from './types';
import HeatmapChart from './components/HeatmapChart';

const NAIROBI_REGIONS = [
  "Nairobi Central (CBD/Upper Hill)",
  "Westlands & Kilimani",
  "Lang'ata & Karen",
  "Mombasa Road & Syokimau",
  "Thika Road (Ruaraka/Ruiru)",
  "Ruaka & Gigiri",
  "Eastlands (Donholm/Embakasi)",
  "Waiyaki Way (Kikuyu/Kangemi)"
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [summary, setSummary] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(NAIROBI_REGIONS[0]);
  const [status, setStatus] = useState<DriverStatus>({
    isOnline: false,
    currentLocation: NAIROBI_REGIONS[0],
    platform: "Both"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPeakHourPredictions(selectedRegion);
      setHotspots(data.hotspots);
      setPredictions(data.hourlyPredictions);
      setSources(data.sources);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleStatus = () => setStatus(prev => ({ ...prev, isOnline: !prev.isOnline }));

  const openUber = () => {
    window.open("uberdriver://", "_blank");
    setTimeout(() => window.open("https://drivers.uber.com", "_blank"), 500);
  };

  const openBolt = () => {
    window.open("bolt-driver://", "_blank");
    setTimeout(() => window.open("https://partners.bolt.eu", "_blank"), 500);
  };

  return (
    <div className="min-h-screen pb-28 bg-[#0a0f1c] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 py-3 flex justify-between items-center shadow-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <i className="fas fa-location-arrow text-white"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">KenyDrive</h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Nairobi AI Pro</p>
          </div>
        </div>
        <button 
          onClick={toggleStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            status.isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`}></span>
          {status.isOnline ? 'TRACKING LIVE' : 'START MONITORING'}
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {/* Region Selector */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {NAIROBI_REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                selectedRegion === region 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {region.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* AI Insight Banner */}
        <section className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <i className="fas fa-robot text-indigo-400"></i>
            </div>
            <div>
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Local Prediction</h2>
              <p className="text-md font-medium text-slate-200 leading-snug">
                {loading ? "Analyzing Nairobi traffic patterns..." : summary}
              </p>
            </div>
          </div>
        </section>

        {/* Demand Chart */}
        <section className="glass rounded-2xl p-5 shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-1">Peak Hour Forecast</h2>
              <p className="text-lg font-bold">Demand Intensity</p>
            </div>
            <div className="bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-sm">PRO ACCURACY</span>
            </div>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center bg-slate-800/20 rounded-xl animate-pulse">
              <i className="fas fa-chart-line text-slate-700 text-3xl"></i>
            </div>
          ) : (
            <HeatmapChart data={predictions} />
          )}
        </section>

        {/* Hotspots List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <i className="fas fa-fire text-orange-500 animate-bounce"></i>
              Active Nairobi Hotspots
            </h2>
            <button onClick={fetchData} className="text-emerald-400 text-xs font-bold hover:underline">
              <i className="fas fa-sync-alt mr-1"></i> REFRESH
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="glass h-24 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              hotspots.map((spot, idx) => (
                <div key={idx} className="glass rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{spot.area}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <i className="fas fa-user-clock text-emerald-500"></i> {spot.waitTime} min wait
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-[10px] text-slate-400 font-medium">{spot.estimatedEarnings}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      spot.demandLevel === 'Peak' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                      spot.demandLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {spot.demandLevel} Zone
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic mb-4">"{spot.description}"</p>
                  <button className="w-full py-2 bg-slate-800 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    <i className="fas fa-directions"></i> Set Destination
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* References */}
        {!loading && sources.length > 0 && (
          <section className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Real-time Data Sources</h3>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((src, i) => (
                <a 
                  key={i} 
                  href={src.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] bg-slate-800/80 text-slate-400 p-2 rounded-lg hover:text-emerald-400 truncate flex items-center gap-2 border border-white/5"
                >
                  <i className="fas fa-globe-africa shrink-0 text-slate-600"></i> {src.title}
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 glass border-t border-white/10 flex justify-center gap-3">
        <button 
          onClick={openUber}
          className="flex-1 max-w-[180px] bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-tighter"
        >
          <i className="fab fa-uber text-lg"></i>
          Uber Driver
        </button>
        <button 
          onClick={openBolt}
          className="flex-1 max-w-[180px] bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm uppercase tracking-tighter"
        >
          <i className="fas fa-bolt text-lg"></i>
          Bolt Driver
        </button>
      </div>
    </div>
  );
};

export default App;
