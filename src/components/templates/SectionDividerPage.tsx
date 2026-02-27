import './section-divider.css';

interface SectionDividerContent {
  sectionLabel: string;
  sectionNumber: string;
  sectionTitle: string;
}

interface SectionDividerProps {
  content: SectionDividerContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function SectionDividerPage({ content, language = 'en' }: SectionDividerProps) {
  const titleFont =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  const labelFont =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  return (
    <div className="section-divider">
      {/* Left block: label + number */}
      <div className="section-divider__left">
        <p className="section-divider__label" style={{ fontFamily: labelFont }}>
          {content.sectionLabel}
        </p>
        <p className="section-divider__number" style={{ fontFamily: labelFont }}>
          {content.sectionNumber}
        </p>
      </div>

      {/* Gold vertical bar */}
      <div className="section-divider__bar" />

      {/* Right block: title */}
      <p className="section-divider__title" style={{ fontFamily: titleFont }}>
        {content.sectionTitle}
      </p>
    </div>
  );
}
