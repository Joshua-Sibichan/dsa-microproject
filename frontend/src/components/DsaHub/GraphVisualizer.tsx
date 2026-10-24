import React, { useState, useEffect } from 'react';
import { fetchAirportGraph, runBFS, calculateRoute } from '../../api';
import { GraphNetwork, BFSResult, GraphRouteResult } from '../../types';
import { Globe, Play, Compass, ArrowRight, Route, Clock, DollarSign, Layers } from 'lucide-react';

export const GraphVisualizer: React.FC = () => {
  const [network, setNetwork] = useState<GraphNetwork | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState('DXB');
  const [selectedDestination, setSelectedDestination] = useState('SFO');
  const [bfsResult, setBfsResult] = useState<BFSResult | null>(null);
  const [routeResult, setRouteResult] = useState<GraphRouteResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAirportGraph().then(setNetwork).catch(console.error);
  }, []);

  const handleRunBFS = async () => {
    setLoading(true);
    try {
      const res = await runBFS(selectedOrigin);
      setBfsResult(res);
      setActiveStep(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindRoute = async () => {
    setLoading(true);
    try {
      const res = await calculateRoute(selectedOrigin, selectedDestination);
      setRouteResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
                CO5 — GRAPH & BFS TRAVERSAL
              </span>
              <span className="text-xs text-slate-500 font-mono">Time: O(V + E) • Space: O(V)</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Airport Flight Network & BFS Routing</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Models international airport hubs as vertices and flight corridors as edges in an Adjacency List.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunBFS}
              disabled={loading}
              className="px-4 py-2.5 bg-[#10243A] hover:bg-[#1A3654] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span>Run BFS from {selectedOrigin}</span>
            </button>
            <button
              onClick={handleFindRoute}
              disabled={loading}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Fewest Segments Route</span>
            </button>
          </div>
        </div>

        {/* Airport Selectors */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Origin Airport Hub (Vertex u)</label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              {network?.nodes.map((node) => (
                <option key={node.code} value={node.code}>
                  {node.code} — {node.city} ({node.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination Airport (Vertex v)</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              {network?.nodes.map((node) => (
                <option key={node.code} value={node.code}>
                  {node.code} — {node.city} ({node.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Network Nodes Grid */}
      <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#C7A66A]" />
            <h3 className="font-bold text-base text-white">Airport Graph Vertices & Flight Corridors</h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Vertices: <span className="text-[#C7A66A] font-bold">{network?.nodes.length || 0}</span> • Edges: <span className="text-[#C7A66A] font-bold">{network?.edges.length || 0}</span>
          </span>
        </div>

        {/* Airport Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {network?.nodes.map((node) => {
            const isOrigin = node.code === selectedOrigin;
            const isDestination = node.code === selectedDestination;
            const isInRoute = routeResult?.path?.includes(node.code);
            const isVisitedInBFS = bfsResult?.traversal_order?.includes(node.code);

            return (
              <div
                key={node.code}
                onClick={() => setSelectedOrigin(node.code)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isOrigin
                    ? 'bg-amber-950/60 border-[#C7A66A] ring-2 ring-amber-400/40'
                    : isDestination
                    ? 'bg-blue-950/60 border-[#2563EB] ring-2 ring-blue-400/40'
                    : isInRoute
                    ? 'bg-emerald-950/60 border-emerald-400'
                    : isVisitedInBFS
                    ? 'bg-navy-900 border-navy-700'
                    : 'bg-navy-900 border-navy-800 opacity-70'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-base font-bold text-white">{node.code}</span>
                  {isOrigin && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#C7A66A] text-slate-950 rounded">ORIGIN</span>}
                  {isDestination && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#2563EB] text-white rounded">DEST</span>}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">{node.city}</div>
                <div className="text-[10px] text-slate-400 truncate">{node.country}</div>
              </div>
            );
          })}
        </div>

        {/* Fewest Segments Route Result Card */}
        {routeResult && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-400/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Route className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Fewest Flight Segments Route (BFS Result)</h4>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold border border-emerald-500/40">
                {routeResult.segments_count} Segments • {routeResult.stops} Stop(s)
              </span>
            </div>

            {/* Path visualization */}
            <div className="flex items-center space-x-3 overflow-x-auto py-2">
              {routeResult.path.map((hub, idx) => (
                <React.Fragment key={hub}>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-mono font-bold text-sm shadow-md">
                    {hub}
                  </div>
                  {idx < routeResult.path.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-3 border-t border-emerald-800/60">
              <div className="flex items-center text-slate-300">
                <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Est. Flying Time: {routeResult.total_estimated_duration_hrs} hours</span>
              </div>
              <div className="flex items-center text-slate-300">
                <DollarSign className="w-4 h-4 mr-1.5 text-[#C7A66A]" />
                <span>Est. Base Fare: ${routeResult.total_estimated_price?.toFixed(2)}</span>
              </div>
            </div>

            {/* Crucial Academic Distinction Callout */}
            <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-700 text-slate-300 text-xs space-y-1">
              <strong className="text-[#C7A66A] block text-[11px] uppercase">Academic Algorithmic Distinction:</strong>
              <p>
                <strong>Unweighted BFS guarantees minimum hops (segments)</strong> because it traverses layer-by-layer (distance k before k+1).
                However, a fewest-segment route is <em>not necessarily</em> the shortest duration route or the cheapest route. Finding minimum time or cost requires a weighted shortest-path algorithm (such as Dijkstra's algorithm).
              </p>
            </div>
          </div>
        )}

        {/* BFS Wave Frontier Expansion Display */}
        {bfsResult && (
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#C7A66A]" />
                <h4 className="font-bold text-xs text-white">BFS Traversal Order & Level-by-Level Discovery</h4>
              </div>
              <span className="font-mono text-xs text-emerald-400">Total Visited: {bfsResult.total_visited} Vertices</span>
            </div>

            <div className="space-y-2">
              {Object.entries(bfsResult.levels).map(([lvl, hubs]) => (
                <div key={lvl} className="flex items-center space-x-3 text-xs font-mono">
                  <span className="w-20 px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    HOP #{lvl}:
                  </span>
                  <div className="flex space-x-2">
                    {hubs.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
