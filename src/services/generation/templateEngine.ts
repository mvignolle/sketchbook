import {
  Sketch,
  SketchLayout,
  PatternCombination,
  WireframeSection,
  WireframeComponent,
  Size,
  Position,
} from '../../types';
import { generateId } from '../../utils/idGenerator';
import {
  HIERARCHY_PATTERNS,
  INTERACTION_PATTERNS,
  NAVIGATION_PATTERNS,
  CONTENT_BLOCK_PATTERNS,
  VISUAL_WEIGHT_PATTERNS,
  getPatternHash,
  getSketchTemplate,
} from '../../constants/patterns';

export function generateSketchLayout(combo: PatternCombination): SketchLayout {
  const layout: SketchLayout = {
    type: 'wireframe',
    width: 375,
    height: 667,
    sections: [],
  };

  // Add header/nav based on navigation pattern
  if (combo.navigationPattern === 'top-nav') {
    layout.sections.push(createTopNavSection());
  }

  // Add main content section based on hierarchy
  layout.sections.push(
    createContentSection(
      combo.hierarchyType,
      combo.contentBlockPattern,
      combo.interactionType
    )
  );

  // Add sidebar if needed
  if (combo.navigationPattern === 'sidebar') {
    layout.sections = [
      createSidebarSection(),
      ...layout.sections,
    ];
  }

  // Add bottom nav for mobile-first patterns
  if (combo.navigationPattern === 'bottom-tabs') {
    layout.sections.push(createBottomTabsSection());
  }

  return layout;
}

function createTopNavSection(): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'header',
    position: { x: 0, y: 0 },
    size: { width: 375, height: 60 },
    backgroundColor: 'white',
    children: [
      {
        id: generateId('comp'),
        type: 'text',
        position: { x: 16, y: 12 },
        size: { width: 60, height: 36 },
        properties: { label: 'Logo', textAlign: 'left' },
      },
      {
        id: generateId('comp'),
        type: 'button',
        position: { x: 325, y: 12 },
        size: { width: 36, height: 36 },
        properties: { label: '≡' },
      },
    ],
  };
}

function createSidebarSection(): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'sidebar',
    position: { x: 0, y: 60 },
    size: { width: 100, height: 607 },
    backgroundColor: 'lightgray',
    children: [
      {
        id: generateId('comp'),
        type: 'list',
        position: { x: 8, y: 8 },
        size: { width: 84, height: 591 },
        properties: { items: 5 },
      },
    ],
  };
}

function createBottomTabsSection(): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'footer',
    position: { x: 0, y: 600 },
    size: { width: 375, height: 67 },
    backgroundColor: 'white',
    children: [
      {
        id: generateId('comp'),
        type: 'grid',
        position: { x: 0, y: 0 },
        size: { width: 375, height: 67 },
        properties: { columns: 4 },
        children: Array.from({ length: 4 }, () => ({
          id: generateId('comp'),
          type: 'button',
          position: { x: 0, y: 0 },
          size: { width: 94, height: 67 },
          properties: { label: '◯' },
        })),
      },
    ],
  };
}

function createContentSection(
  hierarchyType: string,
  contentBlockPattern: string,
  interactionType: string
): WireframeSection {
  const contentHeight = 547; // Full height minus header
  const startY = 60;

  if (hierarchyType === 'hero-first') {
    return createHeroFirstSection(contentHeight, startY, contentBlockPattern);
  } else if (hierarchyType === 'two-column') {
    return createTwoColumnSection(contentHeight, startY, contentBlockPattern);
  } else if (hierarchyType === 'masonry') {
    return createMasonrySection(contentHeight, startY);
  } else if (hierarchyType === 'sidebar-first') {
    return createSidebarContentSection(contentHeight, startY, contentBlockPattern);
  } else {
    return createSingleColumnSection(contentHeight, startY, contentBlockPattern);
  }
}

function createHeroFirstSection(
  height: number,
  startY: number,
  contentBlockPattern: string
): WireframeSection {
  const heroHeight = Math.floor(height * 0.3);
  const contentHeight = height - heroHeight;

  return {
    id: generateId('sec'),
    componentType: 'content',
    position: { x: 0, y: startY },
    size: { width: 375, height },
    backgroundColor: 'white',
    children: [
      {
        id: generateId('comp'),
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 375, height: heroHeight },
        properties: { label: 'Hero Area' },
      },
      ...createContentBlocks(contentBlockPattern, 16, heroHeight + 16, 343, contentHeight - 32),
    ],
  };
}

function createTwoColumnSection(
  height: number,
  startY: number,
  contentBlockPattern: string
): WireframeSection {
  const colWidth = 170;
  const padding = 16;

  return {
    id: generateId('sec'),
    componentType: 'content',
    position: { x: 0, y: startY },
    size: { width: 375, height },
    backgroundColor: 'white',
    children: [
      {
        id: generateId('comp'),
        type: 'grid',
        position: { x: padding, y: padding },
        size: { width: 343, height: height - padding * 2 },
        properties: { columns: 2 },
        children: Array.from({ length: 4 }, () => ({
          id: generateId('comp'),
          type: 'card',
          position: { x: 0, y: 0 },
          size: { width: colWidth - 4, height: 150 },
          properties: { label: 'Item' },
        })),
      },
    ],
  };
}

function createMasonrySection(height: number, startY: number): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'content',
    position: { x: 0, y: startY },
    size: { width: 375, height },
    backgroundColor: 'white',
    children: [
      {
        id: generateId('comp'),
        type: 'grid',
        position: { x: 16, y: 16 },
        size: { width: 343, height: height - 32 },
        properties: { columns: 2 },
        children: Array.from({ length: 6 }, (_, i) => ({
          id: generateId('comp'),
          type: 'card',
          position: { x: 0, y: 0 },
          size: {
            width: 150,
            height: i % 2 === 0 ? 180 : 140,
          },
          properties: { label: `Item ${i + 1}` },
        })),
      },
    ],
  };
}

function createSidebarContentSection(
  height: number,
  startY: number,
  contentBlockPattern: string
): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'content',
    position: { x: 100, y: startY },
    size: { width: 275, height },
    backgroundColor: 'white',
    children: createContentBlocks(contentBlockPattern, 0, 0, 275, height),
  };
}

function createSingleColumnSection(
  height: number,
  startY: number,
  contentBlockPattern: string
): WireframeSection {
  return {
    id: generateId('sec'),
    componentType: 'content',
    position: { x: 0, y: startY },
    size: { width: 375, height },
    backgroundColor: 'white',
    children: createContentBlocks(contentBlockPattern, 16, 16, 343, height - 32),
  };
}

function createContentBlocks(
  pattern: string,
  x: number,
  y: number,
  width: number,
  height: number
): WireframeComponent[] {
  if (pattern === 'card-grid') {
    return [
      {
        id: generateId('comp'),
        type: 'grid',
        position: { x, y },
        size: { width, height },
        properties: { columns: 2 },
        children: Array.from({ length: 4 }, () => ({
          id: generateId('comp'),
          type: 'card',
          position: { x: 0, y: 0 },
          size: { width: width / 2 - 4, height: 140 },
          properties: { label: 'Card' },
        })),
      },
    ];
  } else if (pattern === 'list-items') {
    return [
      {
        id: generateId('comp'),
        type: 'list',
        position: { x, y },
        size: { width, height },
        properties: { items: 5 },
      },
    ];
  } else if (pattern === 'feature-blocks') {
    return Array.from({ length: 3 }, () => ({
      id: generateId('comp'),
      type: 'card',
      position: { x, y: y + Math.random() * 100 },
      size: { width, height: 100 },
      properties: { label: 'Feature Block' },
    }));
  } else if (pattern === 'stat-dashboard') {
    return [
      {
        id: generateId('comp'),
        type: 'grid',
        position: { x, y },
        size: { width, height },
        properties: { columns: 2 },
        children: Array.from({ length: 4 }, () => ({
          id: generateId('comp'),
          type: 'shape',
          position: { x: 0, y: 0 },
          size: { width: width / 2 - 4, height: 80 },
          properties: { label: 'Stat' },
        })),
      },
    ];
  } else {
    // form-sections
    return Array.from({ length: 3 }, () => ({
      id: generateId('comp'),
      type: 'form',
      position: { x, y: y + Math.random() * 80 },
      size: { width, height: 60 },
      properties: { label: 'Form Section' },
    }));
  }
}

export function createSketchFromCombination(
  collectionId: string,
  groupId: string,
  combo: PatternCombination,
  index: number
): Sketch {
  const hash = getPatternHash(combo);
  const template = getSketchTemplate(hash);

  return {
    id: generateId('sketch'),
    collectionId,
    groupId,
    title: `Idea ${String(index).padStart(2, '0')} — ${template.title}`,
    description: template.variations
      .map((v) => `• ${v}`)
      .join('\n'),
    layout: generateSketchLayout(combo),
    conceptVariations: template.variations,
    votes: 0,
    createdAt: new Date(),
  };
}

export function getRandomCombination(): PatternCombination {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    hierarchyType: pick(HIERARCHY_PATTERNS) as any,
    interactionType: pick(INTERACTION_PATTERNS) as any,
    navigationPattern: pick(NAVIGATION_PATTERNS) as any,
    contentBlockPattern: pick(CONTENT_BLOCK_PATTERNS) as any,
    visualWeightPattern: pick(VISUAL_WEIGHT_PATTERNS) as any,
  };
}
