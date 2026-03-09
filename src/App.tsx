import { useState, useEffect } from 'react';
import PresentationEditor from './components/editor/PresentationEditor';
import BlocksLibrary from './components/blocks/BlocksLibrary';
import { BRAND } from './lib/brand';

function getRoute(): string {
  return window.location.hash.replace('#', '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const isBlocks = route === '/blocks';

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
        {(['/', '/blocks'] as const).map((path) => {
          const label = path === '/' ? 'Editor' : 'Blocks';
          const active = path === '/' ? !isBlocks : isBlocks;
          return (
            <a
              key={path}
              href={`#${path}`}
              style={{
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? BRAND.colors.textPrimary : BRAND.colors.textMuted,
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                background: active ? BRAND.colors.background : 'transparent',
              }}
            >
              {label}
            </a>
          );
        })}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {isBlocks ? <BlocksLibrary /> : <PresentationEditor />}
      </main>
    </div>
  );
}
