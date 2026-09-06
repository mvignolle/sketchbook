// Core collection hierarchy
export interface Sketch {
  id: string;
  collectionId: string;
  groupId: string;
  title: string;
  description: string;
  layout: SketchLayout;
  conceptVariations: string[];
  votes: number;
  createdAt: Date;
}

export interface SketchGroup {
  id: string;
  collectionId: string;
  title: string;
  sketchIds: string[];
}

export interface Collection {
  id: string;
  title: string;
  prompt: string;
  description?: string;
  groups: SketchGroup[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  shareToken?: string;
  metadata: CollectionMetadata;
}

export interface CollectionMetadata {
  totalSketches: number;
  ideaCount: number;
  totalVotes: number;
  generationHistory: GenerationRecord[];
}

export interface GenerationRecord {
  id: string;
  timestamp: Date;
  ideaCount: number;
  prompt: string;
  additionalInstruction?: string;
  resultSketchIds: string[];
}

// Wireframe structure - composition-based
export interface SketchLayout {
  type: 'wireframe';
  width: number;
  height: number;
  sections: WireframeSection[];
}

export interface WireframeSection {
  id: string;
  componentType:
    | 'header'
    | 'nav'
    | 'hero'
    | 'content'
    | 'sidebar'
    | 'footer'
    | 'modal';
  position: Position;
  size: Size;
  children: WireframeComponent[];
  backgroundColor?: 'white' | 'lightgray';
}

export interface WireframeComponent {
  id: string;
  type:
    | 'card'
    | 'button'
    | 'text'
    | 'list'
    | 'grid'
    | 'form'
    | 'input'
    | 'shape'
    | 'image-placeholder'
    | 'separator';
  position: Position;
  size: Size;
  properties: ComponentProperties;
  children?: WireframeComponent[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ComponentProperties {
  label?: string;
  placeholder?: string;
  columns?: number;
  items?: number;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  strokeStyle?: 'solid' | 'dashed';
  textAlign?: 'left' | 'center' | 'right';
  [key: string]: any;
}

// Voting
export interface VoteRecord {
  sketchId: string;
  collectionId: string;
  timestamp: Date;
  userId: string;
}

// Sharing
export interface ShareData {
  collectionId: string;
  token: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Pattern-based generation
export interface PatternCombination {
  hierarchyType: HierarchyPattern;
  interactionType: InteractionPattern;
  navigationPattern: NavigationPattern;
  contentBlockPattern: ContentBlockPattern;
  visualWeightPattern: VisualWeightPattern;
}

export type HierarchyPattern =
  | 'hero-first'
  | 'sidebar-first'
  | 'two-column'
  | 'masonry'
  | 'single-column';

export type InteractionPattern =
  | 'modal-centric'
  | 'tab-based'
  | 'accordion'
  | 'infinite-scroll'
  | 'paginated'
  | 'filtered-list';

export type NavigationPattern =
  | 'top-nav'
  | 'sidebar'
  | 'bottom-tabs'
  | 'breadcrumb'
  | 'floating-action';

export type ContentBlockPattern =
  | 'card-grid'
  | 'list-items'
  | 'feature-blocks'
  | 'stat-dashboard'
  | 'form-sections';

export type VisualWeightPattern =
  | 'centered-focus'
  | 'multi-section'
  | 'spotlight-supporting'
  | 'dense-info'
  | 'spacious';
