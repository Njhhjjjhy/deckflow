import './cover-page.css';

interface CoverPageContent {
  headline: string;
  heroImage?: string;
  year?: string;
}

interface CoverPageProps {
  content: CoverPageContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

/**
 * Parses a string with **bold** markdown into React nodes.
 * Only supports double-asterisk bold — no other formatting.
 */
function parseHeadline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function CoverPage({ content, language = 'en' }: CoverPageProps) {
  const year = content.year || new Date().getFullYear().toString();

  // Pick font family based on language
  const headlineFont =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  return (
    <div className="cover-page">
      {/* Header bar */}
      <div className="cover-page__header">
        {/* Logo placeholder */}
        <div className="cover-page__logo">
          <div className="cover-page__logo-icon">M</div>
          MoreHarvest
        </div>

        {/* Year */}
        <div className="cover-page__year">{year}</div>
      </div>

      {/* Headline */}
      <h1
        className="cover-page__headline"
        style={{ fontFamily: headlineFont }}
      >
        {parseHeadline(content.headline)}
      </h1>

      {/* Hero image */}
      <div
        className={`cover-page__hero${!content.heroImage ? ' cover-page__hero--placeholder' : ''}`}
      >
        {content.heroImage && (
          <img src={content.heroImage} alt="Hero" />
        )}
      </div>
    </div>
  );
}
