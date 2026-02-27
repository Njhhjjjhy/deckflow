import { useRef, useEffect, useState } from 'react';
import './disclaimer-page.css';

interface DisclaimerPageContent {
  disclaimerText: string;
  year?: string;
  sectionLabel?: string;
}

interface DisclaimerPageProps {
  content: DisclaimerPageContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const MIN_FONT_SIZE = 9;
const DEFAULT_FONT_SIZE = 11;

export default function DisclaimerPage({ content, language = 'en' }: DisclaimerPageProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || 'Disclaimer';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  // Auto-shrink font if text overflows, but never below MIN_FONT_SIZE
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    let size = DEFAULT_FONT_SIZE;
    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > el.clientHeight && size > MIN_FONT_SIZE) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [content.disclaimerText, language]);

  return (
    <div className="disclaimer-page">
      {/* Wordmark — top-left */}
      <img
        className="disclaimer-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="disclaimer-page__year">{year}</div>

      {/* Section label */}
      <p className="disclaimer-page__label" style={{ fontFamily }}>
        {label}
      </p>

      {/* Horizontal rule */}
      <hr className="disclaimer-page__rule" />

      {/* Disclaimer text block */}
      <p
        ref={textRef}
        className="disclaimer-page__text"
        style={{ fontFamily, fontSize }}
      >
        {content.disclaimerText}
      </p>
    </div>
  );
}
