import PresentationEditor from './components/presentation-editor';
import { BRAND } from './lib/brand';

export default function App() {
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
        <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.colors.textPrimary }}>
          Deckflow
        </span>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <PresentationEditor />
      </main>
    </div>
  );
}
