export const enum ShapePathFormulasKeys {
  ROUND_RECT = 'roundRect',
  ROUND_RECT_DIAGONAL = 'roundRectDiagonal',
  ROUND_RECT_SINGLE = 'roundRectSingle',
  ROUND_RECT_SAMESIDE = 'roundRectSameSide',
  CUT_RECT_DIAGONAL = 'cutRectDiagonal',
  CUT_RECT_SINGLE = 'cutRectSingle',
  CUT_RECT_SAMESIDE = 'cutRectSameSide',
  CUT_ROUND_RECT = 'cutRoundRect',
  MESSAGE = 'message',
  ROUND_MESSAGE = 'roundMessage',
  L = 'L',
  RING_RECT = 'ringRect',
  PLUS = 'plus',
  TRIANGLE = 'triangle',
  PARALLELOGRAM_LEFT = 'parallelogramLeft',
  PARALLELOGRAM_RIGHT = 'parallelogramRight',
  TRAPEZOID = 'trapezoid',
  BULLET = 'bullet',
  INDICATOR = 'indicator',
  DONUT = 'donut',
  DIAGSTRIPE = 'diagStripe',
}

export const enum ElementTypes {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  LATEX = 'latex',
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**
 * Gradient
 *
 * type: Gradient type (radial, linear)
 *
 * colors: Gradient color list (pos: percentage position; color: color value)
 *
 * rotate: Gradient angle (linear gradient)
 */
export type GradientType = 'linear' | 'radial';
export type GradientColor = {
  pos: number;
  color: string;
};
export interface Gradient {
  type: GradientType;
  colors: GradientColor[];
  rotate: number;
}

export type LineStyleType = 'solid' | 'dashed' | 'dotted';

/**
 * Element shadow
 *
 * h: Horizontal offset
 *
 * v: Vertical offset
 *
 * blur: Blur amount
 *
 * color: Shadow color
 */
export interface PPTElementShadow {
  h: number;
  v: number;
  blur: number;
  color: string;
}

/**
 * Element border
 *
 * style?: Border style (solid or dashed)
 *
 * width?: Border width
 *
 * color?: Border color
 */
export interface PPTElementOutline {
  style?: LineStyleType;
  width?: number;
  color?: string;
}

export type ElementLinkType = 'web' | 'slide';

/**
 * Element hyperlink
 *
 * type: Link type (web page, slide page)
 *
 * target: Target address (web URL, slide page ID)
 */
export interface PPTElementLink {
  type: ElementLinkType;
  target: string;
}

/**
 * Element common properties
 *
 * id: Element ID
 *
 * left: Horizontal position (distance from canvas left edge)
 *
 * top: Vertical position (distance from canvas top edge)
 *
 * lock?: Lock element
 *
 * groupId?: Group ID (elements with the same group ID belong to the same group)
 *
 * width: Element width
 *
 * height: Element height
 *
 * rotate: Rotation angle
 *
 * link?: Hyperlink
 *
 * name?: Element name
 */
interface PPTBaseElement {
  id: string;
  left: number;
  top: number;
  lock?: boolean;
  groupId?: string;
  width: number;
  height: number;
  rotate: number;
  link?: PPTElementLink;
  name?: string;
}

export type TextType =
  | 'title'
  | 'subtitle'
  | 'content'
  | 'item'
  | 'itemTitle'
  | 'notes'
  | 'header'
  | 'footer'
  | 'partNumber'
  | 'itemNumber';

/**
 * Text element
 *
 * type: Element type (text)
 *
 * content: Text content (HTML string)
 *
 * defaultFontName: Default font (overridden by inline HTML styles in content)
 *
 * defaultColor: Default color (overridden by inline HTML styles in content)
 *
 * outline?: Border
 *
 * fill?: Fill color
 *
 * lineHeight?: Line height (multiplier), default 1.5
 *
 * wordSpace?: Letter spacing, default 0
 *
 * opacity?: Opacity, default 1
 *
 * shadow?: Shadow
 *
 * paragraphSpace?: Paragraph spacing, default 5px
 *
 * vertical?: Vertical text
 *
 * textType?: Text type
 */
export interface PPTTextElement extends PPTBaseElement {
  type: 'text';
  content: string;
  defaultFontName: string;
  defaultColor: string;
  outline?: PPTElementOutline;
  fill?: string;
  lineHeight?: number;
  wordSpace?: number;
  opacity?: number;
  shadow?: PPTElementShadow;
  paragraphSpace?: number;
  vertical?: boolean;
  textType?: TextType;
}

/**
 * Image/shape flip
 *
 * flipH?: Horizontal flip
 *
 * flipV?: Vertical flip
 */
export interface ImageOrShapeFlip {
  flipH?: boolean;
  flipV?: boolean;
}

/**
 * Image filters
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/filter
 *
 * blur?: Blur, default 0 (px)
 *
 * brightness?: Brightness, default 100 (%)
 *
 * contrast?: Contrast, default 100 (%)
 *
 * grayscale?: Grayscale, default 0 (%)
 *
 * saturate?: Saturation, default 100 (%)
 *
 * hue-rotate?: Hue rotation, default 0 (deg)
 *
 * opacity?: Opacity, default 100 (%)
 */
export type ImageElementFilterKeys =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'grayscale'
  | 'saturate'
  | 'hue-rotate'
  | 'opacity'
  | 'sepia'
  | 'invert';
export interface ImageElementFilters {
  blur?: string;
  brightness?: string;
  contrast?: string;
  grayscale?: string;
  saturate?: string;
  'hue-rotate'?: string;
  sepia?: string;
  invert?: string;
  opacity?: string;
}

export type ImageClipDataRange = [[number, number], [number, number]];

/**
 * Image clip/crop
 *
 * range: Clip range, e.g. [[10, 10], [90, 90]] means cropping from 10%, 10% to 90%, 90% of the original image
 *
 * shape: Clip shape, see configs/image-clip.ts CLIPPATHS
 */
export interface ImageElementClip {
  range: ImageClipDataRange;
  shape: string;
}

export type ImageType = 'pageFigure' | 'itemFigure' | 'background';

/**
 * Image element
 *
 * type: Element type (image)
 *
 * fixedRatio: Lock image aspect ratio
 *
 * src: Image URL
 *
 * outline?: Border
 *
 * filters?: Image filters
 *
 * clip?: Clip/crop info
 *
 * flipH?: Horizontal flip
 *
 * flipV?: Vertical flip
 *
 * shadow?: Shadow
 *
 * radius?: Border radius
 *
 * colorMask?: Color mask overlay
 *
 * imageType?: Image type
 */
export interface PPTImageElement extends PPTBaseElement {
  type: 'image';
  fixedRatio: boolean;
  src: string;
  outline?: PPTElementOutline;
  filters?: ImageElementFilters;
  clip?: ImageElementClip;
  flipH?: boolean;
  flipV?: boolean;
  shadow?: PPTElementShadow;
  radius?: number;
  colorMask?: string;
  imageType?: ImageType;
}

export type ShapeTextAlign = 'top' | 'middle' | 'bottom';

/**
 * Shape text content
 *
 * content: Text content (HTML string)
 *
 * defaultFontName: Default font (overridden by inline HTML styles in content)
 *
 * defaultColor: Default color (overridden by inline HTML styles in content)
 *
 * align: Text alignment direction (vertical)
 *
 * lineHeight?: Line height (multiplier), default 1.5
 *
 * wordSpace?: Letter spacing, default 0
 *
 * paragraphSpace?: Paragraph spacing, default 5px
 *
 * type: Text type
 */
export interface ShapeText {
  content: string;
  defaultFontName: string;
  defaultColor: string;
  align: ShapeTextAlign;
  lineHeight?: number;
  wordSpace?: number;
  paragraphSpace?: number;
  type?: TextType;
}

/**
 * Shape element
 *
 * type: Element type (shape)
 *
 * viewBox: SVG viewBox attribute, e.g. [1000, 1000] means '0 0 1000 1000'
 *
 * path: Shape path, SVG path d attribute
 *
 * fixedRatio: Lock shape aspect ratio
 *
 * fill: Fill color, effective when no gradient exists
 *
 * gradient?: Gradient, takes priority as fill when present
 *
 * pattern?: Pattern, takes priority as fill when present
 *
 * outline?: Border
 *
 * opacity?: Opacity
 *
 * flipH?: Horizontal flip
 *
 * flipV?: Vertical flip
 *
 * shadow?: Shadow
 *
 * special?: Special shape (marks shapes that are hard to parse, e.g. paths using types other than L Q C A; these shapes will be exported as images)
 *
 * text?: Shape text content
 *
 * pathFormula?: Shape path calculation formula.
 * Normally, shape resizing is handled by scaling width/height based on the viewBox ratio, and the viewBox and path do not change.
 * However, some shapes need precise control of key point positions, requiring a path formula to update the viewBox and recalculate the path when scaling.
 *
 * keypoints?: Key point position percentages
 */
export interface PPTShapeElement extends PPTBaseElement {
  type: 'shape';
  viewBox: [number, number];
  path: string;
  fixedRatio: boolean;
  fill: string;
  gradient?: Gradient;
  pattern?: string;
  outline?: PPTElementOutline;
  opacity?: number;
  flipH?: boolean;
  flipV?: boolean;
  shadow?: PPTElementShadow;
  special?: boolean;
  text?: ShapeText;
  pathFormula?: ShapePathFormulasKeys;
  keypoints?: number[];
}

export type LinePoint = '' | 'arrow' | 'dot';

/**
 * Line element
 *
 * type: Element type (line)
 *
 * start: Start position ([x, y])
 *
 * end: End position ([x, y])
 *
 * style: Line style (solid, dashed, dotted)
 *
 * color: Line color
 *
 * points: Endpoint styles ([start style, end style], options: none, arrow, dot)
 *
 * shadow?: Shadow
 *
 * broken?: Polyline control point position ([x, y])
 *
 * broken2?: Double polyline control point position ([x, y])
 *
 * curve?: Quadratic curve control point position ([x, y])
 *
 * cubic?: Cubic curve control point positions ([[x1, y1], [x2, y2]])
 */
export interface PPTLineElement extends Omit<PPTBaseElement, 'height' | 'rotate'> {
  type: 'line';
  start: [number, number];
  end: [number, number];
  style: LineStyleType;
  color: string;
  points: [LinePoint, LinePoint];
  shadow?: PPTElementShadow;
  broken?: [number, number];
  broken2?: [number, number];
  curve?: [number, number];
  cubic?: [[number, number], [number, number]];
}

export type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'ring' | 'area' | 'radar' | 'scatter';

export interface ChartOptions {
  lineSmooth?: boolean;
  stack?: boolean;
}

export interface ChartData {
  labels: string[];
  legends: string[];
  series: number[][];
}

/**
 * Chart element
 *
 * type: Element type (chart)
 *
 * fill?: Fill color
 *
 * chartType: Chart base type (bar/line/pie), all chart types derive from these three basic types
 *
 * data: Chart data
 *
 * options: Extended options
 *
 * outline?: Border
 *
 * themeColors: Theme colors
 *
 * textColor?: Axis and text color
 *
 * lineColor?: Grid line color
 */
export interface PPTChartElement extends PPTBaseElement {
  type: 'chart';
  fill?: string;
  chartType: ChartType;
  data: ChartData;
  options?: ChartOptions;
  outline?: PPTElementOutline;
  themeColors: string[];
  textColor?: string;
  lineColor?: string;
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
/**
 * Table cell style
 *
 * bold?: Bold
 *
 * em?: Italic
 *
 * underline?: Underline
 *
 * strikethrough?: Strikethrough
 *
 * color?: Font color
 *
 * backcolor?: Background color
 *
 * fontsize?: Font size
 *
 * fontname?: Font name
 *
 * align?: Text alignment
 */
export interface TableCellStyle {
  bold?: boolean;
  em?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backcolor?: string;
  fontsize?: string;
  fontname?: string;
  align?: TextAlign;
}

/**
 * Table cell
 *
 * id: Cell ID
 *
 * colspan: Column span
 *
 * rowspan: Row span
 *
 * text: Text content
 *
 * style?: Cell style
 */
export interface TableCell {
  id: string;
  colspan: number;
  rowspan: number;
  text: string;
  style?: TableCellStyle;
}

/**
 * Table theme
 *
 * color: Theme color
 *
 * rowHeader: Header row
 *
 * rowFooter: Summary row
 *
 * colHeader: First column
 *
 * colFooter: Last column
 */
export interface TableTheme {
  color: string;
  rowHeader: boolean;
  rowFooter: boolean;
  colHeader: boolean;
  colFooter: boolean;
}

/**
 * Table element
 *
 * type: Element type (table)
 *
 * outline: Border
 *
 * theme?: Theme
 *
 * colWidths: Column width array, e.g. [0.3, 0.5, 0.2] means three columns at 30%, 50%, 20% of total width
 *
 * cellMinHeight: Minimum cell height
 *
 * data: Table data
 */
export interface PPTTableElement extends PPTBaseElement {
  type: 'table';
  outline: PPTElementOutline;
  theme?: TableTheme;
  colWidths: number[];
  cellMinHeight: number;
  data: TableCell[][];
}

/**
 * LaTeX element (formula)
 *
 * type: Element type (latex)
 *
 * latex: LaTeX code
 *
 * html: KaTeX rendered HTML string (used by new formula renderer)
 *
 * path: SVG path (legacy SVG rendering, backward compatible, optional)
 *
 * color: Color (legacy SVG rendering, backward compatible, optional)
 *
 * strokeWidth: Path stroke width (legacy SVG rendering, backward compatible, optional)
 *
 * viewBox: SVG viewBox attribute (legacy SVG rendering, backward compatible, optional)
 *
 * fixedRatio: Lock aspect ratio (optional)
 *
 * align: Formula horizontal alignment (left/center/right, default center)
 */
export interface PPTLatexElement extends PPTBaseElement {
  type: 'latex';
  latex: string;
  html?: string;
  path?: string;
  color?: string;
  strokeWidth?: number;
  viewBox?: [number, number];
  fixedRatio?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * Video element
 *
 * type: Element type (video)
 *
 * src: Video URL
 *
 * autoplay: Autoplay
 *
 * poster: Preview poster image
 *
 * ext: Video file extension, used to determine resource type when the URL lacks an extension
 */
export interface PPTVideoElement extends PPTBaseElement {
  type: 'video';
  src: string;
  autoplay: boolean;
  poster?: string;
  ext?: string;
}

/**
 * Audio element
 *
 * type: Element type (audio)
 *
 * fixedRatio: Lock icon aspect ratio
 *
 * color: Icon color
 *
 * loop: Loop playback
 *
 * autoplay: Autoplay
 *
 * src: Audio URL
 *
 * ext: Audio file extension, used to determine resource type when the URL lacks an extension
 */
export interface PPTAudioElement extends PPTBaseElement {
  type: 'audio';
  fixedRatio: boolean;
  color: string;
  loop: boolean;
  autoplay: boolean;
  src: string;
  ext?: string;
}

export type PPTElement =
  | PPTTextElement
  | PPTImageElement
  | PPTShapeElement
  | PPTLineElement
  | PPTChartElement
  | PPTTableElement
  | PPTLatexElement
  | PPTVideoElement
  | PPTAudioElement;

export type AnimationType = 'in' | 'out' | 'attention';
export type AnimationTrigger = 'click' | 'meantime' | 'auto';

/**
 * Element animation
 *
 * id: Animation ID
 *
 * elId: Element ID
 *
 * effect: Animation effect
 *
 * type: Animation type (entrance, exit, emphasis)
 *
 * duration: Animation duration
 *
 * trigger: Animation trigger (click - on click, meantime - with previous, auto - after previous)
 */
export interface PPTAnimation {
  id: string;
  elId: string;
  effect: string;
  type: AnimationType;
  duration: number;
  trigger: AnimationTrigger;
}

export type SlideBackgroundType = 'solid' | 'image' | 'gradient';
export type SlideBackgroundImageSize = 'cover' | 'contain' | 'repeat';
export interface SlideBackgroundImage {
  src: string;
  size: SlideBackgroundImageSize;
}

/**
 * Slide background
 *
 * type: Background type (solid, image, gradient)
 *
 * color?: Background color (solid)
 *
 * image?: Image background
 *
 * gradientType?: Gradient background
 */
export interface SlideBackground {
  type: SlideBackgroundType;
  color?: string;
  image?: SlideBackgroundImage;
  gradient?: Gradient;
}

export type TurningMode =
  | 'no'
  | 'fade'
  | 'slideX'
  | 'slideY'
  | 'random'
  | 'slideX3D'
  | 'slideY3D'
  | 'rotate'
  | 'scaleY'
  | 'scaleX'
  | 'scale'
  | 'scaleReverse';

export interface SectionTag {
  id: string;
  title?: string;
}

export type SlideType = 'cover' | 'contents' | 'transition' | 'content' | 'end';

/**
 * Slide page
 *
 * id: Page ID
 *
 * viewportSize: Viewport size
 *
 * viewportRatio: Viewport aspect ratio
 *
 * theme: Slide theme
 *
 * elements: Element collection
 *
 * background?: Page background
 *
 * animations?: Element animation collection
 *
 * turningMode?: Page transition mode
 *
 * sectionTag?: Section tag
 *
 * type?: Page type
 */
export interface Slide {
  id: string;
  viewportSize: number;
  viewportRatio: number;
  theme: SlideTheme;
  elements: PPTElement[];
  background?: SlideBackground;
  animations?: PPTAnimation[];
  turningMode?: TurningMode;
  sectionTag?: SectionTag;
  type?: SlideType;
}

/**
 * Slide theme
 *
 * backgroundColor: Page background color
 *
 * themeColor: Theme color, used for default shape colors etc.
 *
 * fontColor: Font color
 *
 * fontName: Font name
 */
export interface SlideTheme {
  backgroundColor: string;
  themeColors: string[];
  fontColor: string;
  fontName: string;
  outline?: PPTElementOutline;
  shadow?: PPTElementShadow;
}

export interface SlideTemplate {
  name: string;
  id: string;
  cover: string;
  origin?: string;
}

/**
 * @deprecated SlideData is deprecated, use Slide instead
 */
export interface SlideData {
  id: string;
  viewportSize: number;
  viewportRatio: number;
  theme: {
    themeColors: string[];
    fontColor: string;
    fontName: string;
    backgroundColor: string;
  };
  elements: PPTElement[];
  background?: SlideBackground;
  animations?: unknown[];
}
