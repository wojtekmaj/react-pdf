// From pdfjs-dist/lib/web/struct_tree_layer_builder.js

export const PDF_ROLE_TO_HTML_ROLE = {
  // Document level structure types
  Document: null, // There's a "document" role, but it doesn't make sense here.
  DocumentFragment: null,
  // Grouping level structure types
  Part: 'group',
  Sect: 'group', // XXX: There's a "section" role, but it's abstract.
  Div: 'group',
  Aside: 'note',
  NonStruct: 'none',
  // Block level structure types
  P: null,
  // H<n>,
  H: 'heading',
  Title: null,
  FENote: 'note',
  // Sub-block level structure type
  Sub: 'group',
  // General inline level structure types
  Lbl: null,
  Span: null,
  Em: null,
  Strong: null,
  Link: 'link',
  Annot: 'note',
  Form: 'form',
  // Ruby and Warichu structure types
  Ruby: null,
  RB: null,
  RT: null,
  RP: null,
  Warichu: null,
  WT: null,
  WP: null,
  // List standard structure types
  L: 'list',
  LI: 'listitem',
  LBody: null,
  // Table standard structure types
  Table: 'table',
  TR: 'row',
  TH: 'columnheader',
  TD: 'cell',
  THead: 'columnheader',
  TBody: null,
  TFoot: null,
  // Standard structure type Caption
  Caption: null,
  // Standard structure type Figure
  Figure: 'figure',
  // Standard structure type Formula
  Formula: null,
  // standard structure type Artifact
  Artifact: null,
};

export const HEADING_PATTERN: RegExp = /^H(\d+)$/;
