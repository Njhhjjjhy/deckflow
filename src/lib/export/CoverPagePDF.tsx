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

/* ------------------------------------------------------------------ */
/*  Styles — mirrors cover-page.css positions exactly                  */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  /* Header bar */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 960,
    height: 56,
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },

  logo: {
    position: 'absolute',
    left: 40,
    top: 13,
  },

  year: {
    position: 'absolute',
    right: 40,
    top: 18,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 14,
    color: '#1A1A1A',
  },

  /* Headline — vertically centred at y=291 via top + translateY(-50%) */
  /* react-pdf has no CSS transforms, so we pre-compute:               */
  /* For a ~42px * 1.15 lineHeight ≈ 48px single line,                */
  /* centred at 291: top = 291 - (lineHeight * lines / 2)             */
  /* We use top: 267 as baseline (accounts for the transform).         */
  headline: {
    position: 'absolute',
    left: 104,
    top: 267,
    maxWidth: 400,
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 42,
    lineHeight: 1.15,
    color: '#1A1A1A',
  },

  headlineBold: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 42,
    lineHeight: 1.15,
    color: '#1A1A1A',
  },

  /* Hero image — circular, centred at y=291 */
  heroContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    left: 576,
    top: 151, // 291 - 140 (half of 280)
  },

  heroImage: {
    width: 280,
    height: 280,
    objectFit: 'cover',
  },

  heroPlaceholder: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    left: 576,
    top: 151,
    backgroundColor: '#E8E8E8',
  },
});

/* ------------------------------------------------------------------ */
/*  Headline parser — **bold** markdown -> Text nodes                  */
/* ------------------------------------------------------------------ */

function renderHeadline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={s.headlineBold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CoverPagePDFProps {
  headline: string;
  year: string;
  heroImage?: string; // base64 data URL
}

export default function CoverPagePDF({ headline, year, heroImage }: CoverPagePDFProps) {
  return (
    <View style={s.page}>
      {/* Header bar */}
      <View style={s.header}>
        <View style={s.logo}>
          <LogoPDF height={30} />
        </View>
        <Text style={s.year}>{year}</Text>
      </View>

      {/* Headline */}
      <Text style={s.headline}>{renderHeadline(headline)}</Text>

      {/* Hero image */}
      {heroImage ? (
        <View style={s.heroContainer}>
          <Image style={s.heroImage} src={heroImage} />
        </View>
      ) : (
        <View style={s.heroPlaceholder} />
      )}
    </View>
  );
}
