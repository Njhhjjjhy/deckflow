import { useState, useEffect, useCallback, useRef } from 'react';
import type { Page, Language } from '../../types/presentation';
import { usePresentationStore } from '../../lib/store/presentationStore';
import LanguageTabs from './LanguageTabs';

const MAX_COLUMNS = 8;
const MIN_COLUMNS = 1;
const MAX_FOOTNOTES = 5;

interface ColumnData {
  label: Record<string, string>;
  widthPercent: number;
}

interface CellData {
  value: Record<string, string>;
  highlighted: boolean;
}

interface RowData {
  cells: CellData[];
  highlighted: boolean;
}

function createEmptyLang(): Record<string, string> {
  return { en: '', 'zh-tw': '', 'zh-cn': '' };
}

function asTranslatableField(rec: Record<string, string>) {
  return {
    en: rec.en || '',
    'zh-tw': rec['zh-tw'] || '',
    'zh-cn': rec['zh-cn'] || '',
    translationStatus: {
      'zh-tw': 'empty' as const,
      'zh-cn': 'empty' as const,
    },
  };
}

interface DataTableEditorProps {
  page: Page;
}

export default function DataTableEditor({ page }: DataTableEditorProps) {
  const updateTranslatableField = usePresentationStore((s) => s.updateTranslatableField);
  const updateStringField = usePresentationStore((s) => s.updateStringField);

  const sectionLabel = page.content.sectionLabel as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const heading = page.content.heading as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const subtitle = page.content.subtitle as { en: string; 'zh-tw': string; 'zh-cn': string; translationStatus: Record<string, string> };
  const year = (page.content.year as string) || '';
  const pageNumber = (page.content.pageNumber as string) || '';
  const columnsDataRaw = (page.content.columnsData as string) || '[]';
  const rowsDataRaw = (page.content.rowsData as string) || '[]';
  const footnotesDataRaw = (page.content.footnotesData as string) || '[]';

  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [footnotes, setFootnotes] = useState<Record<string, string>[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [draggedRowIdx, setDraggedRowIdx] = useState<number | null>(null);
  const [dragOverRowIdx, setDragOverRowIdx] = useState<number | null>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    try { setColumns(JSON.parse(columnsDataRaw)); } catch { setColumns([]); }
  }, []); // Only on mount

  useEffect(() => {
    try { setRows(JSON.parse(rowsDataRaw)); } catch { setRows([]); }
  }, []);

  useEffect(() => {
    try { setFootnotes(JSON.parse(footnotesDataRaw)); } catch { setFootnotes([]); }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const syncColumns = useCallback(
    (updated: ColumnData[]) => {
      setColumns(updated);
      updateStringField(page.id, 'columnsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncRows = useCallback(
    (updated: RowData[]) => {
      setRows(updated);
      updateStringField(page.id, 'rowsData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  const syncFootnotes = useCallback(
    (updated: Record<string, string>[]) => {
      setFootnotes(updated);
      updateStringField(page.id, 'footnotesData', JSON.stringify(updated));
    },
    [page.id, updateStringField]
  );

  // Column operations
  const addColumn = useCallback(() => {
    if (columns.length >= MAX_COLUMNS) return;
    const newCol: ColumnData = { label: createEmptyLang(), widthPercent: 0 };
    const updated = [...columns, newCol];
    syncColumns(updated);
    // Add empty cell to each row
    const updatedRows = rows.map((row) => ({
      ...row,
      cells: [...row.cells, { value: createEmptyLang(), highlighted: false }],
    }));
    syncRows(updatedRows);
  }, [columns, rows, syncColumns, syncRows]);

  const removeColumn = useCallback(
    (idx: number) => {
      if (columns.length <= MIN_COLUMNS) return;
      syncColumns(columns.filter((_, i) => i !== idx));
      const updatedRows = rows.map((row) => ({
        ...row,
        cells: row.cells.filter((_, i) => i !== idx),
      }));
      syncRows(updatedRows);
    },
    [columns, rows, syncColumns, syncRows]
  );

  const moveColumn = useCallback(
    (idx: number, direction: 'left' | 'right') => {
      const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= columns.length) return;
      const updated = [...columns];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncColumns(updated);
      const updatedRows = rows.map((row) => {
        const cells = [...row.cells];
        [cells[idx], cells[swapIdx]] = [cells[swapIdx], cells[idx]];
        return { ...row, cells };
      });
      syncRows(updatedRows);
    },
    [columns, rows, syncColumns, syncRows]
  );

  const updateColumnLabel = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = [...columns];
      updated[idx] = { ...updated[idx], label: { ...updated[idx].label, [lang]: value } };
      syncColumns(updated);
    },
    [columns, syncColumns]
  );

  const updateColumnWidth = useCallback(
    (idx: number, value: string) => {
      const updated = [...columns];
      updated[idx] = { ...updated[idx], widthPercent: parseFloat(value) || 0 };
      syncColumns(updated);
    },
    [columns, syncColumns]
  );

  // Row operations
  const addRow = useCallback(() => {
    const newRow: RowData = {
      cells: columns.map(() => ({ value: createEmptyLang(), highlighted: false })),
      highlighted: false,
    };
    syncRows([...rows, newRow]);
  }, [columns, rows, syncRows]);

  const removeRow = useCallback(
    (idx: number) => {
      syncRows(rows.filter((_, i) => i !== idx));
    },
    [rows, syncRows]
  );

  const moveRow = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx || toIdx < 0 || toIdx >= rows.length) return;
      const updated = [...rows];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      syncRows(updated);
    },
    [rows, syncRows]
  );

  const toggleRowHighlight = useCallback(
    (idx: number) => {
      const updated = [...rows];
      updated[idx] = { ...updated[idx], highlighted: !updated[idx].highlighted };
      syncRows(updated);
    },
    [rows, syncRows]
  );

  const toggleCellHighlight = useCallback(
    (rowIdx: number, colIdx: number) => {
      const updated = [...rows];
      const cells = [...updated[rowIdx].cells];
      cells[colIdx] = { ...cells[colIdx], highlighted: !cells[colIdx].highlighted };
      updated[rowIdx] = { ...updated[rowIdx], cells };
      syncRows(updated);
    },
    [rows, syncRows]
  );

  const updateCellValue = useCallback(
    (rowIdx: number, colIdx: number, lang: Language, value: string) => {
      const updated = [...rows];
      const cells = [...updated[rowIdx].cells];
      cells[colIdx] = { ...cells[colIdx], value: { ...cells[colIdx].value, [lang]: value } };
      updated[rowIdx] = { ...updated[rowIdx], cells };
      syncRows(updated);
    },
    [rows, syncRows]
  );

  // Paste from Excel
  const handlePaste = useCallback(() => {
    const lines = pasteText.trim().split('\n');
    const parsed = lines.map((line) => line.split('\t'));
    const expectedCols = columns.length;

    const mismatch = parsed.find((row) => row.length !== expectedCols);
    if (mismatch) {
      setToast({
        message: `Column mismatch: pasted data has ${mismatch.length} columns, but ${expectedCols} are defined.`,
        type: 'error',
      });
      return;
    }

    const newRows: RowData[] = parsed.map((cells) => ({
      cells: cells.map((val) => ({
        value: { en: val.trim(), 'zh-tw': '', 'zh-cn': '' },
        highlighted: false,
      })),
      highlighted: false,
    }));

    syncRows(newRows);
    setShowPasteModal(false);
    setPasteText('');
    setToast({ message: `${newRows.length} rows imported successfully.`, type: 'success' });
  }, [pasteText, columns.length, syncRows]);

  // Footnote operations
  const addFootnote = useCallback(() => {
    if (footnotes.length >= MAX_FOOTNOTES) return;
    syncFootnotes([...footnotes, createEmptyLang()]);
  }, [footnotes, syncFootnotes]);

  const removeFootnote = useCallback(
    (idx: number) => {
      syncFootnotes(footnotes.filter((_, i) => i !== idx));
    },
    [footnotes, syncFootnotes]
  );

  const moveFootnote = useCallback(
    (idx: number, direction: 'up' | 'down') => {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= footnotes.length) return;
      const updated = [...footnotes];
      [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
      syncFootnotes(updated);
    },
    [footnotes, syncFootnotes]
  );

  const updateFootnote = useCallback(
    (idx: number, lang: Language, value: string) => {
      const updated = [...footnotes];
      updated[idx] = { ...updated[idx], [lang]: value };
      syncFootnotes(updated);
    },
    [footnotes, syncFootnotes]
  );

  const widthTotal = columns.reduce((s, c) => s + c.widthPercent, 0);

  // Active language tab for the grid (to show one language at a time in the grid)
  const [gridLang, setGridLang] = useState<Language>('en');

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
        Data Table
      </h2>

      {/* Toast */}
      {toast && (
        <div
          className="px-3 py-2 rounded text-xs"
          style={{
            background: toast.type === 'success' ? '#D4EDDA' : '#F8D7DA',
            color: toast.type === 'success' ? '#155724' : '#721C24',
            border: `1px solid ${toast.type === 'success' ? '#C3E6CB' : '#F5C6CB'}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Section label */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Section Label</label>
        <LanguageTabs
          field={sectionLabel as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'sectionLabel', lang, value)}
          placeholder="e.g. 03 | Market Data"
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

      {/* Heading */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Heading</label>
        <LanguageTabs
          field={heading as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'heading', lang, value)}
          placeholder="e.g. Overall Overview — Regional Cities"
        />
      </fieldset>

      {/* Subtitle */}
      <fieldset>
        <label className="block text-xs font-medium text-[#333] mb-1">Subtitle</label>
        <LanguageTabs
          field={subtitle as any}
          onChange={(lang, value) => updateTranslatableField(page.id, 'subtitle', lang, value)}
          placeholder="e.g. Current Rental Price Index"
        />
      </fieldset>

      <hr className="border-[#E5E5E5]" />

      {/* Columns editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Columns ({columns.length}/{MAX_COLUMNS})
          </label>
          <button
            onClick={addColumn}
            disabled={columns.length >= MAX_COLUMNS}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Column
          </button>
        </div>

        {/* Width total warning */}
        <div className="mb-2 text-[10px]" style={{ color: widthTotal === 100 ? '#155724' : '#856404' }}>
          Width total: {widthTotal.toFixed(1)}%{widthTotal !== 100 && ' — should sum to 100%'}
        </div>

        <div className="space-y-2">
          {columns.map((col, ci) => (
            <div key={ci} className="rounded border border-[#E5E5E5] p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#999]">Column {ci + 1}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveColumn(ci, 'left')}
                    disabled={ci === 0}
                    className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move left"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => moveColumn(ci, 'right')}
                    disabled={ci === columns.length - 1}
                    className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                    style={{ color: '#333' }}
                    title="Move right"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => removeColumn(ci)}
                    disabled={columns.length <= MIN_COLUMNS}
                    className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100 disabled:opacity-25"
                    style={{ color: '#999' }}
                    title="Remove column"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <LanguageTabs
                field={asTranslatableField(col.label)}
                onChange={(lang, value) => updateColumnLabel(ci, lang, value)}
                placeholder="Column header"
              />
              <div className="mt-1 flex items-center gap-1">
                <label className="text-[10px] text-[#999]">Width %</label>
                <input
                  type="number"
                  value={col.widthPercent}
                  onChange={(e) => updateColumnWidth(ci, e.target.value)}
                  min={0}
                  max={100}
                  step={0.25}
                  className="w-20 px-2 py-1 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931]"
                  style={{ color: '#1A1A1A' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E5E5E5]" />

      {/* Table data grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Table Data ({rows.length} rows)
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-2 py-1 text-[10px] rounded border border-[#E5E5E5] hover:border-[#FBB931] transition-colors"
              style={{ color: '#333' }}
            >
              Paste from Excel
            </button>
            <button
              onClick={addRow}
              className="px-2 py-1 text-xs rounded transition-colors"
              style={{ background: '#FBB931', color: '#1A1A1A' }}
            >
              + Add Row
            </button>
          </div>
        </div>

        {/* Grid language toggle */}
        <div className="flex gap-1 mb-2">
          {(['en', 'zh-tw', 'zh-cn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setGridLang(lang)}
              className="px-2 py-0.5 text-[10px] rounded transition-colors"
              style={{
                background: gridLang === lang ? '#FBB931' : 'transparent',
                color: '#1A1A1A',
                fontWeight: gridLang === lang ? 600 : 400,
                border: '1px solid',
                borderColor: gridLang === lang ? '#FBB931' : '#E5E5E5',
              }}
            >
              {lang === 'en' ? 'EN' : lang === 'zh-tw' ? 'zh-TW' : 'zh-CN'}
            </button>
          ))}
        </div>

        {/* Column headers row */}
        {columns.length > 0 && (
          <div className="mb-1 flex items-center gap-0.5" style={{ paddingLeft: 20 }}>
            {columns.map((col, ci) => (
              <span
                key={ci}
                className="text-[9px] text-[#999] truncate text-center"
                style={{ flex: col.widthPercent || 1, minWidth: 0 }}
              >
                {col.label[gridLang] || col.label.en || `Col ${ci + 1}`}
              </span>
            ))}
            <span className="w-[72px] flex-shrink-0" />
          </div>
        )}

        {/* Data rows */}
        <div className="space-y-0.5">
          {rows.map((row, ri) => (
            <div
              key={ri}
              draggable
              onDragStart={() => setDraggedRowIdx(ri)}
              onDragEnter={() => {
                dragCounter.current++;
                setDragOverRowIdx(ri);
              }}
              onDragLeave={() => {
                dragCounter.current--;
                if (dragCounter.current === 0) setDragOverRowIdx(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                dragCounter.current = 0;
                if (draggedRowIdx !== null && draggedRowIdx !== ri) {
                  moveRow(draggedRowIdx, ri);
                }
                setDraggedRowIdx(null);
                setDragOverRowIdx(null);
              }}
              onDragEnd={() => {
                dragCounter.current = 0;
                setDraggedRowIdx(null);
                setDragOverRowIdx(null);
              }}
              className="flex items-center gap-0.5 rounded"
              style={{
                opacity: draggedRowIdx === ri ? 0.4 : 1,
                borderTop: dragOverRowIdx === ri && draggedRowIdx !== ri ? '2px solid #FBB931' : '2px solid transparent',
                background: row.highlighted ? '#FDF3D011' : 'transparent',
                cursor: draggedRowIdx === ri ? 'grabbing' : 'grab',
              }}
            >
              {/* Row number / drag handle */}
              <span
                className="w-5 flex-shrink-0 text-[9px] text-center select-none"
                style={{ color: '#999' }}
              >
                {ri + 1}
              </span>

              {/* Cells */}
              {row.cells.map((cell, ci) => (
                <div
                  key={ci}
                  className="relative"
                  style={{ flex: columns[ci]?.widthPercent || 1, minWidth: 0 }}
                >
                  <input
                    type="text"
                    value={cell.value[gridLang] || ''}
                    onChange={(e) => updateCellValue(ri, ci, gridLang, e.target.value)}
                    className="w-full px-1.5 py-1 text-[11px] rounded border focus:outline-none focus:border-[#FBB931]"
                    style={{
                      color: '#1A1A1A',
                      background: cell.highlighted ? '#FDF3D0' : '#fff',
                      borderColor: cell.highlighted ? '#FBB931' : '#E5E5E5',
                      fontWeight: cell.highlighted || row.highlighted ? 700 : 400,
                    }}
                  />
                  {/* Cell highlight toggle */}
                  <button
                    onClick={() => toggleCellHighlight(ri, ci)}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-[7px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{
                      background: cell.highlighted ? '#FBB931' : '#E5E5E5',
                      color: cell.highlighted ? '#1A1A1A' : '#999',
                    }}
                    title={cell.highlighted ? 'Remove cell highlight' : 'Highlight cell'}
                  >
                    ★
                  </button>
                </div>
              ))}

              {/* Row actions */}
              <div className="flex items-center gap-0.5 w-[72px] flex-shrink-0 justify-end">
                <button
                  onClick={() => toggleRowHighlight(ri)}
                  className="w-5 h-5 flex items-center justify-center text-[8px] rounded transition-colors"
                  style={{
                    background: row.highlighted ? '#FBB931' : 'transparent',
                    color: row.highlighted ? '#1A1A1A' : '#999',
                    border: '1px solid',
                    borderColor: row.highlighted ? '#FBB931' : '#E5E5E5',
                  }}
                  title={row.highlighted ? 'Remove row highlight' : 'Highlight row'}
                >
                  B
                </button>
                <button
                  onClick={() => removeRow(ri)}
                  className="w-5 h-5 flex items-center justify-center text-[8px] rounded hover:bg-red-100"
                  style={{ color: '#999' }}
                  title="Delete row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="text-[10px] text-[#999] py-2 text-center">No rows yet. Add a row or paste from Excel.</p>
        )}
      </div>

      {/* Paste from Excel modal */}
      {showPasteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setShowPasteModal(false)}
        >
          <div
            className="rounded-lg shadow-lg p-4 w-80"
            style={{ background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Paste from Excel</h3>
            <p className="text-[11px] text-[#666] mb-2">
              Copy your table cells from Excel (excluding headers) and paste here.
              Expecting {columns.length} columns per row.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full h-32 px-2 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#FBB931] focus:ring-1 focus:ring-[#FBB931] resize-none"
              style={{ color: '#1A1A1A', fontFamily: 'monospace' }}
              placeholder="Paste tab-separated data here..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setShowPasteModal(false); setPasteText(''); }}
                className="px-3 py-1.5 text-xs rounded border border-[#E5E5E5] transition-colors hover:bg-[#F2F2F2]"
                style={{ color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                className="px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-30"
                style={{ background: '#FBB931', color: '#1A1A1A' }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="border-[#E5E5E5]" />

      {/* Footnotes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[#333]">
            Footnotes ({footnotes.length}/{MAX_FOOTNOTES})
          </label>
          <button
            onClick={addFootnote}
            disabled={footnotes.length >= MAX_FOOTNOTES}
            className="px-2 py-1 text-xs rounded transition-colors disabled:opacity-30"
            style={{ background: '#FBB931', color: '#1A1A1A' }}
          >
            + Add Footnote
          </button>
        </div>
        <div className="space-y-2">
          {footnotes.map((fn, fi) => (
            <div key={fi} className="flex gap-1">
              <div className="flex-1">
                <LanguageTabs
                  field={asTranslatableField(fn)}
                  onChange={(lang, value) => updateFootnote(fi, lang, value)}
                  multiline
                  placeholder={`Footnote ${fi + 1}`}
                />
              </div>
              <div className="flex flex-col gap-0.5 pt-5">
                <button
                  onClick={() => moveFootnote(fi, 'up')}
                  disabled={fi === 0}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveFootnote(fi, 'down')}
                  disabled={fi === footnotes.length - 1}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-[#E5E5E5] disabled:opacity-25"
                  style={{ color: '#333' }}
                >
                  ▼
                </button>
                <button
                  onClick={() => removeFootnote(fi)}
                  className="w-4 h-4 flex items-center justify-center text-[8px] rounded hover:bg-red-100"
                  style={{ color: '#999' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
