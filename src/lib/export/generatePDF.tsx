import { Document, Page, pdf } from '@react-pdf/renderer';
import type { Presentation, TranslatableField } from '../../types/presentation';
import CoverPagePDF from './CoverPagePDF';
import SectionDividerPDF from './SectionDividerPDF';
import ContactPagePDF from './ContactPagePDF';
import DisclaimerPagePDF from './DisclaimerPagePDF';
import { loadImage } from '../images/imageStore';

/**
 * Build a react-pdf <Document> from a Presentation.
 * Currently only the cover page template is implemented.
 */
async function buildDocument(presentation: Presentation) {
  const { width, height } = presentation.dimensions;

  // Resolve images from IndexedDB
  const pages = await Promise.all(
    presentation.pages.map(async (page) => {
      const heroImageKey = page.type === 'cover' ? (page.content.heroImage as string) : '';
      const logoImageKey = page.type === 'contact' ? (page.content.logoImage as string) : '';

      const [heroImage, logoImage] = await Promise.all([
        heroImageKey ? loadImage(heroImageKey) : Promise.resolve(undefined),
        logoImageKey ? loadImage(logoImageKey) : Promise.resolve(undefined),
      ]);

      return {
        page,
        heroImage: heroImage ?? undefined,
        logoImage: logoImage ?? undefined,
      };
    })
  );

  return (
    <Document>
      {pages.map(({ page, heroImage, logoImage }) => {
        if (page.type === 'cover') {
          const headline = page.content.headline as TranslatableField;
          const year = (page.content.year as string) || new Date().getFullYear().toString();

          return (
            <Page
              key={page.id}
              size={[width, height]}
              style={{ width, height }}
            >
              <CoverPagePDF
                headline={headline.en}
                year={year}
                heroImage={heroImage}
              />
            </Page>
          );
        }

        if (page.type === 'section-divider') {
          const sectionLabel = page.content.sectionLabel as TranslatableField;
          const sectionNumber = page.content.sectionNumber as TranslatableField;
          const sectionTitle = page.content.sectionTitle as TranslatableField;

          return (
            <Page
              key={page.id}
              size={[width, height]}
              style={{ width, height }}
            >
              <SectionDividerPDF
                sectionLabel={sectionLabel?.en || ''}
                sectionNumber={sectionNumber?.en || ''}
                sectionTitle={sectionTitle?.en || ''}
              />
            </Page>
          );
        }

        if (page.type === 'disclaimer') {
          const disclaimerText = page.content.disclaimerText as TranslatableField;
          const sectionLabel = page.content.sectionLabel as TranslatableField;
          const year = (page.content.year as string) || new Date().getFullYear().toString();

          return (
            <Page
              key={page.id}
              size={[width, height]}
              style={{ width, height }}
            >
              <DisclaimerPagePDF
                disclaimerText={disclaimerText?.en || ''}
                sectionLabel={sectionLabel?.en || 'Disclaimer'}
                year={year}
              />
            </Page>
          );
        }

        if (page.type === 'contact') {
          const companyName = page.content.companyName as TranslatableField;
          const phone = page.content.phone as TranslatableField;
          const email = page.content.email as TranslatableField;
          const address = page.content.address as TranslatableField;
          const url = page.content.url as TranslatableField;
          const year = (page.content.year as string) || new Date().getFullYear().toString();

          return (
            <Page
              key={page.id}
              size={[width, height]}
              style={{ width, height }}
            >
              <ContactPagePDF
                companyName={companyName?.en || ''}
                phone={phone?.en || ''}
                email={email?.en || ''}
                address={address?.en || ''}
                url={url?.en || ''}
                year={year}
                logoImage={logoImage}
              />
            </Page>
          );
        }

        // Placeholder for future templates — blank page
        return (
          <Page
            key={page.id}
            size={[width, height]}
            style={{ width, height }}
          />
        );
      })}
    </Document>
  );
}

/**
 * Generate a PDF blob from a Presentation and trigger a download.
 */
export async function exportPDF(presentation: Presentation): Promise<void> {
  const doc = await buildDocument(presentation);
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${presentation.name || 'presentation'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
