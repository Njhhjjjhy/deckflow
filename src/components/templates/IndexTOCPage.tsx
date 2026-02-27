import { useRef, useEffect, useState } from 'react';
import './index-toc-page.css';

export interface IndexTOCEntry {
  id: string;
  label: string;
  pageNumber: string;
}

export interface IndexTOCSection {
  id: string;
  name: string;
  entries: IndexTOCEntry[];
}

interface IndexTOCContent {
  sectionLabel?: string;
  year?: string;
  heroImage?: string;
  sections: IndexTOCSection[];
}

interface IndexTOCProps {
  content: IndexTOCContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const DEFAULT_FONT_SIZE = 13;
const MIN_FONT_SIZE = 9;

export default function IndexTOCPage({ content, language = 'en' }: IndexTOCProps) {
  const tocRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '00 | Index';

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

  // Flat mode: single section with empty name
  const isFlat =
    content.sections.length <= 1 &&
    (!content.sections[0]?.name || content.sections[0].name.trim() === '');

  const allEntries = content.sections.flatMap((s) => s.entries);

  // Auto-shrink font when entries overflow available height
  useEffect(() => {
    const el = tocRef.current;
    if (!el) return;

    let size = DEFAULT_FONT_SIZE;
    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > el.clientHeight && size > MIN_FONT_SIZE) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [content.sections, language]);

  return (
    <div className="index-toc-page">
      {/* Wordmark — top-left */}
      <img
        className="index-toc-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="index-toc-page__year">{year}</div>

      {/* Section label */}
      <p className="index-toc-page__label" style={{ fontFamily }}>
        {label}
      </p>

      {/* Horizontal rule */}
      <hr className="index-toc-page__rule" />

      {/* TOC content */}
      <div ref={tocRef} className="index-toc-page__toc" style={{ fontSize }}>
        {isFlat
          ? allEntries.map((entry) => (
              <div key={entry.id} className="index-toc-page__entry">
                <span className="index-toc-page__entry-label" style={{ fontFamily }}>
                  {entry.label}
                </span>
                {entry.pageNumber && (
                  <span className="index-toc-page__entry-page" style={{ fontFamily }}>
                    pg. {entry.pageNumber}
                  </span>
                )}
              </div>
            ))
          : content.sections.map((section, sIdx) => (
              <div key={section.id}>
                {section.name && (
                  <p
                    className={
                      'index-toc-page__section-heading' +
                      (sIdx === 0 ? ' index-toc-page__section-heading--first' : '')
                    }
                    style={{ fontFamily: headingFontFamily }}
                  >
                    {section.name}
                  </p>
                )}
                {section.entries.map((entry) => (
                  <div key={entry.id} className="index-toc-page__entry">
                    <span className="index-toc-page__entry-label" style={{ fontFamily }}>
                      {entry.label}
                    </span>
                    {entry.pageNumber && (
                      <span className="index-toc-page__entry-page" style={{ fontFamily }}>
                        pg. {entry.pageNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
      </div>

      {/* Hero image — oval crop */}
      {content.heroImage ? (
        <img
          className="index-toc-page__image"
          src={content.heroImage}
          alt=""
        />
      ) : (
        <div className="index-toc-page__image-placeholder" />
      )}
    </div>
  );
}
