import React, { useState, useEffect } from 'react';
import { fetchBSTSummary, operateBST } from '../../api';
import { BSTSummary, BSTNodeDict } from '../../types';
import { GitFork, Search, Plus, Trash2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-300">
                CO4 — BINARY SEARCH TREE
              </span>
              <span className="text-xs text-slate-500 font-mono">Avg Time: O(log N) • Worst: O(N)</span>
            </div>
            <h2 className="text-2xl font-bold text-[#10243A] mt-1">Booking Reference Index — BST</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Indexes active flight reservations by 6-character PNR. Demonstrates binary search branching, inorder sorting, and successor replacement.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Nodes: <span className="font-bold text-[#10243A]">{bstData?.size || 0}</span>
            </div>
            <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Tree Height: <span className="font-bold text-[#10243A]">{bstData?.height || 0}</span>
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
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !pnrInput.trim()}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Path</span>
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={loading || !pnrInput.trim()}
            className="px-4 py-2.5 bg-[#10243A] hover:bg-[#1A3654] disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span>Insert</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || !pnrInput.trim()}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {feedback && (
          <div className="mt-3 text-xs text-slate-700 bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-mono">
            {feedback}
          </div>
        )}
      </div>

      {/* Visual Tree Rendering Canvas */}
      <div className="bg-[#10243A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-[#C7A66A]" />
            <h3 className="font-bold text-base text-white">Hierarchical Tree Structure</h3>
          </div>
          {searchedPath.length > 0 && (
            <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <span>Path:</span>
              <span className="font-bold">{searchedPath.join(' → ')}</span>
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
            <div className="py-16 text-center text-slate-500 text-xs">
              BST is currently empty.
            </div>
          )}
        </div>
      </div>

      {/* Standard Traversals Module */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-[#10243A]">BST Tree Traversals (CO4)</h3>
          
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold space-x-1">
            <button
              onClick={() => setActiveTraversal('inorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'inorder' ? 'bg-white text-[#10243A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inorder (L-Root-R)
            </button>
            <button
              onClick={() => setActiveTraversal('preorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'preorder' ? 'bg-white text-[#10243A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preorder (Root-L-R)
            </button>
            <button
              onClick={() => setActiveTraversal('postorder')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTraversal === 'postorder' ? 'bg-white text-[#10243A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Postorder (L-R-Root)
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono text-xs">
          <div className="text-slate-500 text-[11px] mb-2 font-sans font-medium">
            {activeTraversal === 'inorder' && 'Produces strictly sorted alphabetical order of all booking references:'}
            {activeTraversal === 'preorder' && 'Root visited first; ideal for tree cloning and network serialization:'}
            {activeTraversal === 'postorder' && 'Children visited first; ideal for bottom-up node deallocation:'}
          </div>

          <div className="flex flex-wrap gap-2">
            {bstData && bstData[`${activeTraversal}_traversal`].map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#10243A] font-bold shadow-2xs"
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
          className={`w-14 h-14 rounded-2xl font-mono text-xs font-bold flex flex-col items-center justify-center transition-all border-2 shadow-md ${
            isTarget
              ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-110 ring-4 ring-emerald-400/40'
              : isInPath
              ? 'bg-[#C7A66A] border-[#d8b97c] text-slate-950 ring-2 ring-[#C7A66A]/50'
              : 'bg-navy-900 border-navy-700 text-white'
          }`}
        >
          <span className="leading-tight">{node.key}</span>
          <span className="text-[9px] font-normal opacity-80">{node.value?.seat_number || ''}</span>
        </div>

        {/* Children Branch */}
        {(node.left || node.right) && (
          <div className="flex items-start justify-center mt-3 pt-3 border-t border-slate-600 space-x-6 relative">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400 mb-1">L</span>
              {node.left ? renderTreeNode(node.left, path) : (
                <div className="w-8 h-8 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600">∅</div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400 mb-1">R</span>
              {node.right ? renderTreeNode(node.right, path) : (
                <div className="w-8 h-8 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600">∅</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
};
