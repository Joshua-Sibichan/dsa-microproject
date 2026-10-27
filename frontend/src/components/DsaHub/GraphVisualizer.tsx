import React, { useState, useEffect } from 'react';
import { fetchAirportGraph, runBFS, calculateRoute } from '../../api';
import { GraphNetwork, BFSResult, GraphRouteResult } from '../../types';
import { ArrowRight, Route, Clock, DollarSign } from 'lucide-react';

export const GraphVisualizer: React.FC = () => {
  const [network, setNetwork] = useState<GraphNetwork | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState('DXB');
  const [selectedDestination, setSelectedDestination] = useState('SFO');
  const [bfsResult, setBfsResult] = useState<BFSResult | null>(null);
  const [routeResult, setRouteResult] = useState<GraphRouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAirportGraph().then(setNetwork).catch(console.error);
  }, []);

  const handleRunBFS = async () => {
    setLoading(true);
    try {
      const res = await runBFS(selectedOrigin);
      setBfsResult(res);
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
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary border border-secondary-container/40 uppercase tracking-wider">
                CO5 — Graph &amp; BFS Traversal
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Time: O(V + E) • Space: O(V)</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-navy mt-1">
              Airport Flight Network &amp; BFS Routing
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl">
              Models international airport hubs as vertices and flight corridors as edges in an Adjacency List. Unweighted BFS computes the minimum-segment flight path.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunBFS}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-navy hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary-container">play_arrow</span>
              <span>Run BFS from {selectedOrigin}</span>
            </button>
            <button
              type="button"
              onClick={handleFindRoute}
              disabled={loading}
              className="px-5 py-2.5 bg-primary-container hover:bg-crimson-deep text-white rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Fewest Segments Route</span>
            </button>
          </div>
        </div>

        {/* Airport Selectors */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
              Origin Airport Hub (Vertex u)
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full bg-transparent text-sm font-mono font-bold text-slate-navy focus:outline-none cursor-pointer"
            >
              {network?.nodes.map((node) => (
                <option key={node.code} value={node.code}>
                  {node.code} — {node.city} ({node.name})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border-subtle">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
              Destination Airport (Vertex v)
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-transparent text-sm font-mono font-bold text-slate-navy focus:outline-none cursor-pointer"
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
      <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">public</span>
            <h3 className="font-serif font-bold text-base text-white">Airport Graph Vertices &amp; Flight Corridors</h3>
          </div>
          <span className="font-mono text-xs text-surface-container-highest/70">
            Vertices: <strong className="text-secondary-container font-bold">{network?.nodes.length || 0}</strong> • Edges: <strong className="text-secondary-container font-bold">{network?.edges.length || 0}</strong>
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isOrigin
                    ? 'bg-primary-container/20 border-primary ring-2 ring-primary/40'
                    : isDestination
                      ? 'bg-secondary-container/20 border-gold-metallic ring-2 ring-gold-metallic/40'
                      : isInRoute
                        ? 'bg-emerald-950/60 border-emerald-400'
                        : isVisitedInBFS
                          ? 'bg-surface-container-lowest/10 border-white/20'
                          : 'bg-surface-container-lowest/5 border-white/10 opacity-70'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-base font-bold text-white">{node.code}</span>
                  {isOrigin && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary-container text-white rounded">
                      ORIGIN
                    </span>
                  )}
                  {isDestination && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-secondary-container text-slate-navy rounded">
                      DEST
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-white truncate">{node.city}</div>
                <div className="text-[10px] text-surface-container-highest/60 truncate">{node.country}</div>
              </div>
            );
          })}
        </div>

        {/* Fewest Segments Route Result Card */}
        {routeResult && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-navy to-tertiary-container border border-gold-metallic/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-secondary-container" />
                <h4 className="font-serif font-bold text-sm text-white">Fewest Flight Segments Route (BFS Result)</h4>
              </div>
              <span className="px-3 py-1 bg-secondary-container/20 text-secondary-container rounded-full text-xs font-mono font-bold border border-secondary-container/40">
                {routeResult.segments_count} Segments • {routeResult.stops} Stop(s)
              </span>
            </div>

            {/* Path visualization */}
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {routeResult.path.map((hub, idx) => (
                <React.Fragment key={hub}>
                  <div className="px-3.5 py-1.5 rounded-xl bg-gold-metallic text-slate-navy font-mono font-bold text-sm shadow-md">
                    {hub}
                  </div>
                  {idx < routeResult.path.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-secondary-container shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-3 border-t border-white/10">
              <div className="flex items-center text-surface-container-highest">
                <Clock className="w-4 h-4 mr-1.5 text-surface-container-highest/60" />
                <span>Est. Flying Time: {routeResult.total_estimated_duration_hrs} hours</span>
              </div>
              <div className="flex items-center text-surface-container-highest">
                <DollarSign className="w-4 h-4 mr-1.5 text-secondary-container" />
                <span>Est. Base Fare: ${routeResult.total_estimated_price?.toFixed(2)}</span>
              </div>
            </div>

            {/* Crucial Academic Distinction Callout */}
            <div className="p-3.5 rounded-xl bg-surface-container-lowest/10 border border-white/10 text-surface-container-highest/90 text-xs space-y-1">
              <strong className="text-secondary-container block text-[11px] uppercase tracking-wider">
                Academic Algorithmic Distinction:
              </strong>
              <p className="leading-relaxed">
                <strong>Unweighted BFS guarantees minimum hops (segments)</strong> because it traverses layer-by-layer (distance k before k+1). However, a fewest-segment route is <em>not necessarily</em> the shortest duration route or cheapest route. Finding minimum time or cost requires a weighted shortest-path algorithm (such as Dijkstra's algorithm).
              </p>
            </div>
          </div>
        )}

        {/* BFS Wave Frontier Expansion Display */}
        {bfsResult && (
          <div className="p-5 rounded-2xl bg-surface-container-lowest/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-[18px]">waves</span>
                <h4 className="font-bold text-xs text-white">BFS Traversal Order &amp; Level-by-Level Discovery</h4>
              </div>
              <span className="font-mono text-xs text-secondary-container">Total Visited: {bfsResult.total_visited} Vertices</span>
            </div>

            <div className="space-y-2">
              {Object.entries(bfsResult.levels).map(([lvl, hubs]) => (
                <div key={lvl} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-20 px-2 py-0.5 rounded bg-white/10 text-surface-container-highest/70 font-bold">
                    HOP #{lvl}:
                  </span>
                  <div className="flex gap-2">
                    {hubs.map((h) => (
                      <span key={h} className="px-2.5 py-0.5 rounded bg-gold-light/20 text-gold-light font-bold border border-gold-metallic/30">
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
