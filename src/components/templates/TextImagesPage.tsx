import './text-images-page.css';

interface SectionItem {
  heading: string;
  bullets: string[];
}

interface TextImagesContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  sections: SectionItem[];
  headingColor: string;
  bodyColor: string;
  bulletColor: string;
  captionColor: string;
  logoImage?: string | null;
  photo1?: string | null;
  photo1ShowCaption: boolean;
  photo1Caption?: string;
  photo2?: string | null;
  photo2ShowCaption: boolean;
  photo2Caption?: string;
}

interface TextImagesPageProps {
  content: TextImagesContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function TextImagesPage({ content, language = 'en' }: TextImagesPageProps) {
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

  const sections = content.sections || [];
  const headingColor = content.headingColor || '#1A1A1A';
  const bodyColor = content.bodyColor || '#1A1A1A';
  const bulletColor = content.bulletColor || '#FBB931';
  const captionColor = content.captionColor || '#333333';

  const hasLogo = !!content.logoImage;
  const hasPhoto1 = !!content.photo1;
  const hasPhoto2 = !!content.photo2;
  const hasAnyPhoto = hasPhoto1 || hasPhoto2;

  // Photos top position: if logo exists, below logo (95+77+13=185). If no logo, shift up to 95.
  const photosTop = hasLogo ? 185 : 95;
  // Photos height: fill remaining space down to ~470px area
  const photosHeight = hasLogo ? 314 : 374;

  // Photo widths: if both present, 219px each with 4px gap. If only one, full 442px.
  const bothPhotos = hasPhoto1 && hasPhoto2;
  const singlePhotoWidth = 442;
  const dualPhotoWidth = 219;
  const photoGap = 4;

  return (
    <div className="text-images-page">
      {/* Wordmark */}
      <img
        className="text-images-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="text-images-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="text-images-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="text-images-page__rule" />

      {/* Left column: sections */}
      <div className="text-images-page__left">
        {sections.map((section, si) => (
          <div
            key={si}
            className="text-images-page__section"
            style={{ marginBottom: si < sections.length - 1 ? 16 : 0 }}
          >
            <h3
              className="text-images-page__section-heading"
              style={{ fontFamily: headingFontFamily, color: headingColor }}
            >
              {section.heading || (
                <span style={{ color: '#CCCCCC' }}>[no translation]</span>
              )}
            </h3>
            {section.bullets.length > 0 && (
              <ul className="text-images-page__section-bullets">
                {section.bullets.map((bullet, bi) => (
                  <li
                    key={bi}
                    className="text-images-page__bullet"
                    style={{ fontFamily, color: bodyColor }}
                  >
                    <span
                      className="text-images-page__bullet-dot"
                      style={{ background: bulletColor }}
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

      {/* Right column */}
      {/* Logo image */}
      {hasLogo && (
        <img
          className="text-images-page__logo"
          src={content.logoImage!}
          alt=""
        />
      )}

      {/* Photos */}
      {hasAnyPhoto && (
        <div
          className="text-images-page__photos"
          style={{ top: photosTop, height: photosHeight }}
        >
          {hasPhoto1 && (
            <div
              className="text-images-page__photo-wrapper"
              style={{ width: bothPhotos ? dualPhotoWidth : singlePhotoWidth }}
            >
              <img
                className="text-images-page__photo"
                src={content.photo1!}
                alt=""
                style={{ height: photosHeight }}
              />
              {content.photo1ShowCaption && content.photo1Caption && (
                <p
                  className="text-images-page__caption"
                  style={{ fontFamily, color: captionColor }}
                >
                  {content.photo1Caption}
                </p>
              )}
            </div>
          )}
          {hasPhoto2 && (
            <div
              className="text-images-page__photo-wrapper"
              style={{
                width: bothPhotos ? dualPhotoWidth : singlePhotoWidth,
                marginLeft: bothPhotos && hasPhoto1 ? photoGap : 0,
              }}
            >
              <img
                className="text-images-page__photo"
                src={content.photo2!}
                alt=""
                style={{ height: photosHeight }}
              />
              {content.photo2ShowCaption && content.photo2Caption && (
                <p
                  className="text-images-page__caption"
                  style={{ fontFamily, color: captionColor }}
                >
                  {content.photo2Caption}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="text-images-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
