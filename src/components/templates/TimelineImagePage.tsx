import './timeline-image-page.css';

interface TimelineEntry {
  year: string;
  heading: string;
  bullets: string[];
  yearColor: string;
  headingColor: string;
  bodyColor: string;
}

interface TimelineImageContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  timelineLineColor: string;
  bulletColor: string;
  entries: TimelineEntry[];
  photo?: string | null;
  caption: string;
  captionColor: string;
}

interface TimelineImagePageProps {
  content: TimelineImageContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function TimelineImagePage({ content, language = 'en' }: TimelineImagePageProps) {
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

  const lineColor = content.timelineLineColor || '#1A1A1A';
  const bulletDotColor = content.bulletColor || '#333333';

  // Calculate line height based on entries
  const entries = content.entries || [];

  return (
    <div className="timeline-image-page">
      {/* Wordmark */}
      <img
        className="timeline-image-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="timeline-image-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="timeline-image-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="timeline-image-page__rule" />

      {/* Timeline block */}
      <div className="timeline-image-page__timeline">
        {/* Vertical line — spans from first node to last node */}
        {entries.length > 1 && (
          <div
            className="timeline-image-page__timeline-line"
            style={{ background: lineColor, bottom: 0 }}
          />
        )}

        {entries.map((entry, i) => (
          <div key={i} className="timeline-image-page__entry">
            {/* Circle node */}
            <div
              className="timeline-image-page__node"
              style={{ borderColor: lineColor }}
            />

            {/* Year */}
            <p
              className="timeline-image-page__entry-year"
              style={{ fontFamily, color: entry.yearColor || '#1A1A1A' }}
            >
              {entry.year}
            </p>

            {/* Heading */}
            <h3
              className="timeline-image-page__entry-heading"
              style={{ fontFamily: headingFontFamily, color: entry.headingColor || '#1A1A1A' }}
            >
              {entry.heading}
            </h3>

            {/* Bullets */}
            {entry.bullets.length > 0 && (
              <ul className="timeline-image-page__entry-bullets">
                {entry.bullets.map((bullet, bi) => (
                  <li
                    key={bi}
                    className="timeline-image-page__entry-bullet"
                    style={{ fontFamily, color: entry.bodyColor || '#333333' }}
                  >
                    <span
                      className="timeline-image-page__entry-bullet-dot"
                      style={{ background: bulletDotColor }}
                    />
                    {bullet || (
                      <span style={{ color: '#CCCCCC' }}>[no translation]</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Photo */}
      {content.photo ? (
        <img
          className="timeline-image-page__photo"
          src={content.photo}
          alt=""
        />
      ) : (
        <div className="timeline-image-page__photo-placeholder">
          Upload photo
        </div>
      )}

      {/* Caption */}
      {content.caption && (
        <p
          className="timeline-image-page__caption"
          style={{ fontFamily, color: content.captionColor || '#333333' }}
        >
          {content.caption}
        </p>
      )}

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="timeline-image-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
