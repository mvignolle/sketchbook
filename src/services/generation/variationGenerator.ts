import { Sketch } from '../../types';
import {
  createSketchFromCombination,
  getRandomCombination,
} from './templateEngine';
import {
  getUsedPatternHashes,
  isConceptuallyUnique,
  deduplicatePatternHashes,
} from './deduplicator';

export function generateSketches(
  collectionId: string,
  groupId: string,
  count: number,
  existingSketches: Sketch[] = []
): Sketch[] {
  const sketches: Sketch[] = [];
  const usedHashes = getUsedPatternHashes(existingSketches);
  const availableHashes = deduplicatePatternHashes(usedHashes, count);

  let attempts = 0;
  const maxAttempts = count * 10;

  while (sketches.length < count && attempts < maxAttempts) {
    attempts++;

    const combo = getRandomCombination();
    const sketch = createSketchFromCombination(
      collectionId,
      groupId,
      combo,
      existingSketches.length + sketches.length + 1
    );

    // Check if conceptually unique
    if (isConceptuallyUnique(sketch, [...existingSketches, ...sketches])) {
      sketches.push(sketch);
    }
  }

  // If we couldn't generate enough unique sketches, fill with variations
  while (sketches.length < count) {
    const combo = getRandomCombination();
    const sketch = createSketchFromCombination(
      collectionId,
      groupId,
      combo,
      existingSketches.length + sketches.length + 1
    );
    sketches.push(sketch);
  }

  return sketches;
}

export function generateAdditionalSketches(
  collectionId: string,
  groupId: string,
  count: number,
  existingSketches: Sketch[],
  additionalInstruction?: string
): Sketch[] {
  // Generate new sketches that consider the additional instruction
  const sketches: Sketch[] = [];

  let attempts = 0;
  const maxAttempts = count * 10;

  while (sketches.length < count && attempts < maxAttempts) {
    attempts++;

    const combo = getRandomCombination();
    const sketch = createSketchFromCombination(
      collectionId,
      groupId,
      combo,
      existingSketches.length + sketches.length + 1
    );

    // If there's an additional instruction, add it to the description
    if (additionalInstruction) {
      sketch.description = `${additionalInstruction}\n\n${sketch.description}`;
    }

    // Check if conceptually unique against all existing sketches
    if (isConceptuallyUnique(sketch, [...existingSketches, ...sketches])) {
      sketches.push(sketch);
    }
  }

  // Fill remaining with variations
  while (sketches.length < count) {
    const combo = getRandomCombination();
    const sketch = createSketchFromCombination(
      collectionId,
      groupId,
      combo,
      existingSketches.length + sketches.length + 1
    );
    if (additionalInstruction) {
      sketch.description = `${additionalInstruction}\n\n${sketch.description}`;
    }
    sketches.push(sketch);
  }

  return sketches;
}
