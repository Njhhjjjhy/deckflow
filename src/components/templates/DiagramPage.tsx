import './diagram-page.css';

interface DiagramBranch {
  heading: string;
  body: string;
}

interface DiagramPageContent {
  logoImage?: string;
  branches: DiagramBranch[];
}

interface DiagramPageProps {
  content: DiagramPageContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Logo circle center and branch node positions for SVG lines
const LOGO_CX = 170; // 90 + 160/2
const LOGO_CY = 270; // 190 + 160/2
const LOGO_R = 80;   // 160/2

// Branch node centers (gold dots): x=372+8=380 for center, y offsets
const BRANCH_POSITIONS = [
  { x: 380, y: 90 },  // branch 1: top=82, node top=88, center=96 → adjusted to 90
  { x: 380, y: 240 }, // branch 2: top=232, node top=238, center=246 → adjusted to 240
  { x: 380, y: 390 }, // branch 3: top=382, node top=388, center=396 → adjusted to 390
];

export default function DiagramPage({ content, language = 'en' }: DiagramPageProps) {
  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  // Only render branches that have at least a heading
  const activeBranches = content.branches.filter((b) => b.heading.trim());

  return (
    <div className="diagram-page">
      {/* Circular logo */}
      <div
        className={`diagram-page__logo${!content.logoImage ? ' diagram-page__logo--placeholder' : ''}`}
      >
        {content.logoImage && (
          <img src={content.logoImage} alt="Logo" />
        )}
      </div>

      {/* SVG connecting lines */}
      <svg className="diagram-page__lines" viewBox="0 0 960 540">
        {activeBranches.map((_, i) => {
          if (i >= BRANCH_POSITIONS.length) return null;
          const bp = BRANCH_POSITIONS[i];
          // Calculate point on logo circle edge toward branch node
          const dx = bp.x - LOGO_CX;
          const dy = bp.y - LOGO_CY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const startX = LOGO_CX + (dx / dist) * LOGO_R;
          const startY = LOGO_CY + (dy / dist) * LOGO_R;
          return (
            <line
              key={i}
              x1={startX}
              y1={startY}
              x2={bp.x}
              y2={bp.y}
              stroke="#E5E5E5"
              strokeWidth={2}
            />
          );
        })}
      </svg>

      {/* Branch points */}
      {content.branches.map((branch, i) => {
        if (i >= 3 || !branch.heading.trim()) return null;
        return (
          <div key={i} className={`diagram-page__branch diagram-page__branch--${i + 1}`}>
            <div className="diagram-page__node" />
            <h3 className="diagram-page__heading" style={{ fontFamily }}>
              {branch.heading}
            </h3>
            {branch.body && (
              <p className="diagram-page__body" style={{ fontFamily }}>
                {parseBold(branch.body)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
