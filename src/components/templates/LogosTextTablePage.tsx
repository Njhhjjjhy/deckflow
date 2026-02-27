import './logos-text-table-page.css';

interface PartnerEntry {
  logoImage?: string | null;
  heading: string;
  bullets: string[];
}

interface LogosTextTableContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  entries: PartnerEntry[];
  tableTitle: string;
  tableImage?: string | null;
  showFootnote?: boolean;
  footnote?: string;
  showSource?: boolean;
  source?: string;
}

interface LogosTextTablePageProps {
  content: LogosTextTableContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function LogosTextTablePage({ content, language = 'en' }: LogosTextTablePageProps) {
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

  const entries = content.entries || [];
  const entryCount = Math.max(entries.length, 1);
  // Available height for left column content area: y:65 to y:520 = 455px
  const entryHeight = Math.floor(455 / entryCount);

  return (
    <div className="logos-text-table-page">
      {/* Header */}
      <img
        className="logos-text-table-page__wordmark"
        src="/moreharvest-wordmark.png"
        alt="MoreHarvest"
      />
      <span className="logos-text-table-page__year" style={{ fontFamily }}>
        {year}
      </span>
      {label && (
        <p className="logos-text-table-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}
      <div className="logos-text-table-page__rule" />

      {/* LEFT COLUMN: Partner entries */}
      {entries.map((entry, idx) => {
        const entryTop = 65 + idx * entryHeight;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: 30,
              top: entryTop,
              width: 420,
            }}
          >
            {/* Partner logo */}
            {entry.logoImage && (
              <img
                src={entry.logoImage}
                alt={entry.heading || 'Partner logo'}
                style={{
                  height: 60,
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  marginBottom: 6,
                }}
              />
            )}

            {/* Heading */}
            {entry.heading && (
              <p
                style={{
                  fontFamily: headingFontFamily,
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#1A1A1A',
                  margin: '0 0 4px 0',
                  lineHeight: 1.4,
                }}
              >
                {entry.heading}
              </p>
            )}

            {/* Bullet list */}
            {entry.bullets && entry.bullets.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 16,
                  listStyleType: 'disc',
                }}
              >
                {entry.bullets.map((bullet, bIdx) => (
                  <li
                    key={bIdx}
                    style={{
                      fontFamily,
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#333333',
                      lineHeight: 1.5,
                      marginBottom: 2,
                    }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* RIGHT COLUMN */}
      {/* Table title */}
      {content.tableTitle && (
        <p
          style={{
            position: 'absolute',
            left: 470,
            top: 65,
            width: 460,
            fontFamily: headingFontFamily,
            fontWeight: 600,
            fontSize: 13,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {content.tableTitle}
        </p>
      )}

      {/* Table image */}
      {content.tableImage && (
        <img
          src={content.tableImage}
          alt="Table"
          style={{
            position: 'absolute',
            left: 470,
            top: 85,
            width: 460,
            height: 'auto',
            objectFit: 'contain',
            maxHeight: content.showFootnote || content.showSource ? 350 : 410,
          }}
        />
      )}

      {/* Footnote */}
      {content.showFootnote && content.footnote && (
        <p
          style={{
            position: 'absolute',
            left: 470,
            bottom: content.showSource && content.source ? 42 : 22,
            width: 460,
            fontFamily,
            fontWeight: 400,
            fontSize: 10,
            color: '#333333',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {content.footnote}
        </p>
      )}

      {/* Source */}
      {content.showSource && content.source && (
        <p
          style={{
            position: 'absolute',
            left: 470,
            bottom: 22,
            width: 460,
            fontFamily,
            fontWeight: 400,
            fontSize: 10,
            color: '#333333',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {content.source}
        </p>
      )}

      {/* Page number */}
      {content.pageNumber != null && (
        <span className="logos-text-table-page__page-number" style={{ fontFamily }}>
          {content.pageNumber}
        </span>
      )}
    </div>
  );
}
