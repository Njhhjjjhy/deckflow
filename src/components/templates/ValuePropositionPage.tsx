import './value-proposition-page.css';

interface ValuePropositionContent {
  badge1Label: string;
  badge2Label: string;
  badge3Label: string;
  bodyText: string;
  badge1Icon?: string;
  badge2Icon?: string;
  badge3Icon?: string;
  accentBarVisible?: boolean;
  accentBarColor?: string;
}

interface ValuePropositionPageProps {
  content: ValuePropositionContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const CheckmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12l5 5L19 7"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ValuePropositionPage({ content, language = 'en' }: ValuePropositionPageProps) {
  const accentBarVisible = content.accentBarVisible !== false;
  const accentBarColor = content.accentBarColor || '#FBB931';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  const badges = [
    { label: content.badge1Label, icon: content.badge1Icon },
    { label: content.badge2Label, icon: content.badge2Icon },
    { label: content.badge3Label, icon: content.badge3Icon },
  ];

  const getLabelFontSize = (label: string) => {
    if (label.length > 15) return 20;
    return 26;
  };

  // Estimate lines: ~80 chars per line at 18px within 864px
  const getBodyFontSize = (text: string) => {
    const lines = text.split('\n');
    let totalLines = 0;
    for (const line of lines) {
      totalLines += Math.max(1, Math.ceil(line.length / 80));
    }
    if (totalLines > 5) return 14;
    if (totalLines > 3) return 15;
    return 18;
  };

  return (
    <div className="value-proposition-page">
      {/* Gold accent bar */}
      {accentBarVisible && (
        <div
          className="value-proposition-page__accent-bar"
          style={{ backgroundColor: accentBarColor }}
        />
      )}

      {/* Badges row */}
      <div className="value-proposition-page__badges">
        {badges.map((badge, i) => (
          <div key={i} className="value-proposition-page__badge-group">
            <div
              className="value-proposition-page__badge"
              style={{ backgroundColor: '#FBB931' }}
            >
              {badge.icon ? (
                <img
                  src={badge.icon}
                  alt=""
                  className="value-proposition-page__badge-icon"
                />
              ) : (
                <CheckmarkIcon />
              )}
            </div>
            <span
              className="value-proposition-page__badge-label"
              style={{
                fontFamily,
                fontSize: getLabelFontSize(badge.label),
              }}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* Body paragraph */}
      <p
        className="value-proposition-page__body"
        style={{
          fontFamily,
          fontSize: getBodyFontSize(content.bodyText),
        }}
      >
        {parseBold(content.bodyText)}
      </p>
    </div>
  );
}
