import { useState, useEffect } from 'react';
import PresentationEditor from './components/editor/PresentationEditor';
import BlocksLibrary from './components/blocks/BlocksLibrary';
import { BRAND } from './lib/brand';
import { usePresentationStore } from './lib/store/presentationStore';

function getRoute(): string {
  return window.location.hash.replace('#', '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const needsReExport = usePresentationStore((s) => s.presentation.needsReExport);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const isBlocks = route.startsWith('/blocks');
  const blockEditId = route.startsWith('/blocks/') ? route.slice('/blocks/'.length) : undefined;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: BRAND.colors.background }}>
      {/* Top nav */}
      <header
        style={{
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          paddingInline: 16,
          gap: 4,
          background: BRAND.colors.surface,
          borderBottom: `1px solid ${BRAND.colors.border}`,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.colors.textPrimary, marginRight: 16 }}>
          Deckflow
        </span>

        {/* Editor nav item with re-export badge */}
        <a
          href="#/"
          style={{
            fontSize: 13,
            fontWeight: !isBlocks ? 600 : 400,
            color: !isBlocks ? BRAND.colors.textPrimary : BRAND.colors.textMuted,
            textDecoration: 'none',
            padding: '4px 10px',
            borderRadius: 6,
            background: !isBlocks ? BRAND.colors.background : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Editor
          {needsReExport && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#1A1A1A',
                background: BRAND.colors.accent,
                padding: '1px 6px',
                borderRadius: 10,
                letterSpacing: '0.03em',
              }}
            >
              re-export needed
            </span>
          )}
        </a>

        <a
          href="#/blocks"
          style={{
            fontSize: 13,
            fontWeight: isBlocks ? 600 : 400,
            color: isBlocks ? BRAND.colors.textPrimary : BRAND.colors.textMuted,
            textDecoration: 'none',
            padding: '4px 10px',
            borderRadius: 6,
            background: isBlocks ? BRAND.colors.background : 'transparent',
          }}
        >
          Blocks
        </a>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {isBlocks
          ? <BlocksLibrary editBlockId={blockEditId} />
          : <PresentationEditor />
        }
      </main>
    </div>
  );
}
