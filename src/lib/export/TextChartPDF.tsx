import { View, Text, Image, Font, StyleSheet } from '@react-pdf/renderer';
import LogoPDF from './LogoPDF';

/* ------------------------------------------------------------------ */
/*  Register fonts                                                     */
/* ------------------------------------------------------------------ */

Font.register({
  family: 'REM',
  src: '/fonts/REM-SemiBold.ttf',
  fontWeight: 600,
});

Font.register({
  family: 'Noto Sans JP',
  src: '/fonts/NotoSansJP-Regular.ttf',
  fontWeight: 400,
});

Font.register({
  family: 'Noto Sans JP Bold',
  src: '/fonts/NotoSansJP-Bold.ttf',
  fontWeight: 700,
});

/* ------------------------------------------------------------------ */
/*  Styles — mirrors text-chart-page.css positions                    */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  wordmark: {
    position: 'absolute',
    left: 30,
    top: 14,
  },

  year: {
    position: 'absolute',
    right: 30,
    top: 14,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
    textAlign: 'right',
  },

  label: {
    position: 'absolute',
    left: 30,
    top: 38,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#333333',
  },

  rule: {
    position: 'absolute',
    top: 54,
    left: 30,
    width: 900,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },

  pageNumber: {
    position: 'absolute',
    top: 524,
    left: 0,
    width: 960,
    textAlign: 'center',
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#333333',
  },

  // Left column
  left: {
    position: 'absolute',
    left: 30,
    top: 80,
    width: 430,
  },

  heading: {
    fontFamily: 'REM',
    fontWeight: 600, // SemiBold — closest available to spec's Bold (no REM-Bold.ttf yet)
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 1.4,
  },

  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#333333',
    marginTop: 5,
    marginRight: 11,
  },

  bulletText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#333333',
    lineHeight: 1.6,
    flex: 1,
  },

  // Right column
  right: {
    position: 'absolute',
    left: 500,
    top: 80,
    width: 430,
    height: 400,
  },

  chartTitle: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 8,
  },

  // Chart area (manual bar chart)
  chartArea: {
    width: 430,
    height: 360,
    position: 'relative',
  },

  chartImage: {
    maxWidth: 430,
    maxHeight: 380,
    objectFit: 'contain',
  },

  imagePlaceholder: {
    width: 430,
    height: 400,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageCaption: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#333333',
    marginTop: 6,
    textAlign: 'center',
  },
});

/* ------------------------------------------------------------------ */
/*  Manual bar chart for PDF                                           */
/* ------------------------------------------------------------------ */

interface BarItem {
  label: string;
  value: number;
}

function PDFBarChart({
  bars,
  yAxisMax,
  yAxisUnit,
  xAxisLabel,
  yAxisLabel,
}: {
  bars: BarItem[];
  yAxisMax?: number;
  yAxisUnit: string;
  xAxisLabel: string;
  yAxisLabel: string;
}) {
  const maxVal = yAxisMax || Math.max(...bars.map((b) => b.value), 1);
  const chartLeft = 50;
  const chartTop = 10;
  const chartWidth = 360;
  const chartHeight = 280;
  const barCount = bars.length;
  const barGap = barCount > 8 ? 4 : 8;
  const barWidth = Math.min(
    50,
    (chartWidth - barGap * (barCount + 1)) / barCount
  );
  const totalBarsWidth = barCount * barWidth + (barCount + 1) * barGap;
  const offsetX = chartLeft + (chartWidth - totalBarsWidth) / 2;

  // Y-axis gridlines at 25% intervals
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={{ width: 430, height: 360, position: 'relative' }}>
      {/* Y-axis title */}
      {yAxisLabel ? (
        <Text
          style={{
            position: 'absolute',
            left: 0,
            top: chartTop + chartHeight / 2 - 30,
            width: 60,
            fontFamily: 'Noto Sans JP',
            fontSize: 11,
            color: '#333333',
            textAlign: 'center',
            transform: 'rotate(-90deg)',
          }}
        >
          {yAxisLabel}
        </Text>
      ) : null}

      {/* Grid lines + Y labels */}
      {gridLines.map((pct) => {
        const y = chartTop + chartHeight - pct * chartHeight;
        const val = Math.round(maxVal * pct);
        return (
          <View key={pct}>
            <View
              style={{
                position: 'absolute',
                left: chartLeft,
                top: y,
                width: chartWidth,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E5',
                borderBottomStyle: 'solid',
              }}
            />
            <Text
              style={{
                position: 'absolute',
                left: chartLeft - 30,
                top: y - 6,
                width: 28,
                textAlign: 'right',
                fontFamily: 'Noto Sans JP',
                fontSize: 11,
                color: '#333333',
              }}
            >
              {val}{yAxisUnit}
            </Text>
          </View>
        );
      })}

      {/* Bars */}
      {bars.map((bar, i) => {
        const barHeight = (bar.value / maxVal) * chartHeight;
        const x = offsetX + barGap + i * (barWidth + barGap);
        const y = chartTop + chartHeight - barHeight;

        return (
          <View key={i}>
            {/* Bar */}
            <View
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: barWidth,
                height: barHeight,
                backgroundColor: '#FBB931',
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            />
            {/* Value label inside bar */}
            <Text
              style={{
                position: 'absolute',
                left: x,
                top: y + 8,
                width: barWidth,
                textAlign: 'center',
                fontFamily: 'Noto Sans JP Bold',
                fontWeight: 700,
                fontSize: 12,
                color: '#1A1A1A',
              }}
            >
              {bar.value}
            </Text>
            {/* X-axis label */}
            <Text
              style={{
                position: 'absolute',
                left: x - 5,
                top: chartTop + chartHeight + 6,
                width: barWidth + 10,
                textAlign: 'center',
                fontFamily: 'Noto Sans JP',
                fontSize: 11,
                color: '#333333',
              }}
            >
              {bar.label}
            </Text>
          </View>
        );
      })}

      {/* X-axis title */}
      {xAxisLabel ? (
        <Text
          style={{
            position: 'absolute',
            left: chartLeft,
            top: chartTop + chartHeight + 24,
            width: chartWidth,
            textAlign: 'center',
            fontFamily: 'Noto Sans JP',
            fontSize: 11,
            color: '#333333',
          }}
        >
          {xAxisLabel}
        </Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TextChartPDFProps {
  sectionLabel: string;
  year: string;
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

export default function TextChartPDF({
  sectionLabel,
  year,
  pageNumber,
  heading,
  bullets,
  chartMode,
  chartTitle,
  xAxisLabel,
  yAxisLabel,
  yAxisUnit,
  yAxisMax,
  bars,
  chartImage,
  chartImageCaption,
}: TextChartPDFProps) {
  return (
    <View style={s.page}>
      {/* Wordmark */}
      <View style={s.wordmark}>
        <LogoPDF height={22} />
      </View>

      {/* Year */}
      <Text style={s.year}>{year}</Text>

      {/* Section label */}
      {sectionLabel ? <Text style={s.label}>{sectionLabel}</Text> : null}

      {/* Horizontal rule */}
      <View style={s.rule} />

      {/* Left column: heading + bullets */}
      <View style={s.left}>
        <Text style={s.heading}>{heading}</Text>
        {bullets.map((bullet, i) => (
          <View key={i} style={s.bulletItem}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>

      {/* Right column: chart or image */}
      <View style={s.right}>
        {chartMode === 'data' && bars && bars.length > 0 ? (
          <>
            {chartTitle ? <Text style={s.chartTitle}>{chartTitle}</Text> : null}
            <PDFBarChart
              bars={bars}
              yAxisMax={yAxisMax}
              yAxisUnit={yAxisUnit || ''}
              xAxisLabel={xAxisLabel || ''}
              yAxisLabel={yAxisLabel || ''}
            />
          </>
        ) : chartMode === 'image' ? (
          <>
            {chartImage ? (
              <>
                <Image src={chartImage} style={s.chartImage} />
                {chartImageCaption ? (
                  <Text style={s.imageCaption}>{chartImageCaption}</Text>
                ) : null}
              </>
            ) : (
              <View style={s.imagePlaceholder}>
                <Text style={{ fontSize: 13, color: '#999999' }}>
                  No image uploaded
                </Text>
              </View>
            )}
          </>
        ) : null}
      </View>

      {/* Page number */}
      {pageNumber !== undefined && (
        <Text style={s.pageNumber}>{pageNumber}</Text>
      )}
    </View>
  );
}
