import { View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import LogoPDF from './LogoPDF';

/* ------------------------------------------------------------------ */
/*  Register fonts                                                     */
/* ------------------------------------------------------------------ */

Font.register({
  family: 'Noto Sans JP',
  src: '/fonts/NotoSansJP-Regular.ttf',
  fontWeight: 400,
});

Font.register({
  family: 'REM',
  src: '/fonts/REM-SemiBold.ttf',
  fontWeight: 600,
});

/* ------------------------------------------------------------------ */
/*  Styles — mirrors index-toc-page.css positions exactly              */
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
    left: 48,
    top: 28,
  },
  year: {
    position: 'absolute',
    right: 48,
    top: 28,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 14,
    color: '#1A1A1A',
  },
  label: {
    position: 'absolute',
    left: 48,
    top: 52,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 12,
    color: '#1A1A1A',
  },
  rule: {
    position: 'absolute',
    top: 78,
    left: 0,
    width: 960,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },
  toc: {
    position: 'absolute',
    left: 48,
    top: 100,
    width: 580,
  },
  sectionHeading: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 14,
    color: '#1A1A1A',
    paddingTop: 24,
    paddingBottom: 4,
  },
  sectionHeadingFirst: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 14,
    color: '#1A1A1A',
    paddingTop: 0,
    paddingBottom: 4,
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    height: 32,
  },
  entryLabel: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
  },
  entryPage: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
  },
  image: {
    position: 'absolute',
    left: 680,
    top: 100,
    width: 230,
    height: 370,
    borderRadius: 9999,
    objectFit: 'cover',
  },
  imagePlaceholder: {
    position: 'absolute',
    left: 680,
    top: 100,
    width: 230,
    height: 370,
    borderRadius: 9999,
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
  },
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PDFEntry {
  id: string;
  label: string;
  pageNumber: string;
}

interface PDFSection {
  id: string;
  name: string;
  entries: PDFEntry[];
}

interface IndexTOCPagePDFProps {
  sectionLabel: string;
  year: string;
  heroImage?: string;
  sections: PDFSection[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IndexTOCPagePDF({
  sectionLabel,
  year,
  heroImage,
  sections,
}: IndexTOCPagePDFProps) {
  const isFlat =
    sections.length <= 1 &&
    (!sections[0]?.name || sections[0].name.trim() === '');

  const allEntries = sections.flatMap((sec) => sec.entries);

  // Determine font size — shrink if many entries
  const totalItems =
    allEntries.length +
    (isFlat ? 0 : sections.filter((sec) => sec.name.trim()).length);
  const fontSize = totalItems > 12 ? Math.max(9, 13 - (totalItems - 12) * 0.5) : 13;
  const entryHeight = totalItems > 12 ? Math.max(22, 32 - (totalItems - 12) * 1) : 32;

  return (
    <View style={s.page}>
      <View style={s.wordmark}>
        <LogoPDF height={22} />
      </View>

      <Text style={s.year}>{year}</Text>
      <Text style={s.label}>{sectionLabel}</Text>
      <View style={s.rule} />

      <View style={s.toc}>
        {isFlat
          ? allEntries.map((entry) => (
              <View key={entry.id} style={[s.entry, { height: entryHeight }]}>
                <Text style={[s.entryLabel, { fontSize }]}>{entry.label}</Text>
                {entry.pageNumber ? (
                  <Text style={[s.entryPage, { fontSize }]}>pg. {entry.pageNumber}</Text>
                ) : null}
              </View>
            ))
          : sections.map((section, sIdx) => (
              <View key={section.id}>
                {section.name.trim() ? (
                  <Text style={sIdx === 0 ? s.sectionHeadingFirst : s.sectionHeading}>
                    {section.name}
                  </Text>
                ) : null}
                {section.entries.map((entry) => (
                  <View key={entry.id} style={[s.entry, { height: entryHeight }]}>
                    <Text style={[s.entryLabel, { fontSize }]}>{entry.label}</Text>
                    {entry.pageNumber ? (
                      <Text style={[s.entryPage, { fontSize }]}>pg. {entry.pageNumber}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
      </View>

      {heroImage ? (
        <Image src={heroImage} style={s.image} />
      ) : (
        <View style={s.imagePlaceholder} />
      )}
    </View>
  );
}
