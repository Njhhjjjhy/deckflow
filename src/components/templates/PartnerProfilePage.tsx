import './partner-profile-page.css';

interface PartnerProfileContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  partnerLogoImage?: string;
  bodyParagraph: string;
  showLinks?: boolean;
  linkLabel?: string;
  linkUrl?: string;
  contactLine1?: string;
  contactLine2?: string;
  contactLine3?: string;
  contactLine4?: string;
  contactLine5?: string;
  bottomUrl?: string;
}

interface PartnerProfilePageProps {
  content: PartnerProfileContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

/** Render body text with **bold** markdown support */
function renderBoldText(
  text: string,
  fontFamily: string,
  headingFontFamily: string
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <span key={i} style={{ fontFamily: headingFontFamily, fontWeight: 600 }}>
          {inner}
        </span>
      );
    }
    return <span key={i} style={{ fontFamily }}>{part}</span>;
  });
}

export default function PartnerProfilePage({ content, language = 'en' }: PartnerProfilePageProps) {
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

  const contactLines = [
    content.contactLine1,
    content.contactLine2,
    content.contactLine3,
    content.contactLine4,
    content.contactLine5,
  ].filter((line) => line && line.trim());

  return (
    <div className="partner-profile-page">
      {/* Header */}
      <img
        className="partner-profile-page__wordmark"
        src="/moreharvest-wordmark.png"
        alt="MoreHarvest"
      />
      <span className="partner-profile-page__year" style={{ fontFamily }}>
        {year}
      </span>
      {label && (
        <p className="partner-profile-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}
      <div className="partner-profile-page__rule" />

      {/* Partner logo — centered, fixed height ~80px */}
      {content.partnerLogoImage && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            width: 960,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src={content.partnerLogoImage}
            alt="Partner logo"
            style={{
              height: 80,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Body paragraph — centered horizontally, left-aligned text, max ~600px */}
      {content.bodyParagraph && (
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 0,
            width: 960,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              maxWidth: 600,
              width: '100%',
              fontFamily,
              fontWeight: 400,
              fontSize: 13,
              lineHeight: 1.65,
              color: '#1A1A1A',
              margin: 0,
              textAlign: 'left',
            }}
          >
            {renderBoldText(content.bodyParagraph, fontFamily, headingFontFamily)}
          </p>
        </div>
      )}

      {/* Labeled link section — optional */}
      {content.showLinks && (content.linkLabel || content.linkUrl) && (
        <div
          style={{
            position: 'absolute',
            top: 360,
            left: 0,
            width: 960,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: 600, width: '100%' }}>
            {content.linkLabel && (
              <p
                style={{
                  fontFamily: headingFontFamily,
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#1A1A1A',
                  margin: '0 0 2px 0',
                  lineHeight: 1.4,
                }}
              >
                {content.linkLabel}
              </p>
            )}
            {content.linkUrl && (
              <p
                style={{
                  fontFamily,
                  fontWeight: 400,
                  fontSize: 12,
                  color: '#1A1A1A',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {content.linkUrl}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contact block — bottom-left */}
      {contactLines.length > 0 && (
        <div className="partner-profile-page__contact" style={{ fontFamily }}>
          {contactLines.map((line, i) => (
            <p key={i} className="partner-profile-page__contact-line">
              {line}
            </p>
          ))}
        </div>
      )}

      {/* URL — bottom-right */}
      {content.bottomUrl && (
        <span className="partner-profile-page__url" style={{ fontFamily }}>
          {content.bottomUrl}
        </span>
      )}

      {/* Page number */}
      {content.pageNumber != null && (
        <span className="partner-profile-page__page-number" style={{ fontFamily }}>
          {content.pageNumber}
        </span>
      )}
    </div>
  );
}
