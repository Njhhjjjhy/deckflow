import { useState } from 'react';
import { useBlocksStore, PAGE_TYPE_LABELS } from '../../lib/store/blocksStore';
import type { ReusableBlock, PageType, TranslatableField } from '../../types/presentation';
import BlockForm from './BlockForm';
import { BRAND } from '../../lib/brand';

type View = 'list' | 'create' | { edit: string };

// ── Delete confirmation dialog ─────────────────────────────────────────────────

interface DeleteDialogProps {
  block: ReusableBlock;
  presentationNames: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ block, presentationNames, onConfirm, onCancel }: DeleteDialogProps) {
  const affectedNames = block.usedIn.map(
    (id) => presentationNames[id] ?? `Presentation ${id.slice(0, 8)}`
  );
  const hasAffected = affectedNames.length > 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          border: `1px solid ${BRAND.colors.border}`,
          borderRadius: 12,
          padding: 28,
          width: 420,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 600, color: BRAND.colors.textPrimary }}>
          Delete "{block.name}"?
        </h2>

        {hasAffected ? (
          <>
            <p style={{ margin: '0 0 12px 0', fontSize: 13, color: BRAND.colors.textSecondary }}>
              This block is used in {affectedNames.length} presentation{affectedNames.length !== 1 ? 's' : ''}. Deleting it will remove the block reference from:
            </p>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: 20 }}>
              {affectedNames.map((n, i) => (
                <li key={i} style={{ fontSize: 13, color: BRAND.colors.error, fontWeight: 600, marginBottom: 4 }}>
                  {n}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p style={{ margin: '0 0 16px 0', fontSize: 13, color: BRAND.colors.textSecondary }}>
            This action cannot be undone.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 16px',
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
            onClick={onConfirm}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              background: BRAND.colors.error,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {hasAffected ? 'Delete anyway' : 'Delete block'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, gap: 16, padding: 48,
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: BRAND.colors.surfaceCard,
          border: `2px dashed ${BRAND.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" stroke={BRAND.colors.textMuted} strokeWidth="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="2" stroke={BRAND.colors.textMuted} strokeWidth="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="2" stroke={BRAND.colors.textMuted} strokeWidth="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="2" stroke={BRAND.colors.textMuted} strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: BRAND.colors.textPrimary }}>
          No reusable blocks yet
        </p>
        <p style={{ margin: 0, fontSize: 13, color: BRAND.colors.textMuted, maxWidth: 320 }}>
          Create blocks to share content across multiple presentations. Edit once, reuse everywhere.
        </p>
      </div>
      <button
        onClick={onCreate}
        style={{
          padding: '8px 20px',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          background: BRAND.colors.accent,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Create first block
      </button>
    </div>
  );
}

// ── Block list row ─────────────────────────────────────────────────────────────

interface BlockRowProps {
  block: ReusableBlock;
  isFirst: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function BlockRow({ block, isFirst, onEdit, onDelete }: BlockRowProps) {
  const [hover, setHover] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? BRAND.colors.surfaceCard : 'transparent',
        cursor: 'default',
        borderTop: isFirst ? 'none' : `1px solid ${BRAND.colors.border}`,
      }}
    >
      <td
        style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: BRAND.colors.textPrimary, cursor: 'pointer' }}
        onClick={onEdit}
      >
        {block.name}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: BRAND.colors.textSecondary }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: BRAND.colors.surfaceCard,
            border: `1px solid ${BRAND.colors.border}`,
            borderRadius: 4,
            fontSize: 11,
            color: BRAND.colors.textSecondary,
          }}
        >
          {PAGE_TYPE_LABELS[block.type]}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: BRAND.colors.textMuted }}>
        {block.usedIn.length === 0
          ? 'Not used'
          : `${block.usedIn.length} presentation${block.usedIn.length !== 1 ? 's' : ''}`}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: BRAND.colors.textSecondary,
              background: BRAND.colors.background,
              border: `1px solid ${BRAND.colors.border}`,
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: BRAND.colors.error,
              background: BRAND.colors.background,
              border: `1px solid ${BRAND.colors.border}`,
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── BlocksLibrary (main view) ──────────────────────────────────────────────────

export default function BlocksLibrary() {
  const { blocks, createBlock, updateBlock, deleteBlock } = useBlocksStore();
  const [view, setView] = useState<View>('list');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // For now there's only one presentation — future multi-presentation support will populate this
  const presentationNames: Record<string, string> = {};

  const editingBlock =
    view !== 'list' && view !== 'create'
      ? blocks.find((b) => b.id === (view as { edit: string }).edit)
      : undefined;

  const handleSave = (name: string, type: PageType, content: Record<string, TranslatableField | string>) => {
    if (view === 'create') {
      const block = createBlock(name, type);
      updateBlock(block.id, name, content);
    } else if (view !== 'list' && editingBlock) {
      updateBlock(editingBlock.id, name, content);
    }
    setView('list');
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteBlock(deleteTarget);
      setDeleteTarget(null);
      if (view !== 'list' && view !== 'create' && (view as { edit: string }).edit === deleteTarget) {
        setView('list');
      }
    }
  };

  const blockToDelete = deleteTarget ? blocks.find((b) => b.id === deleteTarget) : null;

  // Form view
  if (view !== 'list') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: BRAND.colors.background }}>
        <BlockForm
          block={editingBlock}
          presentationNames={presentationNames}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
        {blockToDelete && (
          <DeleteDialog
            block={blockToDelete}
            presentationNames={presentationNames}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    );
  }

  // List view
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: BRAND.colors.background }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `1px solid ${BRAND.colors.border}`,
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: BRAND.colors.textPrimary }}>
            Reusable Blocks
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: 12, color: BRAND.colors.textMuted }}>
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setView('create')}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: BRAND.colors.accent,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          + Add block
        </button>
      </div>

      {/* Content */}
      {blocks.length === 0 ? (
        <EmptyState onCreate={() => setView('create')} />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              border: `1px solid ${BRAND.colors.border}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr style={{ background: BRAND.colors.surfaceCard }}>
                {['Block name', 'Page type', 'Used in', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: h === '' ? 'right' : 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: BRAND.colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: `1px solid ${BRAND.colors.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, i) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  isFirst={i === 0}
                  onEdit={() => setView({ edit: block.id })}
                  onDelete={() => setDeleteTarget(block.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete dialog */}
      {blockToDelete && (
        <DeleteDialog
          block={blockToDelete}
          presentationNames={presentationNames}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
