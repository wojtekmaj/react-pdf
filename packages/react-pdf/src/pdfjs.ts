import * as pdfjsModule from 'pdfjs-dist';

const pdfjs = (
  'default' in pdfjsModule ? pdfjsModule['default'] : pdfjsModule
) as typeof pdfjsModule;

export default pdfjs;
