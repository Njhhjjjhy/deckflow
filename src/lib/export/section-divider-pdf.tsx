import { View, Text, StyleSheet } from '@react-pdf/renderer';

/* ------------------------------------------------------------------ */
/*  Styles — mirrors section-divider.css positions                     */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  /* Left block — right-aligned, ending at x ~300 */
  left: {
    position: 'absolute',
    top: 200,
    left: 0,
    width: 300,
    height: 130,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  label: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.2,
    color: '#1A1A1A',
    textAlign: 'right',
  },

  number: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 48,
    lineHeight: 1.1,
    color: '#1A1A1A',
    textAlign: 'right',
  },

  /* Gold vertical bar */
  bar: {
    position: 'absolute',
    left: 310,
    top: 200,
    width: 6,
    height: 130,
    backgroundColor: '#FBB931',
  },

  /* Right block — starts at x ~340, vertically centered with bar */
  titleContainer: {
    position: 'absolute',
    left: 340,
    top: 200,
    width: 560,
    height: 130,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  title: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 36,
    lineHeight: 1.2,
    color: '#1A1A1A',
  },
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SectionDividerPDFProps {
  sectionLabel: string;
  sectionNumber: string;
  sectionTitle: string;
}

export default function SectionDividerPDF({ sectionLabel, sectionNumber, sectionTitle }: SectionDividerPDFProps) {
  return (
    <View style={s.page}>
      {/* Left block: label + number */}
      <View style={s.left}>
        <Text style={s.label}>{sectionLabel}</Text>
        <Text style={s.number}>{sectionNumber}</Text>
      </View>

      {/* Gold vertical bar */}
      <View style={s.bar} />

      {/* Right block: title */}
      <View style={s.titleContainer}>
        <Text style={s.title}>{sectionTitle}</Text>
      </View>
    </View>
  );
}
