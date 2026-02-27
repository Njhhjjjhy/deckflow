import { useState, useEffect, useCallback } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

type TriLang = { en: string; 'zh-tw': string; 'zh-cn': string };

interface NodeData {
  id: string;
  heading: TriLang;
  body: TriLang;
  fillColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface ArrowData {
  id: string;
  sourceId: string;
  targetId: string;
  bidirectional: boolean;
  label: TriLang;
  labelPosition: 'above' | 'below' | 'left' | 'right';
}

interface LegendData {
  id: string;
  color: string;
  label: TriLang;
}

interface FootnoteData {
  id: string;
  text: TriLang;
  visible: boolean;
}

const MAX_NODES = 12;
const MIN_NODES = 1;
const MAX_ARROWS = 20;
const MAX_LEGEND = 8;
const MIN_LEGEND = 1;
const FOOTNOTE_COUNT = 3;

function el(): TriLang {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function asTF(rec: TriLang) {
  return {
    ...rec,
    translationStatus: { 'zh-tw': 'empty' as const, 'zh-cn': 'empty' as const },
  };
}

function createDefaultNode(): NodeData {
  return {
    id: crypto.randomUUID(),
    heading: el(),
    body: el(),
    fillColor: '#E8E8E8',
    x: 30,
    y: 30,
    width: 180,
    height: 55,
    borderRadius: 16,
  };
}

function createDefaultArrow(sourceId: string, targetId: string): ArrowData {
  return {
    id: crypto.randomUUID(),
    sourceId,
    targetId,
    bidirectional: false,
    label: el(),
    labelPosition: 'above',
  };
}

function createDefaultLegend(): LegendData {
  return { id: crypto.randomUUID(), color: '#E8E8E8', label: el() };
}

function createDefaultFootnote(): FootnoteData {
  return { id: crypto.randomUUID(), text: el(), visible: false };
}

interface FlowChartEditorProps {
  page: Page;
}

export default function FlowChartEditor({ page }: FlowChartEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as TriLang & { translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const arrowColor = (page.content.arrowColor as string) || '#1A1A1A';

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const [legend, setLegend] = useState<LegendData[]>([]);
  const [footnotes, setFootnotes] = useState<FootnoteData[]>([]);

  // Parse on mount
  useEffect(() => {
    try { setNodes(JSON.parse((page.content.nodesData as string) || '[]')); } catch { setNodes([createDefaultNode()]); }
    try { setArrows(JSON.parse((page.content.arrowsData as string) || '[]')); } catch { setArrows([]); }
    try { setLegend(JSON.parse((page.content.legendData as string) || '[]')); } catch { setLegend([createDefaultLegend()]); }
    try {
      const fn = JSON.parse((page.content.footnotesData as string) || '[]');
      // Ensure exactly 3 footnotes
      while (fn.length < FOOTNOTE_COUNT) fn.push(createDefaultFootnote());
      setFootnotes(fn.slice(0, FOOTNOTE_COUNT));
    } catch {
      setFootnotes(Array.from({ length: FOOTNOTE_COUNT }, createDefaultFootnote));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync helpers
  const syncNodes = useCallback((u: NodeData[]) => { setNodes(u); updateStringField(page.id, 'nodesData', JSON.stringify(u)); }, [page.id, updateStringField]);
  const syncArrows = useCallback((u: ArrowData[]) => { setArrows(u); updateStringField(page.id, 'arrowsData', JSON.stringify(u)); }, [page.id, updateStringField]);
  const syncLegend = useCallback((u: LegendData[]) => { setLegend(u); updateStringField(page.id, 'legendData', JSON.stringify(u)); }, [page.id, updateStringField]);
  const syncFootnotes = useCallback((u: FootnoteData[]) => { setFootnotes(u); updateStringField(page.id, 'footnotesData', JSON.stringify(u)); }, [page.id, updateStringField]);

  // ── Node operations ──
  const addNode = useCallback(() => {
    if (nodes.length >= MAX_NODES) return;
    syncNodes([...nodes, createDefaultNode()]);
  }, [nodes, syncNodes]);

  const removeNode = useCallback((idx: number) => {
    if (nodes.length <= MIN_NODES) return;
    const removedId = nodes[idx].id;
    const updatedNodes = nodes.filter((_, i) => i !== idx);
    syncNodes(updatedNodes);
    // Remove arrows referencing this node
    const updatedArrows = arrows.filter((a) => a.sourceId !== removedId && a.targetId !== removedId);
    if (updatedArrows.length !== arrows.length) syncArrows(updatedArrows);
  }, [nodes, arrows, syncNodes, syncArrows]);

  const moveNode = useCallback((idx: number, dir: 'up' | 'down') => {
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= nodes.length) return;
    const u = [...nodes];
    [u[idx], u[swapIdx]] = [u[swapIdx], u[idx]];
    syncNodes(u);
  }, [nodes, syncNodes]);

  const updateNode = useCallback((idx: number, patch: Partial<NodeData>) => {
    const u = [...nodes];
    u[idx] = { ...u[idx], ...patch };
    syncNodes(u);
  }, [nodes, syncNodes]);

  const updateNodeLang = useCallback((idx: number, field: 'heading' | 'body', lang: Language, value: string) => {
    const u = [...nodes];
    u[idx] = { ...u[idx], [field]: { ...u[idx][field], [lang]: value } };
    syncNodes(u);
  }, [nodes, syncNodes]);

  // ── Arrow operations ──
  const addArrow = useCallback(() => {
    if (arrows.length >= MAX_ARROWS || nodes.length < 2) return;
    syncArrows([...arrows, createDefaultArrow(nodes[0].id, nodes[1].id)]);
  }, [arrows, nodes, syncArrows]);

  const removeArrow = useCallback((idx: number) => {
    syncArrows(arrows.filter((_, i) => i !== idx));
  }, [arrows, syncArrows]);

  const updateArrow = useCallback((idx: number, patch: Partial<ArrowData>) => {
    const u = [...arrows];
    u[idx] = { ...u[idx], ...patch };
    syncArrows(u);
  }, [arrows, syncArrows]);

  const updateArrowLang = useCallback((idx: number, lang: Language, value: string) => {
    const u = [...arrows];
    u[idx] = { ...u[idx], label: { ...u[idx].label, [lang]: value } };
    syncArrows(u);
  }, [arrows, syncArrows]);

  // ── Legend operations ──
  const addLegendRow = useCallback(() => {
    if (legend.length >= MAX_LEGEND) return;
    syncLegend([...legend, createDefaultLegend()]);
  }, [legend, syncLegend]);

  const removeLegendRow = useCallback((idx: number) => {
    if (legend.length <= MIN_LEGEND) return;
    syncLegend(legend.filter((_, i) => i !== idx));
  }, [legend, syncLegend]);

  const updateLegendColor = useCallback((idx: number, color: string) => {
    const u = [...legend];
    u[idx] = { ...u[idx], color };
    syncLegend(u);
  }, [legend, syncLegend]);

  const updateLegendLabel = useCallback((idx: number, lang: Language, value: string) => {
    const u = [...legend];
    u[idx] = { ...u[idx], label: { ...u[idx].label, [lang]: value } };
    syncLegend(u);
  }, [legend, syncLegend]);

  // ── Footnote operations ──
  const updateFootnoteText = useCallback((idx: number, lang: Language, value: string) => {
    const u = [...footnotes];
    u[idx] = { ...u[idx], text: { ...u[idx].text, [lang]: value } };
    syncFootnotes(u);
  }, [footnotes, syncFootnotes]);

  const toggleFootnoteVisible = useCallback((idx: number) => {
    const u = [...footnotes];
    u[idx] = { ...u[idx], visible: !u[idx].visible };
    syncFootnotes(u);
  }, [footnotes, syncFootnotes]);

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Flow Chart / Org Structure
      </h2>

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 06 | Corporate Structure"
        />
      </fieldset>

      {/* Year */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => updateStringField(page.id, 'year', e.target.value)}
          placeholder="e.g. 2026"
          maxLength={10}
          className="w-full px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
          style={{ color: '#1A1A1A' }}
        />
      </fieldset>

      {/* Page number */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Page Number</label>
        {pageNumber ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageNumber}
              onChange={(e) => updateStringField(page.id, 'pageNumber', e.target.value)}
              maxLength={4}
              className="w-24 px-3 py-2 text-sm rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931]"
              style={{ color: '#1A1A1A' }}
            />
            <button
              onClick={() => updateStringField(page.id, 'pageNumber', '')}
              className="px-2 py-2 text-xs rounded border border-[#E5E5E5] hover:bg-red-50 hover:border-red-200 transition-colors"
              style={{ color: '#999' }}
              title="Remove page number"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => updateStringField(page.id, 'pageNumber', String(page.order + 1))}
            className="px-3 py-2 text-xs rounded border border-dashed border-[#CCCCCC] hover:border-[#FBB931] transition-colors"
            style={{ color: '#666' }}
          >
            + Add page number
          </button>
        )}
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Global arrow color */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Arrow Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={arrowColor}
            onChange={(e) => updateStringField(page.id, 'arrowColor', e.target.value)}
            className="w-8 h-8 rounded border border-[#E5E5E5] cursor-pointer"
          />
          <input
            type="text"
            value={arrowColor}
            onChange={(e) => updateStringField(page.id, 'arrowColor', e.target.value)}
            maxLength={7}
            className="w-24 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
            style={{ color: '#1A1A1A' }}
          />
        </div>
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* ── NODES ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Nodes ({nodes.length}/{MAX_NODES})
          </label>
          <button
            onClick={addNode}
            disabled={nodes.length >= MAX_NODES}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Node
          </button>
        </div>

        <div className="space-y-4">
          {nodes.map((node, ni) => (
            <div
              key={node.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-3"
              style={{ background: '#FAFAFA' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">Node {ni + 1}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => moveNode(ni, 'up')} disabled={ni === 0} className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25" style={{ color: '#333' }}>▲</button>
                  <button onClick={() => moveNode(ni, 'down')} disabled={ni === nodes.length - 1} className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25" style={{ color: '#333' }}>▼</button>
                  <button onClick={() => removeNode(ni)} disabled={nodes.length <= MIN_NODES} className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25" style={{ color: '#999' }}>✕</button>
                </div>
              </div>

              {/* Heading */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Heading</label>
                <LanguageTabs
                  field={asTF(node.heading)}
                  onChange={(lang, value) => updateNodeLang(ni, 'heading', lang, value)}
                  placeholder="Node heading"
                />
              </fieldset>

              {/* Body */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Body (optional)</label>
                <LanguageTabs
                  field={asTF(node.body)}
                  onChange={(lang, value) => updateNodeLang(ni, 'body', lang, value)}
                  placeholder="Short description"
                />
              </fieldset>

              {/* Fill color */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Fill Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={node.fillColor}
                    onChange={(e) => updateNode(ni, { fillColor: e.target.value })}
                    className="w-6 h-6 rounded border border-[#E5E5E5] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={node.fillColor}
                    onChange={(e) => updateNode(ni, { fillColor: e.target.value })}
                    maxLength={7}
                    className="w-20 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                    style={{ color: '#1A1A1A' }}
                  />
                </div>
              </fieldset>

              {/* Position & size */}
              <div>
                <label className="block text-[10px] text-[#999] mb-1">Position & Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-[#999]">X %</span>
                    <input type="number" value={node.x} min={0} max={100} onChange={(e) => updateNode(ni, { x: Number(e.target.value) })} className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]" style={{ color: '#1A1A1A' }} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#999]">Y %</span>
                    <input type="number" value={node.y} min={0} max={100} onChange={(e) => updateNode(ni, { y: Number(e.target.value) })} className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]" style={{ color: '#1A1A1A' }} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#999]">Width px</span>
                    <input type="number" value={node.width} min={40} max={400} onChange={(e) => updateNode(ni, { width: Number(e.target.value) })} className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]" style={{ color: '#1A1A1A' }} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#999]">Height px</span>
                    <input type="number" value={node.height} min={20} max={300} onChange={(e) => updateNode(ni, { height: Number(e.target.value) })} className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]" style={{ color: '#1A1A1A' }} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-[9px] text-[#999]">Border Radius px</span>
                  <input type="number" value={node.borderRadius} min={0} max={100} onChange={(e) => updateNode(ni, { borderRadius: Number(e.target.value) })} className="w-20 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]" style={{ color: '#1A1A1A' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* ── ARROWS ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Arrows ({arrows.length}/{MAX_ARROWS})
          </label>
          <button
            onClick={addArrow}
            disabled={arrows.length >= MAX_ARROWS || nodes.length < 2}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Arrow
          </button>
        </div>

        <div className="space-y-4">
          {arrows.map((arrow, ai) => (
            <div
              key={arrow.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-3"
              style={{ background: '#FAFAFA' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">Arrow {ai + 1}</span>
                <button onClick={() => removeArrow(ai)} className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100" style={{ color: '#999' }}>✕</button>
              </div>

              {/* Source / Target */}
              <div className="grid grid-cols-2 gap-2">
                <fieldset>
                  <label className="block text-[10px] text-[#999] mb-1">Source</label>
                  <select
                    value={arrow.sourceId}
                    onChange={(e) => updateArrow(ai, { sourceId: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                    style={{ color: '#1A1A1A' }}
                  >
                    {nodes.map((n, ni) => (
                      <option key={n.id} value={n.id}>{ni + 1}. {n.heading.en || `Node ${ni + 1}`}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset>
                  <label className="block text-[10px] text-[#999] mb-1">Target</label>
                  <select
                    value={arrow.targetId}
                    onChange={(e) => updateArrow(ai, { targetId: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                    style={{ color: '#1A1A1A' }}
                  >
                    {nodes.map((n, ni) => (
                      <option key={n.id} value={n.id}>{ni + 1}. {n.heading.en || `Node ${ni + 1}`}</option>
                    ))}
                  </select>
                </fieldset>
              </div>

              {/* Direction */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={arrow.bidirectional}
                  onChange={(e) => updateArrow(ai, { bidirectional: e.target.checked })}
                  className="rounded border-[#E5E5E5]"
                />
                <span className="text-[10px] text-[#999]">Bidirectional</span>
              </label>

              {/* Label */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Label (optional)</label>
                <LanguageTabs
                  field={asTF(arrow.label)}
                  onChange={(lang, value) => updateArrowLang(ai, lang, value)}
                  placeholder="Arrow label"
                />
              </fieldset>

              {/* Label position */}
              <fieldset>
                <label className="block text-[10px] text-[#999] mb-1">Label Position</label>
                <select
                  value={arrow.labelPosition}
                  onChange={(e) => updateArrow(ai, { labelPosition: e.target.value as ArrowData['labelPosition'] })}
                  className="w-full px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </fieldset>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* ── LEGEND ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Legend ({legend.length}/{MAX_LEGEND})
          </label>
          <button
            onClick={addLegendRow}
            disabled={legend.length >= MAX_LEGEND}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Row
          </button>
        </div>

        <div className="space-y-3">
          {legend.map((item, li) => (
            <div
              key={item.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-2"
              style={{ background: '#FAFAFA' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">Row {li + 1}</span>
                <button onClick={() => removeLegendRow(li)} disabled={legend.length <= MIN_LEGEND} className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25" style={{ color: '#999' }}>✕</button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => updateLegendColor(li, e.target.value)}
                  className="w-6 h-6 rounded border border-[#E5E5E5] cursor-pointer"
                />
                <input
                  type="text"
                  value={item.color}
                  onChange={(e) => updateLegendColor(li, e.target.value)}
                  maxLength={7}
                  className="w-20 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
              </div>
              <LanguageTabs
                field={asTF(item.label)}
                onChange={(lang, value) => updateLegendLabel(li, lang, value)}
                placeholder="Legend label"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* ── FOOTNOTES ── */}
      <div>
        <label className="block text-xs font-medium text-[#333] mb-2">Footnotes</label>

        <div className="space-y-3">
          {footnotes.map((fn, fi) => (
            <div
              key={fn.id}
              className="border border-[#E5E5E5] rounded p-3 space-y-2"
              style={{ background: '#FAFAFA' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#999] uppercase">Footnote {fi + 1}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fn.visible}
                    onChange={() => toggleFootnoteVisible(fi)}
                    className="rounded border-[#E5E5E5]"
                  />
                  <span className="text-[10px] text-[#999]">Show</span>
                </label>
              </div>
              <LanguageTabs
                field={asTF(fn.text)}
                onChange={(lang, value) => updateFootnoteText(fi, lang, value)}
                multiline
                placeholder="Footnote text"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
