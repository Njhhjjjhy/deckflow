import './styles.css';

interface NewsImage {
  id: string;
  imageData: string | null;
  caption: string;
}

interface TextNewsContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading?: string;
  bullets?: string[];
  newsImages?: NewsImage[];
}

interface TextNewsProps {
  content: TextNewsContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function TextNewsPage({ content, language = 'en' }: TextNewsProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';
  const bullets = content.bullets || [];
  const newsImages = (content.newsImages || []).filter((img) => img.imageData || img.caption);

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

  // Show up to 4 image slots
  const imageSlots = newsImages.slice(0, 4);
  // Fill remaining slots as empty placeholders if any images exist but fewer than 1
  const showPlaceholders = imageSlots.length === 0;
  const displaySlots = showPlaceholders
    ? [{ id: 'ph', imageData: null, caption: '' }]
    : imageSlots;

  return (
    <div className="slide-page text-news-page">
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

      {/* Left: heading + bullets */}
      <p className="text-news-page__heading" style={{ fontFamily: headingFont }}>
        {content.heading || ''}
      </p>

      <ul className="text-news-page__bullets">
        {bullets.map((bullet, i) => (
          <li key={i} className="text-news-page__bullet" style={{ fontFamily: bodyFont }}>
            <span className="text-news-page__bullet-dot" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Right: news screenshot images */}
      <div className="text-news-page__images">
        {displaySlots.map((slot) => (
          <div key={slot.id} className="text-news-page__image-slot">
            <div className="text-news-page__image-wrap">
              {slot.imageData ? (
                <img src={slot.imageData} alt={slot.caption} />
              ) : (
                <div className="text-news-page__image-placeholder" />
              )}
            </div>
            {slot.caption && (
              <p className="text-news-page__caption" style={{ fontFamily: bodyFont }}>
                {slot.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="slide-page-number" style={{ fontFamily: bodyFont }}>
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
