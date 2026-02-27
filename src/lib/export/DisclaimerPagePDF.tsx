import { View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import LogoPDF from './LogoPDF';

/* ------------------------------------------------------------------ */
/*  Register fonts                                                     */
/* ------------------------------------------------------------------ */

Font.register({
  family: 'Noto Sans JP',
  src: '/fonts/NotoSansJP-Regular.ttf',
  fontWeight: 400,
});

/* ------------------------------------------------------------------ */
/*  Styles — mirrors disclaimer-page.css positions exactly             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  /* Wordmark — top-left */
  wordmark: {
    position: 'absolute',
    left: 48,
    top: 28,
  },

  /* Year — top-right */
  year: {
    position: 'absolute',
    right: 48,
    top: 28,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 14,
    color: '#1A1A1A',
  },

  /* Section label */
  label: {
    position: 'absolute',
    left: 48,
    top: 52,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 12,
    color: '#1A1A1A',
  },

  /* Horizontal rule at y=78 */
  rule: {
    position: 'absolute',
    top: 78,
    left: 0,
    width: 960,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },

  /* Disclaimer text block */
  text: {
    position: 'absolute',
    left: 48,
    top: 110,
    width: 864,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#1A1A1A',
    lineHeight: 1.6,
  },
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface DisclaimerPagePDFProps {
  disclaimerText: string;
  year: string;
  sectionLabel: string;
}

export default function DisclaimerPagePDF({
  disclaimerText,
  year,
  sectionLabel,
}: DisclaimerPagePDFProps) {
  return (
    <View style={s.page}>
      {/* Wordmark — top-left */}
      <View style={s.wordmark}>
        <LogoPDF height={22} />
      </View>

      {/* Year — top-right */}
      <Text style={s.year}>{year}</Text>

      {/* Section label */}
      <Text style={s.label}>{sectionLabel}</Text>

      {/* Horizontal rule */}
      <View style={s.rule} />

      {/* Disclaimer text */}
      <Text style={s.text}>{disclaimerText}</Text>
    </View>
  );
}
