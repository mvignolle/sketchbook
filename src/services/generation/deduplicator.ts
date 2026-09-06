import { Sketch, PatternCombination } from '../../types';
import { getPatternHash } from '../../constants/patterns';

export function getUsedPatternHashes(sketches: Sketch[]): Set<string> {
  const hashes = new Set<string>();

  for (const sketch of sketches) {
    const layout = sketch.layout;
    if (layout && layout.sections && layout.sections.length > 0) {
      // Try to extract pattern info from layout structure
      const hash = extractPatternHash(sketch);
      if (hash) {
        hashes.add(hash);
      }
    }
  }

  return hashes;
}

function extractPatternHash(sketch: Sketch): string | null {
  // This is a simplified approach - in a real app, we'd store pattern info with the sketch
  // For now, we use the title to identify patterns
  const title = sketch.title;

  // Extract pattern info from variations
  if (sketch.conceptVariations && sketch.conceptVariations.length > 0) {
    return sketch.conceptVariations.join('|');
  }

  return null;
}

export function isPatternUsed(hash: string, usedHashes: Set<string>): boolean {
  return usedHashes.has(hash);
}

export function isConceptuallyUnique(
  newSketch: Sketch,
  existingSketches: Sketch[]
): boolean {
  // Check if the new sketch's title and variations are different from existing ones
  const newVariations = newSketch.conceptVariations.join('|').toLowerCase();

  for (const existing of existingSketches) {
    const existingVariations = existing.conceptVariations
      .join('|')
      .toLowerCase();

    // Allow similar patterns if they're in different groups
    if (
      newVariations === existingVariations &&
      newSketch.groupId === existing.groupId
    ) {
      return false;
    }

    // Check if variations describe the same concept
    if (hasSimilarVariations(newSketch.conceptVariations, existing.conceptVariations)) {
      return false;
    }
  }

  return true;
}

function hasSimilarVariations(
  variations1: string[],
  variations2: string[]
): boolean {
  if (variations1.length === 0 || variations2.length === 0) {
    return false;
  }

  // If more than 70% of variations are similar, consider them duplicate
  const commonCount = variations1.filter((v1) =>
    variations2.some((v2) => calculateSimilarity(v1, v2) > 0.7)
  ).length;

  return (
    commonCount / Math.max(variations1.length, variations2.length) > 0.7
  );
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  const len = Math.max(s1.length, s2.length);
  if (len === 0) return 1;

  let matches = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }

  return matches / len;
}

export function deduplicatePatternHashes(
  hashes: Set<string>,
  desiredCount: number
): string[] {
  // Return array of unused hashes (limited by desired count)
  const allHashes = generateAllHashes();
  const unused = allHashes.filter((h) => !hashes.has(h));

  return unused.slice(0, desiredCount);
}

function generateAllHashes(): string[] {
  // Pre-computed hashes from pattern combinations
  // These represent different conceptual approaches
  return [
    'hero-first|modal-centric|top-nav|card-grid|centered-focus',
    'hero-first|tab-based|top-nav|card-grid|centered-focus',
    'sidebar-first|accordion|sidebar|list-items|multi-section',
    'sidebar-first|filtered-list|sidebar|list-items|dense-info',
    'two-column|tab-based|top-nav|card-grid|multi-section',
    'two-column|paginated|breadcrumb|feature-blocks|spacious',
    'masonry|infinite-scroll|top-nav|card-grid|spacious',
    'single-column|paginated|top-nav|form-sections|centered-focus',
    'single-column|modal-centric|floating-action|card-grid|centered-focus',
    'hero-first|accordion|breadcrumb|feature-blocks|spotlight-supporting',
    'sidebar-first|tab-based|top-nav|stat-dashboard|multi-section',
    'two-column|accordion|sidebar|card-grid|dense-info',
    'masonry|tab-based|bottom-tabs|card-grid|multi-section',
    'hero-first|paginated|top-nav|feature-blocks|spotlight-supporting',
    'single-column|filtered-list|top-nav|list-items|spacious',
    'sidebar-first|infinite-scroll|sidebar|card-grid|dense-info',
    'two-column|modal-centric|breadcrumb|form-sections|centered-focus',
    'masonry|accordion|floating-action|card-grid|spacious',
    'hero-first|filtered-list|top-nav|stat-dashboard|centered-focus',
    'sidebar-first|paginated|top-nav|feature-blocks|multi-section',
  ];
}
