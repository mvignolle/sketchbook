import { Collection, GenerationRecord, Sketch, SketchGroup } from '../../types';
import { generateId } from '../../utils/idGenerator';

const COLLECTIONS_KEY = 'sketches:collections';
const VOTES_PREFIX = 'sketches:votes';
const HISTORY_PREFIX = 'sketches:history';
const SHARE_TOKENS_KEY = 'sketches:shareTokens';

// Collections
export function getAllCollections(): Collection[] {
  try {
    const data = localStorage.getItem(COLLECTIONS_KEY);
    if (!data) return [];
    const collections = JSON.parse(data);
    return collections.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      metadata: {
        ...c.metadata,
        generationHistory: c.metadata.generationHistory.map((g: any) => ({
          ...g,
          timestamp: new Date(g.timestamp),
        })),
      },
    }));
  } catch {
    return [];
  }
}

export function getCollection(id: string): Collection | null {
  const collections = getAllCollections();
  return collections.find((c) => c.id === id) || null;
}

export function saveCollection(collection: Collection): void {
  const collections = getAllCollections();
  const index = collections.findIndex((c) => c.id === collection.id);
  if (index >= 0) {
    collections[index] = collection;
  } else {
    collections.push(collection);
  }
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

export function deleteCollection(id: string): void {
  const collections = getAllCollections().filter((c) => c.id !== id);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

export function createCollection(
  title: string,
  prompt: string
): Collection {
  const collection: Collection = {
    id: generateId('col'),
    title,
    prompt,
    groups: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    metadata: {
      totalSketches: 0,
      ideaCount: 0,
      totalVotes: 0,
      generationHistory: [],
    },
  };
  saveCollection(collection);
  return collection;
}

// Groups
export function addGroup(collectionId: string, title: string): SketchGroup {
  const collection = getCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  const group: SketchGroup = {
    id: generateId('grp'),
    collectionId,
    title,
    sketchIds: [],
  };

  collection.groups.push(group);
  collection.updatedAt = new Date();
  saveCollection(collection);
  return group;
}

export function updateGroup(
  collectionId: string,
  groupId: string,
  title: string
): void {
  const collection = getCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  const group = collection.groups.find((g) => g.id === groupId);
  if (!group) throw new Error(`Group ${groupId} not found`);

  group.title = title;
  collection.updatedAt = new Date();
  saveCollection(collection);
}

export function deleteGroup(collectionId: string, groupId: string): void {
  const collection = getCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  collection.groups = collection.groups.filter((g) => g.id !== groupId);
  collection.updatedAt = new Date();
  saveCollection(collection);
}

// Sketches
export function getSketches(collectionId: string): Sketch[] {
  const collection = getCollection(collectionId);
  if (!collection) return [];

  const allSketches: Sketch[] = [];
  const collections = getAllCollections();

  for (const col of collections) {
    if (col.id === collectionId) {
      for (const group of col.groups) {
        const sketches = group.sketchIds.map((sketchId) =>
          loadSketch(collectionId, sketchId)
        );
        allSketches.push(...sketches.filter((s): s is Sketch => s !== null));
      }
    }
  }

  return allSketches;
}

function loadSketch(collectionId: string, sketchId: string): Sketch | null {
  try {
    const data = localStorage.getItem(`sketches:sketch:${sketchId}`);
    if (!data) return null;
    const sketch = JSON.parse(data);
    return {
      ...sketch,
      createdAt: new Date(sketch.createdAt),
    };
  } catch {
    return null;
  }
}

export function saveSketch(sketch: Sketch): void {
  localStorage.setItem(`sketches:sketch:${sketch.id}`, JSON.stringify(sketch));

  const collection = getCollection(sketch.collectionId);
  if (!collection) return;

  const group = collection.groups.find((g) => g.id === sketch.groupId);
  if (group && !group.sketchIds.includes(sketch.id)) {
    group.sketchIds.push(sketch.id);
    collection.metadata.totalSketches = collection.groups.reduce(
      (sum, g) => sum + g.sketchIds.length,
      0
    );
    collection.updatedAt = new Date();
    saveCollection(collection);
  }
}

export function deleteSketch(collectionId: string, sketchId: string): void {
  const collection = getCollection(collectionId);
  if (!collection) return;

  for (const group of collection.groups) {
    group.sketchIds = group.sketchIds.filter((id) => id !== sketchId);
  }

  collection.metadata.totalSketches = collection.groups.reduce(
    (sum, g) => sum + g.sketchIds.length,
    0
  );
  collection.updatedAt = new Date();
  saveCollection(collection);
  localStorage.removeItem(`sketches:sketch:${sketchId}`);
}

// Votes
export function getVoteCount(sketchId: string): number {
  try {
    const data = localStorage.getItem(`${VOTES_PREFIX}:${sketchId}`);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export function addVote(collectionId: string, sketchId: string): number {
  const current = getVoteCount(sketchId);
  const newCount = current + 1;
  localStorage.setItem(`${VOTES_PREFIX}:${sketchId}`, String(newCount));

  const collection = getCollection(collectionId);
  if (collection) {
    collection.metadata.totalVotes = 0;
    const sketches = getSketches(collectionId);
    collection.metadata.totalVotes = sketches.reduce(
      (sum, s) => sum + getVoteCount(s.id),
      0
    );
    collection.updatedAt = new Date();
    saveCollection(collection);
  }

  return newCount;
}

// Generation history
export function addGenerationRecord(
  collectionId: string,
  record: Omit<GenerationRecord, 'id' | 'timestamp'>
): void {
  const collection = getCollection(collectionId);
  if (!collection) return;

  const generationRecord: GenerationRecord = {
    id: generateId('gen'),
    timestamp: new Date(),
    ...record,
  };

  collection.metadata.generationHistory.push(generationRecord);
  collection.metadata.ideaCount += record.ideaCount;
  collection.updatedAt = new Date();
  saveCollection(collection);
}

// Sharing
export function generateShareToken(collectionId: string): string {
  const collection = getCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  if (!collection.shareToken) {
    collection.shareToken = generateId('share');
    collection.isPublished = true;
    saveCollection(collection);
  }

  return collection.shareToken;
}

export function getCollectionByShareToken(token: string): Collection | null {
  const collections = getAllCollections();
  return collections.find((c) => c.shareToken === token) || null;
}
