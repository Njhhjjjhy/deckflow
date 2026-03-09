import { useState, useCallback } from 'react';
import type { ReusableBlock, PageType, TranslatableField, Language } from '../types/presentation';
import { getDefaultContent, PAGE_TYPE_LABELS } from '../lib/store/blocks-store';
import LanguageTabs from './language-tabs';
import { BRAND } from '../lib/brand';

interface BlockFormProps {
  block?: ReusableBlock;
  presentationNames?: Record<string, string>; // id → name for usedIn display
  onSave: (name: string, type: PageType, content: Record<string, TranslatableField | string>) => void;
  onCancel: () => void;
}

// ── Field introspection helpers ────────────────────────────────────────────────

function isTranslatableField(val: unknown): val is TranslatableField {
  return (
    typeof val === 'object' &&
    val !== null &&
    'en' in val &&
    'translationStatus' in val
  );
}

const IMAGE_KEYS = ['image', 'icon', 'photo'];
const COLOR_KEYS = ['color'];
const SKIP_KEYS = [
  'layoutMode', 'mapTextMode', 'chartMode', 'showSummaryTable', 'showLinks',
  'showFootnote', 'showSource', 'accentBarVisible', 'badgeTextColor',
  'badgeFontSize', 'arrowColor', 'arrowSize', 'gapColor', 'timelineLineColor',
  'bulletColor', 'headingColor', 'bodyColor', 'captionColor', 'circleBorderColor',
  'badgeBackgroundColor',
];

function isImageField(key: string) {
  return IMAGE_KEYS.some((p) => key.toLowerCase().includes(p));
}
function isColorField(key: string) {
  return COLOR_KEYS.some((p) => key.toLowerCase().includes(p));
}
function isJsonDataField(key: string) {
  return key.endsWith('Data');
}
function isSkippedField(key: string) {
  return SKIP_KEYS.includes(key);
}
function isMultilineField(key: string) {
  const k = key.toLowerCase();
  return (
    k.includes('body') || k.includes('text') || k.includes('paragraph') ||
    k.includes('caption') || k.includes('disclaimer')
  );
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ── BlockContentEditor (inline) ───────────────────────────────────────────────

interface ContentEditorProps {
  content: Record<string, TranslatableField | string>;
  onChange: (key: string, lang: Language | null, value: string) => void;
}

function BlockContentEditor({ content, onChange }: ContentEditorProps) {
  const entries = Object.entries(content);
  const visibleEntries = entries.filter(([key]) => {
    if (isSkippedField(key)) return false;
    if (isColorField(key)) return false;
    return true;
  });

  if (visibleEntries.length === 0) {
    return (
      <p style={{ color: BRAND.colors.textMuted, fontSize: 13 }}>
        No editable content fields for this page type.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {visibleEntries.map(([key, value]) => {
        const label = humanizeKey(key);

        if (isTranslatableField(value)) {
          return (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.colors.textSecondary, marginBottom: 6 }}>
                {label}
              </label>
              <LanguageTabs
                field={value}
                onChange={(lang, val) => onChange(key, lang, val)}
                multiline={isMultilineField(key)}
                placeholder={`Enter ${label.toLowerCase()}…`}
              />
            </div>
          );
        }

        if (isImageField(key)) {
          return (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.colors.textSecondary, marginBottom: 4 }}>
                {label}
              </label>
              <p style={{ fontSize: 12, color: BRAND.colors.textMuted, margin: 0 }}>
                Image fields are set per presentation.
              </p>
            </div>
          );
        }

        if (isJsonDataField(key)) {
          return (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.colors.textSecondary, marginBottom: 4 }}>
                {label}
                <span style={{ fontWeight: 400, color: BRAND.colors.textMuted, marginLeft: 6 }}>
                  (JSON)
                </span>
              </label>
              <textarea
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => onChange(key, null, e.target.value)}
                rows={4}
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: BRAND.colors.textPrimary,
                  background: BRAND.colors.surfaceCard,
                  border: `1px solid ${BRAND.colors.border}`,
                  borderRadius: 6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          );
        }

        // Plain string field
        return (
          <div key={key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: BRAND.colors.textSecondary, marginBottom: 6 }}>
              {label}
            </label>
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(key, null, e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 13,
                color: BRAND.colors.textPrimary,
                background: '#fff',
                border: `1px solid ${BRAND.colors.border}`,
                borderRadius: 6,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── BlockForm ─────────────────────────────────────────────────────────────────

export default function BlockForm({ block, presentationNames = {}, onSave, onCancel }: BlockFormProps) {
  const isEditing = !!block;

  const [name, setName] = useState(block?.name ?? '');
  const [type, setType] = useState<PageType>(block?.type ?? 'cover');
  const [content, setContent] = useState<Record<string, TranslatableField | string>>(
    block?.content ?? getDefaultContent('cover')
  );

  const handleTypeChange = (newType: PageType) => {
    setType(newType);
    setContent(getDefaultContent(newType));
  };

  const handleContentChange = useCallback((key: string, lang: Language | null, value: string) => {
    setContent((prev) => {
      const existing = prev[key];

      if (lang !== null && isTranslatableField(existing)) {
        const updated: TranslatableField = {
          ...existing,
          [lang]: value,
          translationStatus: {
            ...existing.translationStatus,
            ...(lang === 'en'
              ? {
                  'zh-tw': existing.translationStatus['zh-tw'] === 'reviewed' ? 'outdated' : existing.translationStatus['zh-tw'],
                  'zh-cn': existing.translationStatus['zh-cn'] === 'reviewed' ? 'outdated' : existing.translationStatus['zh-cn'],
                }
              : {
                  [lang]: value ? 'auto-translated' : 'empty',
                }),
          },
        };
        return { ...prev, [key]: updated };
      }

      return { ...prev, [key]: value };
    });
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name.trim(), type, content);
  };

  const usedInNames = (block?.usedIn ?? []).map(
    (id) => presentationNames[id] ?? `Presentation ${id.slice(0, 8)}`
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    color: BRAND.colors.textPrimary,
    background: '#fff',
    border: `1px solid ${BRAND.colors.border}`,
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: BRAND.colors.textSecondary,
    marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: BRAND.colors.textPrimary }}>
            {isEditing ? 'Edit block' : 'New block'}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 400,
                color: BRAND.colors.textSecondary,
                background: BRAND.colors.surfaceCard,
                border: `1px solid ${BRAND.colors.border}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                background: name.trim() ? BRAND.colors.accent : BRAND.colors.border,
                border: 'none',
                borderRadius: 6,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {isEditing ? 'Save changes' : 'Create block'}
            </button>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Block name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Company contact info"
            autoFocus
            style={inputStyle}
          />
        </div>

        {/* Page type */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Page type</label>
          {isEditing ? (
            <div
              style={{
                padding: '8px 10px',
                fontSize: 13,
                color: BRAND.colors.textSecondary,
                background: BRAND.colors.surfaceCard,
                border: `1px solid ${BRAND.colors.border}`,
                borderRadius: 6,
              }}
            >
              {PAGE_TYPE_LABELS[type]}
              <span style={{ fontSize: 11, color: BRAND.colors.textMuted, marginLeft: 8 }}>
                (type cannot be changed after creation)
              </span>
            </div>
          ) : (
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as PageType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {(Object.entries(PAGE_TYPE_LABELS) as [PageType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${BRAND.colors.border}`, marginBottom: 24 }} />

        {/* Content fields */}
        <div style={{ marginBottom: 8 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 13, fontWeight: 600, color: BRAND.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Content
          </h3>
          <BlockContentEditor content={content} onChange={handleContentChange} />
        </div>
      </div>

      {/* Used-in panel (edit mode only) */}
      {isEditing && (
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            borderLeft: `1px solid ${BRAND.colors.border}`,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, color: BRAND.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Used in
          </h3>
          {usedInNames.length === 0 ? (
            <p style={{ fontSize: 12, color: BRAND.colors.textMuted, margin: 0 }}>
              Not used in any presentations yet.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {usedInNames.map((n, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12,
                    color: BRAND.colors.textPrimary,
                    padding: '6px 10px',
                    background: BRAND.colors.surfaceCard,
                    borderRadius: 6,
                    border: `1px solid ${BRAND.colors.border}`,
                  }}
                >
                  {n}
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}
