import type {
  PDFDataRangeTransport,
  PDFDocumentProxy,
  PDFPageProxy,
  PasswordResponses,
} from 'pdfjs-dist';
import type {
  BinaryData,
  DocumentInitParameters,
  RefProxy,
  StructTreeNode,
  TextContent,
  TextItem,
} from 'pdfjs-dist/types/src/display/api';
import type { AnnotationLayerParameters } from 'pdfjs-dist/types/src/display/annotation_layer';
import type LinkService from '../LinkService';

type NullableObject<T extends object> = { [P in keyof T]: T[P] | null };

type KeyOfUnion<T> = T extends unknown ? keyof T : never;

/* Primitive types */
export type Annotations = AnnotationLayerParameters['annotations'];

export type ClassName = string | null | undefined | (string | null | undefined)[];

export type ResolvedDest = (RefProxy | number)[];

export type Dest = Promise<ResolvedDest> | ResolvedDest | string | null;

export type ExternalLinkRel = string;

export type ExternalLinkTarget = '_self' | '_blank' | '_parent' | '_top';

export type ImageResourcesPath = string;

export type OnError = (error: Error) => void;

export type OnItemClickArgs = {
  dest?: Dest;
  pageIndex: number;
  pageNumber: number;
};

export type OnLoadProgressArgs = {
  loaded: number;
  total: number;
};

export type RegisterPage = (pageIndex: number, ref: HTMLDivElement) => void;

export type RenderMode = 'canvas' | 'svg' | 'none';

export type ScrollPageIntoViewArgs = {
  dest?: ResolvedDest;
  pageIndex?: number;
  pageNumber: number;
};

export type Source =
  | { data: BinaryData | undefined }
  | { range: PDFDataRangeTransport }
  | { url: string };

export type UnregisterPage = (pageIndex: number) => void;

/* Complex types */
export type CustomTextRenderer = (
  props: { pageIndex: number; pageNumber: number; itemIndex: number } & TextItem,
) => string;

export type DocumentCallback = PDFDocumentProxy;

export type File = string | ArrayBuffer | Blob | Source | null;

export type PageCallback = PDFPageProxy & {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

export type NodeOrRenderer = React.ReactNode | (() => React.ReactNode);

export type OnDocumentLoadError = OnError;

export type OnDocumentLoadProgress = (args: OnLoadProgressArgs) => void;

export type OnDocumentLoadSuccess = (document: DocumentCallback) => void;

export type OnGetAnnotationsError = OnError;

export type OnGetAnnotationsSuccess = (annotations: Annotations) => void;

export type OnGetStructTreeError = OnError;

export type OnGetStructTreeSuccess = (tree: StructTreeNode) => void;

export type OnGetTextError = OnError;

export type OnGetTextSuccess = (textContent: TextContent) => void;

export type OnPageLoadError = OnError;

export type OnPageLoadSuccess = (page: PageCallback) => void;

export type OnPasswordCallback = (password: string | null) => void;

export type OnRenderAnnotationLayerError = (error: unknown) => void;

export type OnRenderAnnotationLayerSuccess = () => void;

export type OnRenderError = OnError;

export type OnRenderSuccess = (page: PageCallback) => void;

export type OnRenderTextLayerError = OnError;

export type OnRenderTextLayerSuccess = () => void;

export type PasswordResponse = (typeof PasswordResponses)[keyof typeof PasswordResponses];

export type Options = NullableObject<
  Omit<DocumentInitParameters, KeyOfUnion<Source> | 'canvasMaxAreaInBytes'>
> & {
  // See https://github.com/mozilla/pdf.js/issues/16503
  canvasMaxAreaInBytes?: number | null;
};

/* Context types */
export type DocumentContextType = {
  imageResourcesPath?: ImageResourcesPath;
  linkService: LinkService;
  onItemClick?: (args: OnItemClickArgs) => void;
  pdf?: PDFDocumentProxy | false;
  registerPage: RegisterPage;
  renderMode?: RenderMode;
  rotate?: number | null;
  unregisterPage: UnregisterPage;
} | null;

export type PageContextType = {
  _className?: string;
  canvasBackground?: string;
  customTextRenderer?: CustomTextRenderer;
  devicePixelRatio?: number;
  onGetAnnotationsError?: OnGetAnnotationsError;
  onGetAnnotationsSuccess?: OnGetAnnotationsSuccess;
  onGetStructTreeError?: OnGetStructTreeError;
  onGetStructTreeSuccess?: OnGetStructTreeSuccess;
  onGetTextError?: OnGetTextError;
  onGetTextSuccess?: OnGetTextSuccess;
  onRenderAnnotationLayerError?: OnRenderAnnotationLayerError;
  onRenderAnnotationLayerSuccess?: OnRenderAnnotationLayerSuccess;
  onRenderError?: OnRenderError;
  onRenderSuccess?: OnRenderSuccess;
  onRenderTextLayerError?: OnRenderTextLayerError;
  onRenderTextLayerSuccess?: OnRenderTextLayerSuccess;
  page: PDFPageProxy | false | undefined;
  pageIndex: number;
  pageNumber: number;
  renderForms: boolean;
  renderTextLayer: boolean;
  rotate: number;
  scale: number;
} | null;

export type OutlineContextType = {
  onItemClick?: (args: OnItemClickArgs) => void;
} | null;

export type StructTreeNodeWithExtraAttributes = StructTreeNode & {
  alt?: string;
  lang?: string;
};
