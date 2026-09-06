import { PatternCombination } from '../types';

export const HIERARCHY_PATTERNS = [
  'hero-first',
  'sidebar-first',
  'two-column',
  'masonry',
  'single-column',
] as const;

export const INTERACTION_PATTERNS = [
  'modal-centric',
  'tab-based',
  'accordion',
  'infinite-scroll',
  'paginated',
  'filtered-list',
] as const;

export const NAVIGATION_PATTERNS = [
  'top-nav',
  'sidebar',
  'bottom-tabs',
  'breadcrumb',
  'floating-action',
] as const;

export const CONTENT_BLOCK_PATTERNS = [
  'card-grid',
  'list-items',
  'feature-blocks',
  'stat-dashboard',
  'form-sections',
] as const;

export const VISUAL_WEIGHT_PATTERNS = [
  'centered-focus',
  'multi-section',
  'spotlight-supporting',
  'dense-info',
  'spacious',
] as const;

// Sketch titles and descriptions mapping to patterns
export const SKETCH_TEMPLATES: {
  [key: string]: { title: string; variations: string[] };
} = {
  'hero-first|modal-centric|top-nav|card-grid|centered-focus': {
    title: 'Hero with Modal Actions',
    variations: ['Large hero area', 'Modal dialogs for interactions', 'Card grid layout'],
  },
  'hero-first|tab-based|top-nav|card-grid|centered-focus': {
    title: 'Hero with Tab Navigation',
    variations: ['Hero section', 'Tabbed content sections', 'Card-based layout'],
  },
  'sidebar-first|accordion|sidebar|list-items|multi-section': {
    title: 'Sidebar with Accordion Details',
    variations: ['Persistent sidebar', 'Accordion for expansion', 'List-based content'],
  },
  'sidebar-first|filtered-list|sidebar|list-items|dense-info': {
    title: 'Sidebar Filter with List Results',
    variations: ['Sidebar filters', 'Filtered list results', 'Information-dense layout'],
  },
  'two-column|tab-based|top-nav|card-grid|multi-section': {
    title: 'Two-Column with Tabs',
    variations: ['Balanced two-column layout', 'Tab navigation', 'Card-based sections'],
  },
  'two-column|paginated|breadcrumb|feature-blocks|spacious': {
    title: 'Feature Blocks with Pagination',
    variations: ['Two-column grid', 'Paginated content', 'Feature-focused blocks', 'Generous spacing'],
  },
  'masonry|infinite-scroll|top-nav|card-grid|spacious': {
    title: 'Masonry Grid with Infinite Scroll',
    variations: ['Masonry layout', 'Infinite scroll loading', 'Card grid design', 'Open spacing'],
  },
  'single-column|paginated|top-nav|form-sections|centered-focus': {
    title: 'Single Column Step-by-Step Form',
    variations: ['Single column focus', 'Paginated steps', 'Form-based sections', 'Clear progression'],
  },
  'single-column|modal-centric|floating-action|card-grid|centered-focus': {
    title: 'Single Column with Floating Action',
    variations: ['Single column', 'Floating action button', 'Modal interactions', 'Central focus'],
  },
  'hero-first|accordion|breadcrumb|feature-blocks|spotlight-supporting': {
    title: 'Hero with Supporting Accordion',
    variations: ['Large hero', 'Accordion for details', 'Supporting blocks below', 'Clear hierarchy'],
  },
  'sidebar-first|tab-based|top-nav|stat-dashboard|multi-section': {
    title: 'Sidebar with Dashboard Stats',
    variations: ['Sidebar navigation', 'Tab switcher', 'Stat dashboard view', 'Multi-section layout'],
  },
  'two-column|accordion|sidebar|card-grid|dense-info': {
    title: 'Two-Column with Sidebar Accordion',
    variations: ['Two-column split', 'Sidebar accordion', 'Card grid', 'Compact information'],
  },
  'masonry|tab-based|bottom-tabs|card-grid|multi-section': {
    title: 'Masonry with Bottom Navigation',
    variations: ['Masonry grid layout', 'Bottom tabs', 'Card-based grid', 'Mobile-friendly navigation'],
  },
  'hero-first|paginated|top-nav|feature-blocks|spotlight-supporting': {
    title: 'Hero with Paginated Features',
    variations: ['Hero introduction', 'Paginated features', 'Supporting feature blocks', 'Sequential flow'],
  },
  'single-column|filtered-list|top-nav|list-items|spacious': {
    title: 'Search with Spaced List Results',
    variations: ['Single column', 'Search/filter at top', 'Spaced list items', 'Clean results view'],
  },
  'sidebar-first|infinite-scroll|sidebar|card-grid|dense-info': {
    title: 'Sidebar with Infinite Card Feed',
    variations: ['Persistent sidebar', 'Infinite scroll feed', 'Card layout', 'Compact display'],
  },
  'two-column|modal-centric|breadcrumb|form-sections|centered-focus': {
    title: 'Two-Column with Modal Forms',
    variations: ['Two-column layout', 'Modal form dialogs', 'Breadcrumb navigation', 'Central form focus'],
  },
  'masonry|accordion|floating-action|card-grid|spacious': {
    title: 'Masonry with Accordion Cards',
    variations: ['Masonry grid', 'Accordion expansion', 'Floating action', 'Generous spacing'],
  },
  'hero-first|filtered-list|top-nav|stat-dashboard|centered-focus': {
    title: 'Hero with Stat Dashboard',
    variations: ['Hero banner', 'Filtering controls', 'Statistics display', 'Clear focus'],
  },
};

export function getPatternHash(combo: PatternCombination): string {
  return [
    combo.hierarchyType,
    combo.interactionType,
    combo.navigationPattern,
    combo.contentBlockPattern,
    combo.visualWeightPattern,
  ].join('|');
}

export function getSketchTemplate(hash: string) {
  return SKETCH_TEMPLATES[hash] || {
    title: 'Concept Sketch',
    variations: ['Alternative layout', 'Different structure', 'Unique approach'],
  };
}
