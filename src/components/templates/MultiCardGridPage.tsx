import { useRef, useEffect, useState } from 'react';
import './multi-card-grid-page.css';

interface CardContent {
  icon: string | null;
  heading: string;
  bodyType: 'bullets' | 'paragraph';
  bullets?: string[];
  paragraph?: string;
}

interface MultiCardGridContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  cards: CardContent[];
}

interface MultiCardGridPageProps {
  content: MultiCardGridContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const DEFAULT_BODY_FONT_SIZE = 12;
const MIN_BODY_FONT_SIZE = 9;

export default function MultiCardGridPage({ content, language = 'en' }: MultiCardGridPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [bodyFontSize, setBodyFontSize] = useState(DEFAULT_BODY_FONT_SIZE);

  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  const headingFontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  // Split cards into two columns: odd indices left, even indices right
  const leftCards: (CardContent & { idx: number })[] = [];
  const rightCards: (CardContent & { idx: number })[] = [];
  content.cards.forEach((card, i) => {
    if (i % 2 === 0) leftCards.push({ ...card, idx: i });
    else rightCards.push({ ...card, idx: i });
  });

  // Auto-shrink body font if cards overflow available height
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    let size = DEFAULT_BODY_FONT_SIZE;

    // Set CSS variable for body font size
    el.style.setProperty('--body-font-size', `${size}px`);

    while (el.scrollHeight > el.clientHeight && size > MIN_BODY_FONT_SIZE) {
      size -= 0.5;
      el.style.setProperty('--body-font-size', `${size}px`);
    }

    setBodyFontSize(size);
  }, [content.cards, language]);

  const renderCard = (card: CardContent & { idx: number }) => (
    <div key={card.idx} style={{ marginBottom: 20 }}>
      {/* Icon + heading row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {card.icon ? (
          <img
            src={card.icon}
            alt=""
            className="multi-card-grid-page__icon"
          />
        ) : (
          <div className="multi-card-grid-page__icon-placeholder" />
        )}
        <p
          className="multi-card-grid-page__heading"
          style={{ fontFamily: headingFontFamily }}
        >
          {card.heading}
        </p>
      </div>

      {/* Body content */}
      {card.bodyType === 'bullets' && card.bullets && card.bullets.length > 0 ? (
        <ul className="multi-card-grid-page__bullet-list">
          {card.bullets.map((bullet, bi) => (
            <li
              key={bi}
              className="multi-card-grid-page__bullet-item"
              style={{ fontFamily, fontSize: bodyFontSize }}
            >
              <span className="multi-card-grid-page__bullet-dot" />
              {bullet}
            </li>
          ))}
        </ul>
      ) : card.bodyType === 'paragraph' && card.paragraph ? (
        <p
          className="multi-card-grid-page__body"
          style={{ fontFamily, fontSize: bodyFontSize }}
        >
          {card.paragraph}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="multi-card-grid-page">
      {/* Wordmark — top-left */}
      <img
        className="multi-card-grid-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="multi-card-grid-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="multi-card-grid-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="multi-card-grid-page__rule" />

      {/* Two-column card grid */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          left: 30,
          top: 70,
          width: 900,
          height: 445,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Left column */}
        <div style={{ width: 430 }}>
          {leftCards.map(renderCard)}
        </div>

        {/* Right column */}
        <div style={{ position: 'absolute', left: 470, width: 430 }}>
          {rightCards.map(renderCard)}
        </div>
      </div>

      {/* Page number — bottom center */}
      {content.pageNumber !== undefined && (
        <p className="multi-card-grid-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
