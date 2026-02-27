import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import './text-chart-page.css';

interface BarItem {
  label: string;
  value: number;
}

interface TextChartContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading: string;
  bullets: string[];
  chartMode: 'data' | 'image';
  chartTitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisUnit?: string;
  yAxisMax?: number;
  bars?: BarItem[];
  chartImage?: string | null;
  chartImageCaption?: string;
}

interface TextChartPageProps {
  content: TextChartContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function TextChartPage({ content, language = 'en' }: TextChartPageProps) {
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

  const yAxisMax = content.yAxisMax || undefined;
  const yAxisUnit = content.yAxisUnit || '';

  // Compute ticks at 25% intervals if max is set
  const yTicks = yAxisMax
    ? [0, yAxisMax * 0.25, yAxisMax * 0.5, yAxisMax * 0.75, yAxisMax]
    : undefined;

  return (
    <div className="text-chart-page">
      {/* Wordmark */}
      <img
        className="text-chart-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="text-chart-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="text-chart-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="text-chart-page__rule" />

      {/* Left column: heading + bullets */}
      <div className="text-chart-page__left">
        <h2 className="text-chart-page__heading" style={{ fontFamily: headingFontFamily }}>
          {content.heading}
        </h2>
        <ul className="text-chart-page__bullet-list">
          {content.bullets.map((bullet, i) => (
            <li
              key={i}
              className="text-chart-page__bullet-item"
              style={{ fontFamily }}
            >
              <span className="text-chart-page__bullet-dot" />
              {bullet || (
                <span style={{ color: '#CCCCCC' }}>[no translation]</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Right column: chart or image */}
      <div className="text-chart-page__right">
        {content.chartMode === 'data' && content.bars && content.bars.length > 0 ? (
          <>
            {content.chartTitle && (
              <p className="text-chart-page__chart-title" style={{ fontFamily }}>
                {content.chartTitle}
              </p>
            )}
            <BarChart
              width={430}
              height={360}
              data={content.bars}
              margin={{ top: 10, right: 10, bottom: 40, left: 30 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#E5E5E5"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#333333', fontFamily }}
                axisLine={{ stroke: '#E5E5E5' }}
                tickLine={false}
                label={
                  content.xAxisLabel
                    ? {
                        value: content.xAxisLabel,
                        position: 'bottom',
                        offset: 20,
                        style: { fontSize: 11, fill: '#333333', fontFamily },
                      }
                    : undefined
                }
              />
              <YAxis
                domain={[0, yAxisMax || 'auto']}
                ticks={yTicks}
                tickFormatter={(v: number) => `${v}${yAxisUnit}`}
                tick={{ fontSize: 11, fill: '#333333', fontFamily }}
                axisLine={{ stroke: '#E5E5E5' }}
                tickLine={false}
                label={
                  content.yAxisLabel
                    ? {
                        value: content.yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        offset: -15,
                        style: { fontSize: 11, fill: '#333333', fontFamily, textAnchor: 'middle' },
                      }
                    : undefined
                }
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={content.bars.length > 8 ? 30 : 50}>
                {content.bars.map((_, i) => (
                  <Cell key={i} fill="#FBB931" />
                ))}
                <LabelList
                  dataKey="value"
                  position="insideTop"
                  offset={8}
                  style={{
                    fontSize: 12,
                    fill: '#1A1A1A',
                    fontWeight: 700,
                    fontFamily,
                  }}
                />
              </Bar>
            </BarChart>
          </>
        ) : content.chartMode === 'image' ? (
          <div className="text-chart-page__image-container">
            {content.chartImage ? (
              <div>
                <img
                  src={content.chartImage}
                  alt=""
                  className="text-chart-page__chart-image"
                />
                {content.chartImageCaption && (
                  <p className="text-chart-page__image-caption" style={{ fontFamily }}>
                    {content.chartImageCaption}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-chart-page__image-placeholder">
                <span>Upload chart image</span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="text-chart-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
