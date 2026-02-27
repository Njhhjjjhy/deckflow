import { useRef, useEffect, useState } from 'react';
import './map-text-list-page.css';

interface PropertyGroup {
  label: string;
  items: string[];
}

interface SummaryRow {
  label: string;
  value: string;
  subValue: string;
}

interface MapTextListContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  mapImage?: string | null;
  heading: string;
  leftGroups: PropertyGroup[];
  rightGroups: PropertyGroup[];
  showSummaryTable: boolean;
  summaryRows: SummaryRow[];
}

interface MapTextListPageProps {
  content: MapTextListContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const DEFAULT_GROUP_FONT = 11;
const DEFAULT_ITEM_FONT = 10;
const MIN_GROUP_FONT = 8;
const MIN_ITEM_FONT = 7;

export default function MapTextListPage({ content, language = 'en' }: MapTextListPageProps) {
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

  // Auto-shrink if right column overflows
  useEffect(() => {
    const el = rightColRef.current;
    if (!el) return;

    let scale = 1;
    el.style.setProperty('--group-font-size', `${DEFAULT_GROUP_FONT}px`);
    el.style.setProperty('--item-font-size', `${DEFAULT_ITEM_FONT}px`);

    while (el.scrollHeight > el.clientHeight && scale > 0.6) {
      scale -= 0.05;
      const groupSize = Math.max(MIN_GROUP_FONT, Math.round(DEFAULT_GROUP_FONT * scale));
      const itemSize = Math.max(MIN_ITEM_FONT, Math.round(DEFAULT_ITEM_FONT * scale));
      el.style.setProperty('--group-font-size', `${groupSize}px`);
      el.style.setProperty('--item-font-size', `${itemSize}px`);
    }

    setFontScale(scale);
  }, [content, language]);

  const groupFontSize = Math.max(MIN_GROUP_FONT, Math.round(DEFAULT_GROUP_FONT * fontScale));
  const itemFontSize = Math.max(MIN_ITEM_FONT, Math.round(DEFAULT_ITEM_FONT * fontScale));

  // Calculate property list area height (exclude heading and optional summary table)
  const headingHeight = 38; // heading line + margin
  const summaryHeight = content.showSummaryTable ? 80 : 0;
  const propAreaHeight = 450 - headingHeight - summaryHeight;

  return (
    <div className="map-text-list-page">
      {/* Wordmark — top-left */}
      <img
        className="map-text-list-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="map-text-list-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="map-text-list-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="map-text-list-page__rule" />

      {/* Left column: map image */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 60,
          width: 380,
          height: 450,
        }}
      >
        {content.mapImage ? (
          <img
            className="map-text-list-page__map"
            src={content.mapImage}
            alt="Map"
          />
        ) : (
          <div className="map-text-list-page__map-placeholder">
            Map image
          </div>
        )}
      </div>

      {/* Right column: heading + property list + optional summary */}
      <div
        ref={rightColRef}
        style={{
          position: 'absolute',
          left: 420,
          top: 60,
          width: 510,
          height: 450,
          overflow: 'hidden',
        }}
      >
        {/* Heading */}
        <p
          className="map-text-list-page__heading"
          style={{ fontFamily: headingFontFamily }}
        >
          {content.heading}
        </p>

        {/* Two-column property list */}
        <div
          style={{
            position: 'relative',
            height: propAreaHeight,
            overflow: 'hidden',
          }}
        >
          {/* Left property column */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 245,
            }}
          >
            {content.leftGroups.map((group, gi) => (
              <div key={gi} className="map-text-list-page__group">
                {group.label && (
                  <p
                    className="map-text-list-page__group-label"
                    style={{ fontFamily, fontSize: groupFontSize }}
                  >
                    {group.label}
                  </p>
                )}
                {group.items.map((item, ii) => (
                  <p
                    key={ii}
                    className="map-text-list-page__group-item"
                    style={{ fontFamily, fontSize: itemFontSize }}
                  >
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Right property column */}
          <div
            style={{
              position: 'absolute',
              left: 260,
              top: 0,
              width: 245,
            }}
          >
            {content.rightGroups.map((group, gi) => (
              <div key={gi} className="map-text-list-page__group">
                {group.label && (
                  <p
                    className="map-text-list-page__group-label"
                    style={{ fontFamily, fontSize: groupFontSize }}
                  >
                    {group.label}
                  </p>
                )}
                {group.items.map((item, ii) => (
                  <p
                    key={ii}
                    className="map-text-list-page__group-item"
                    style={{ fontFamily, fontSize: itemFontSize }}
                  >
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Optional summary table */}
        {content.showSummaryTable && content.summaryRows.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <table className="map-text-list-page__summary-table">
              <tbody>
                {content.summaryRows.map((row, ri) => (
                  <tr key={ri}>
                    <td
                      className="map-text-list-page__summary-cell"
                      style={{ width: '40%', fontFamily }}
                    >
                      <p
                        className="map-text-list-page__summary-label"
                        style={{ fontFamily }}
                      >
                        {row.label}
                      </p>
                    </td>
                    <td
                      className="map-text-list-page__summary-cell"
                      style={{ width: '60%', fontFamily }}
                    >
                      <p
                        className="map-text-list-page__summary-value"
                        style={{ fontFamily: headingFontFamily }}
                      >
                        {row.value}
                      </p>
                      {row.subValue && (
                        <p
                          className="map-text-list-page__summary-subvalue"
                          style={{ fontFamily }}
                        >
                          {row.subValue}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Page number — bottom center */}
      {content.pageNumber !== undefined && (
        <p className="map-text-list-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
