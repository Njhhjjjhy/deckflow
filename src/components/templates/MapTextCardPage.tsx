import { useRef, useEffect, useState } from 'react';
import './map-text-card-page.css';

interface MapCard {
  heading: string;
  bullets: string[];
}

interface MapTextCardContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  mapImage?: string | null;
  cards: MapCard[];
  arrows: boolean[]; // one boolean per gap between adjacent cards
}

interface MapTextCardPageProps {
  content: MapTextCardContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const DEFAULT_CARD_FONT_SIZE = 11;
const MIN_CARD_FONT_SIZE = 8;
const DEFAULT_HEADING_FONT_SIZE = 14;
const MIN_HEADING_FONT_SIZE = 11;

export default function MapTextCardPage({ content, language = 'en' }: MapTextCardPageProps) {
  const rightColRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(1);

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

  // Auto-shrink fonts if cards stack overflows
  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;

    let scale = 1;
    // Reset to default
    el.style.setProperty('--card-font-size', `${DEFAULT_CARD_FONT_SIZE}px`);
    el.style.setProperty('--heading-font-size', `${DEFAULT_HEADING_FONT_SIZE}px`);

    while (el.scrollHeight > el.clientHeight && scale > 0.65) {
      scale -= 0.05;
      const bulletSize = Math.max(MIN_CARD_FONT_SIZE, Math.round(DEFAULT_CARD_FONT_SIZE * scale));
      const headingSize = Math.max(MIN_HEADING_FONT_SIZE, Math.round(DEFAULT_HEADING_FONT_SIZE * scale));
      el.style.setProperty('--card-font-size', `${bulletSize}px`);
      el.style.setProperty('--heading-font-size', `${headingSize}px`);
    }

    setFontScale(scale);
  }, [content.cards, content.arrows, language]);

  const bulletFontSize = Math.max(MIN_CARD_FONT_SIZE, Math.round(DEFAULT_CARD_FONT_SIZE * fontScale));
  const headingFontSize = Math.max(MIN_HEADING_FONT_SIZE, Math.round(DEFAULT_HEADING_FONT_SIZE * fontScale));

  return (
    <div className="map-text-card-page">
      {/* Wordmark — top-left */}
      <img
        className="map-text-card-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="map-text-card-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="map-text-card-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="map-text-card-page__rule" />

      {/* Left column: map image */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 60,
          width: 420,
          height: 450,
        }}
      >
        {content.mapImage ? (
          <img
            className="map-text-card-page__map"
            src={content.mapImage}
            alt="Map"
          />
        ) : (
          <div className="map-text-card-page__map-placeholder">
            Map image
          </div>
        )}
      </div>

      {/* Right column: stacked cards with arrows */}
      <div
        ref={rightColRef}
        style={{
          position: 'absolute',
          left: 470,
          top: 60,
          width: 460,
          height: 450,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {content.cards.map((card, i) => (
          <div key={i}>
            {/* Card */}
            <div className="map-text-card-page__card">
              <p
                className="map-text-card-page__card-heading"
                style={{
                  fontFamily: headingFontFamily,
                  fontSize: headingFontSize,
                }}
              >
                {card.heading}
              </p>
              {card.bullets.length > 0 && (
                <ul className="map-text-card-page__bullet-list">
                  {card.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className="map-text-card-page__bullet-item"
                      style={{ fontFamily, fontSize: bulletFontSize }}
                    >
                      <span className="map-text-card-page__bullet-dash">–</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Arrow connector (between this card and the next) */}
            {i < content.cards.length - 1 && content.arrows[i] && (
              <div className="map-text-card-page__arrow">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d="M8 0 L8 14 M3 10 L8 16 L13 10" stroke="#FBB931" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* Spacer when arrow is hidden */}
            {i < content.cards.length - 1 && !content.arrows[i] && (
              <div style={{ height: 8 }} />
            )}
          </div>
        ))}
      </div>

      {/* Page number — bottom center */}
      {content.pageNumber !== undefined && (
        <p className="map-text-card-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
