import pdfjsDist from 'pdfjs-dist';

declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    pdfjsLib: typeof pdfjsDist;
  }
}
