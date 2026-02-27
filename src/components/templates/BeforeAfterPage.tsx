import './before-after-page.css';

interface BeforeAfterPair {
  beforeImage?: string | null;
  afterImage?: string | null;
  beforeLabel: string;
  afterLabel: string;
  showBeforeLabel: boolean;
  showAfterLabel: boolean;
  showArrow: boolean;
}

interface BeforeAfterContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  layoutMode: '2x2' | '1x2' | '2x1' | 'freeform';
  beforeLabel: string;
  afterLabel: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  badgeFontSize: number;
  arrowColor: string;
  arrowSize: number;
  gapColor: string;
  pairs: BeforeAfterPair[];
}

interface BeforeAfterPageProps {
  content: BeforeAfterContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

/** Compute grid layout positions for each pair based on layoutMode. */
function computeLayout(
  mode: string,
  pairCount: number
): { cols: number; rows: number; pairWidth: number; pairHeight: number; photoWidth: number; photoHeight: number; gapX: number; gapY: number } {
  // Available grid area
  const gridWidth = 880; // 960 - 40*2
  const gridHeight = 420; // 540 - 95 - 25 (header + bottom margin)

  if (mode === '2x2') {
    const cols = 2;
    const rows = 2;
    const gapX = 8;
    const gapY = 8;
    const pairWidth = (gridWidth - gapX * (cols - 1)) / cols;
    const pairHeight = (gridHeight - gapY * (rows - 1)) / rows;
    const arrowSpace = 49; // arrow width (41) + 4px padding each side
    const photoWidth = (pairWidth - arrowSpace) / 2;
    return { cols, rows, pairWidth, pairHeight, photoWidth, photoHeight: pairHeight, gapX, gapY };
  }

  if (mode === '1x2') {
    const cols = 1;
    const rows = 2;
    const gapY = 8;
    const pairWidth = gridWidth;
    const pairHeight = (gridHeight - gapY * (rows - 1)) / rows;
    const arrowSpace = 49;
    const photoWidth = (pairWidth - arrowSpace) / 2;
    return { cols, rows, pairWidth, pairHeight, photoWidth, photoHeight: pairHeight, gapX: 0, gapY };
  }

  if (mode === '2x1') {
    const cols = 2;
    const rows = 1;
    const gapX = 8;
    const pairWidth = (gridWidth - gapX * (cols - 1)) / cols;
    const pairHeight = gridHeight;
    const arrowSpace = 49;
    const photoWidth = (pairWidth - arrowSpace) / 2;
    return { cols, rows, pairWidth, pairHeight, photoWidth, photoHeight: pairHeight, gapX, gapY: 0 };
  }

  // freeform: wrap pairs left to right
  const cols = Math.min(pairCount, 2);
  const rows = Math.ceil(pairCount / cols);
  const gapX = 8;
  const gapY = 8;
  const pairWidth = cols > 1 ? (gridWidth - gapX * (cols - 1)) / cols : gridWidth;
  const pairHeight = rows > 1 ? (gridHeight - gapY * (rows - 1)) / rows : gridHeight;
  const arrowSpace = 49;
  const photoWidth = (pairWidth - arrowSpace) / 2;
  return { cols, rows, pairWidth, pairHeight, photoWidth, photoHeight: pairHeight, gapX, gapY };
}

function ArrowIcon({ color, size }: { color: string; size: number }) {
  const h = size * 0.756; // keep aspect ratio ~41:31
  return (
    <svg width={size} height={h} viewBox="0 0 41 31" fill="none">
      <path
        d="M25.5 0L41 15.5L25.5 31V19H0V12H25.5V0Z"
        fill={color}
      />
    </svg>
  );
}

export default function BeforeAfterPage({ content, language = 'en' }: BeforeAfterPageProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';
  const pairs = content.pairs || [];
  const mode = content.layoutMode || '2x2';
  const badgeBg = content.badgeBackgroundColor || '#FBB931';
  const badgeText = content.badgeTextColor || '#FFFFFF';
  const badgeFontSize = content.badgeFontSize || 11;
  const arrowColor = content.arrowColor || '#FBB931';
  const arrowSize = content.arrowSize || 41;
  const gapColor = content.gapColor || '#FFFFFF';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  const layout = computeLayout(mode, pairs.length);

  return (
    <div className="before-after-page">
      {/* Wordmark */}
      <img
        className="before-after-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="before-after-page__year" style={{ fontFamily }}>{year}</div>

      {/* Section label */}
      {label && (
        <p className="before-after-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="before-after-page__rule" />

      {/* Grid */}
      <div className="before-after-page__grid" style={{ width: 880, height: 420 }}>
        {pairs.map((pair, idx) => {
          const col = idx % layout.cols;
          const row = Math.floor(idx / layout.cols);
          const x = col * (layout.pairWidth + layout.gapX);
          const y = row * (layout.pairHeight + layout.gapY);
          const arrowGap = 4;
          const arrowTotalWidth = arrowSize + arrowGap * 2;
          const photoW = (layout.pairWidth - arrowTotalWidth) / 2;

          const beforeLbl = pair.beforeLabel || content.beforeLabel || 'Before';
          const afterLbl = pair.afterLabel || content.afterLabel || 'After';

          return (
            <div
              key={idx}
              className="before-after-page__pair"
              style={{
                left: x,
                top: y,
                width: layout.pairWidth,
                height: layout.pairHeight,
              }}
            >
              {/* Before photo */}
              <div
                className="before-after-page__photo"
                style={{ width: photoW, height: layout.pairHeight, background: gapColor }}
              >
                {pair.beforeImage ? (
                  <img src={pair.beforeImage} alt="" />
                ) : (
                  <div className="before-after-page__photo-placeholder" />
                )}
                {pair.showBeforeLabel && (
                  <div
                    className="before-after-page__badge"
                    style={{
                      background: badgeBg,
                      color: badgeText,
                      fontSize: badgeFontSize,
                      fontFamily,
                    }}
                  >
                    {beforeLbl}
                  </div>
                )}
              </div>

              {/* Arrow */}
              {pair.showArrow && (
                <div
                  className="before-after-page__arrow"
                  style={{
                    width: arrowTotalWidth,
                    height: layout.pairHeight,
                    background: gapColor,
                  }}
                >
                  <ArrowIcon color={arrowColor} size={arrowSize} />
                </div>
              )}
              {!pair.showArrow && (
                <div style={{ width: arrowTotalWidth, height: layout.pairHeight, background: gapColor }} />
              )}

              {/* After photo */}
              <div
                className="before-after-page__photo"
                style={{ width: photoW, height: layout.pairHeight, background: gapColor }}
              >
                {pair.afterImage ? (
                  <img src={pair.afterImage} alt="" />
                ) : (
                  <div className="before-after-page__photo-placeholder" />
                )}
                {pair.showAfterLabel && (
                  <div
                    className="before-after-page__badge"
                    style={{
                      background: badgeBg,
                      color: badgeText,
                      fontSize: badgeFontSize,
                      fontFamily,
                    }}
                  >
                    {afterLbl}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="before-after-page__page-number" style={{ fontFamily }}>
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
