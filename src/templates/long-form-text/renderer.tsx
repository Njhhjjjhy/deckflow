import './styles.css';

interface LongFormTextContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading?: string;
  col1Body?: string;
  col2Body?: string;
  closingStatement?: string;
}

interface LongFormTextProps {
  content: LongFormTextContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

function renderRichText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function LongFormTextPage({ content, language = 'en' }: LongFormTextProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';

  const headingFont =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  const bodyFont =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  return (
    <div className="slide-page long-form-text-page">
      {/* Wordmark */}
      <img
        className="slide-wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="slide-year" style={{ fontFamily: bodyFont }}>{year}</div>

      {/* Section label */}
      <p className="slide-label" style={{ fontFamily: bodyFont }}>{label}</p>

      {/* Horizontal rule */}
      <hr className="slide-rule" />

      {/* Page heading */}
      {content.heading && (
        <p className="long-form-text-page__heading" style={{ fontFamily: headingFont }}>
          {renderRichText(content.heading)}
        </p>
      )}

      {/* Left column */}
      <p className="long-form-text-page__col1" style={{ fontFamily: bodyFont }}>
        {content.col1Body ? renderRichText(content.col1Body) : null}
      </p>

      {/* Right column */}
      <p className="long-form-text-page__col2" style={{ fontFamily: bodyFont }}>
        {content.col2Body ? renderRichText(content.col2Body) : null}
      </p>

      {/* Closing statement */}
      {content.closingStatement && (
        <p className="long-form-text-page__closing" style={{ fontFamily: headingFont }}>
          {renderRichText(content.closingStatement)}
        </p>
      )}

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="slide-page-number" style={{ fontFamily: bodyFont }}>
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
