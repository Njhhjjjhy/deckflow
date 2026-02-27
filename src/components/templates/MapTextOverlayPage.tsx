import './map-text-overlay-page.css';

interface MapCallout {
  label: string;
  x: number; // percentage of map area
  y: number; // percentage of map area
  color: string;
  visible: boolean;
}

interface MapTextOverlayContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  mapImage?: string | null;
  callouts: MapCallout[];
}

interface MapTextOverlayPageProps {
  content: MapTextOverlayContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function MapTextOverlayPage({ content, language = 'en' }: MapTextOverlayPageProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  return (
    <div className="map-text-overlay-page">
      {/* Wordmark — top-left */}
      <img
        className="map-text-overlay-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="map-text-overlay-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="map-text-overlay-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="map-text-overlay-page__rule" />

      {/* Full-width map with callout overlays */}
      <div className="map-text-overlay-page__map-area">
        {content.mapImage ? (
          <img
            className="map-text-overlay-page__map"
            src={content.mapImage}
            alt="Map"
          />
        ) : (
          <div className="map-text-overlay-page__map-placeholder">
            Map image
          </div>
        )}

        {/* Floating callouts */}
        {content.callouts.map((callout, i) =>
          callout.visible && callout.label ? (
            <div
              key={i}
              className="map-text-overlay-page__callout"
              style={{
                left: `${callout.x}%`,
                top: `${callout.y}%`,
              }}
            >
              <span
                className="map-text-overlay-page__callout-dot"
                style={{ background: callout.color }}
              />
              <span
                className="map-text-overlay-page__callout-label"
                style={{ fontFamily }}
              >
                {callout.label}
              </span>
            </div>
          ) : null
        )}
      </div>

      {/* Page number — bottom center */}
      {content.pageNumber !== undefined && (
        <p className="map-text-overlay-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
