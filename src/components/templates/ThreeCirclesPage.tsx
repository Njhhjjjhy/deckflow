import './three-circles-page.css';

interface CircleItem {
  heading: string;
  body: string;
}

interface ThreeCirclesContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading: string;
  circles: [CircleItem, CircleItem, CircleItem];
  circleBorderColor?: string;
}

interface ThreeCirclesPageProps {
  content: ThreeCirclesContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function ThreeCirclesPage({ content, language = 'en' }: ThreeCirclesPageProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';
  const borderColor = content.circleBorderColor || '#FBB931';

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

  // Circle geometry:
  // Available width: x:30 to x:930 = 900px
  // Three circles overlapping by ~1/5 of diameter
  // Let diameter = D, overlap = D/5
  // Total width = 3D - 2*(D/5) = 3D - 0.4D = 2.6D = 900 => D ≈ 346
  const diameter = 346;
  const radius = diameter / 2;
  const overlap = diameter / 5; // ~69px
  const borderWidth = 8;

  // Circle centers (x positions from left edge of slide)
  const startX = 30;
  const cx1 = startX + radius; // ~203
  const cx2 = cx1 + diameter - overlap; // ~480
  const cx3 = cx2 + diameter - overlap; // ~757

  // Vertical center: heading ends ~90px, page number at ~524px
  // Available space: 96 to 520 = 424px, center = 308
  const cy = 308;

  // Text positioning within each circle — left-aligned in the left portion
  // Text area starts at circle left edge + padding, limited to ~55% of diameter width
  const textPaddingLeft = 30;
  const textPaddingTop = -60; // offset from center
  const textMaxWidth = diameter * 0.55;

  // Adaptive font sizing: scale down if body text is long
  const getBodyFontSize = (body: string) => {
    if (body.length > 200) return 9;
    if (body.length > 150) return 10;
    return 11;
  };

  const getHeadingFontSize = (heading: string) => {
    if (heading.length > 40) return 12;
    return 14;
  };

  const circles = content.circles;

  const circlePositions = [
    { cx: cx1, cy },
    { cx: cx2, cy },
    { cx: cx3, cy },
  ];

  return (
    <div className="three-circles-page">
      {/* Header */}
      <img
        className="three-circles-page__wordmark"
        src="/moreharvest-wordmark.png"
        alt="MoreHarvest"
      />
      <span className="three-circles-page__year" style={{ fontFamily }}>
        {year}
      </span>
      {label && (
        <p className="three-circles-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}
      <div className="three-circles-page__rule" />

      {/* Heading */}
      <p className="three-circles-page__heading" style={{ fontFamily: headingFontFamily }}>
        {content.heading}
      </p>

      {/* Three overlapping circles */}
      {circlePositions.map((pos, i) => {
        const circle = circles[i];
        const left = pos.cx - radius;
        const top = pos.cy - radius;
        const headingFs = getHeadingFontSize(circle.heading);
        const bodyFs = getBodyFontSize(circle.body);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: diameter,
              height: diameter,
              borderRadius: '50%',
              border: `${borderWidth}px solid ${borderColor}`,
              background: 'rgba(242, 242, 242, 0.85)',
              boxSizing: 'border-box',
            }}
          >
            {/* Text block — left-aligned within circle */}
            <div
              style={{
                position: 'absolute',
                left: textPaddingLeft,
                top: radius + textPaddingTop,
                maxWidth: textMaxWidth,
              }}
            >
              <p
                style={{
                  fontFamily: headingFontFamily,
                  fontWeight: 600,
                  fontSize: headingFs,
                  lineHeight: 1.3,
                  color: '#1A1A1A',
                  margin: '0 0 6px 0',
                }}
              >
                {circle.heading}
              </p>
              <p
                style={{
                  fontFamily,
                  fontWeight: 400,
                  fontSize: bodyFs,
                  lineHeight: 1.5,
                  color: '#333333',
                  margin: 0,
                }}
              >
                {circle.body}
              </p>
            </div>
          </div>
        );
      })}

      {/* Page number */}
      {content.pageNumber != null && (
        <span className="three-circles-page__page-number" style={{ fontFamily }}>
          {content.pageNumber}
        </span>
      )}
    </div>
  );
}
