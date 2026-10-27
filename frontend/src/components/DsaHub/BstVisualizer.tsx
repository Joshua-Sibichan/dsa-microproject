import React, { useState, useEffect } from 'react';
import { fetchBSTSummary, operateBST } from '../../api';
import { BSTSummary, BSTNodeDict } from '../../types';
import { Search, Plus, Trash2 } from 'lucide-react';

export const BstVisualizer: React.FC = () => {
  const [bstData, setBstData] = useState<BSTSummary | null>(null);
  const [pnrInput, setPnrInput] = useState('');
  const [searchedPath, setSearchedPath] = useState<string[]>([]);
  const [activeTraversal, setActiveTraversal] = useState<'inorder' | 'preorder' | 'postorder'>('inorder');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchBSTSummary();
      setBstData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await operateBST({
        action: 'SEARCH',
        pnr: pnrInput.trim().toUpperCase()
      });
      setSearchedPath(res.comparison_path || []);
      setFeedback(res.found
        ? `Found PNR ${res.pnr} in ${res.comparisons_count} comparisons via path: ${res.comparison_path.join(' → ')}`
        : `PNR ${res.pnr} not found in BST (inspected: ${res.comparison_path.join(' → ')})`
      );
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    if (!pnrInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await operateBST({
        action: 'INSERT',
        pnr: pnrInput.trim().toUpperCase(),
        passenger_name: 'Manual Test Passenger',
        seat_number: '14B'
      });
      setFeedback(res.message);
      setPnrInput('');
      setSearchedPath([]);
      await loadData();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pnrInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await operateBST({
        action: 'DELETE',
        pnr: pnrInput.trim().toUpperCase()
      });
      setFeedback(res.message);
      setPnrInput('');
      setSearchedPath([]);
      await loadData();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary-container/20 text-secondary border border-secondary-container/40 uppercase tracking-wider">
                CO4 — Binary Search Tree
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Avg Time: O(log N) • Worst: O(N)</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-navy mt-1">
              Booking Reference Index — BST
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5 max-w-2xl">
              Indexes active flight reservations by 6-character PNR. Demonstrates binary search branching, inorder sorting, and successor replacement.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-border-subtle">
              Nodes: <strong className="text-slate-navy font-bold">{bstData?.size || 0}</strong>
            </div>
            <div className="bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-border-subtle">
              Tree Height: <strong className="text-slate-navy font-bold">{bstData?.height || 0}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
            placeholder="PNR Code (e.g. EK9X2B)"
            maxLength={6}
            className="flex-1 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-slate-navy bg-surface-container-low font-mono uppercase focus:outline-none focus:border-slate-navy font-bold"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !pnrInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary-container hover:bg-crimson-deep disabled:bg-surface-container text-white disabled:text-charcoal-muted rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Path</span>
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={loading || !pnrInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-navy hover:bg-slate-900 disabled:bg-surface-container text-white disabled:text-charcoal-muted rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-secondary-container" />
            <span>Insert</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || !pnrInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-surface-container-low hover:bg-crimson-light text-primary border border-primary/30 disabled:bg-surface-container rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {feedback && (
          <div className="mt-3 text-xs text-slate-navy bg-gold-light/40 p-3 rounded-xl border border-gold-metallic/30 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Visual Tree Rendering Canvas */}
      <div className="bg-slate-navy text-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">account_tree</span>
            <h3 className="font-serif font-bold text-base text-white">Hierarchical Tree Structure</h3>
          </div>
          {searchedPath.length > 0 && (
            <div className="text-xs font-mono text-secondary-container flex items-center gap-1.5">
              <span>Path:</span>
              <strong className="font-bold">{searchedPath.join(' → ')}</strong>
            </div>
          )}
        </div>

        {/* Tree Render */}
        <div className="overflow-x-auto py-6 min-h-[300px] flex justify-center">
          {bstData?.tree_hierarchy ? (
            <div className="flex flex-col items-center">
              {renderTreeNode(bstData.tree_hierarchy, searchedPath)}
            </div>
          ) : (
            <div className="py-16 text-center text-surface-container-highest/60 text-xs">
              BST is currently empty.
            </div>
          )}
        </div>
      </div>

      {/* Standard Traversals Module */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <h3 className="font-serif font-bold text-base text-slate-navy">BST Tree Traversals (CO4)</h3>

          <div className="flex bg-surface-container-low p-1 rounded-xl text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setActiveTraversal('inorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'inorder' ? 'bg-white text-slate-navy shadow-sm font-bold' : 'text-charcoal-muted hover:text-slate-navy'
              }`}
            >
              Inorder (L-Root-R)
            </button>
            <button
              type="button"
              onClick={() => setActiveTraversal('preorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'preorder' ? 'bg-white text-slate-navy shadow-sm font-bold' : 'text-charcoal-muted hover:text-slate-navy'
              }`}
            >
              Preorder (Root-L-R)
            </button>
            <button
              type="button"
              onClick={() => setActiveTraversal('postorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'postorder' ? 'bg-white text-slate-navy shadow-sm font-bold' : 'text-charcoal-muted hover:text-slate-navy'
              }`}
            >
              Postorder (L-R-Root)
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle font-mono text-xs">
          <div className="text-charcoal-muted text-[11px] mb-2 font-sans font-medium">
            {activeTraversal === 'inorder' && 'Produces strictly sorted alphabetical order of all booking references:'}
            {activeTraversal === 'preorder' && 'Root visited first; ideal for tree cloning and network serialization:'}
            {activeTraversal === 'postorder' && 'Children visited first; ideal for bottom-up node deallocation:'}
          </div>

          <div className="flex flex-wrap gap-2">
            {bstData && bstData[`${activeTraversal}_traversal`].map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white border border-border-subtle text-slate-navy font-bold shadow-sm"
              >
                {item.key}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function renderTreeNode(node: BSTNodeDict | null, path: string[]): React.ReactNode {
    if (!node) return null;

    const isInPath = path.includes(node.key);
    const isTarget = path.length > 0 && path[path.length - 1] === node.key;

    return (
      <div className="flex flex-col items-center mx-2 my-1">
        {/* Node Circle */}
        <div
          className={`w-14 h-14 rounded-2xl font-mono text-xs font-bold flex flex-col items-center justify-center transition-all border shadow-md ${
            isTarget
              ? 'bg-primary-container border-white text-white scale-110 ring-4 ring-primary/40'
              : isInPath
                ? 'bg-secondary-container border-gold-metallic text-slate-navy ring-2 ring-gold-metallic/50'
                : 'bg-surface-container-lowest/10 border-white/20 text-white'
          }`}
        >
          <span className="leading-tight">{node.key}</span>
          <span className="text-[9px] font-normal opacity-80">{node.value?.seat_number || ''}</span>
        </div>

        {/* Children Branch */}
        {(node.left || node.right) && (
          <div className="flex items-start justify-center mt-3 pt-3 border-t border-white/20 space-x-6 relative">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-surface-container-highest/60 mb-1">L</span>
              {node.left ? renderTreeNode(node.left, path) : (
                <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-[10px] text-surface-container-highest/40">∅</div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-surface-container-highest/60 mb-1">R</span>
              {node.right ? renderTreeNode(node.right, path) : (
                <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-[10px] text-surface-container-highest/40">∅</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
};
