import { Collection, GenerationRecord, Sketch, SketchGroup } from '../../types';
import { generateId } from '../../utils/idGenerator';
import * as supabaseManager from './supabaseStorageManager';

const COLLECTIONS_KEY = 'sketches:collections';
const VOTES_PREFIX = 'sketches:votes';

// Determine which backend to use
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// ===== localStorage fallback implementations =====

function localGetAllCollections(): Collection[] {
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

function localGetCollection(id: string): Collection | null {
  const collections = localGetAllCollections();
  return collections.find((c) => c.id === id) || null;
}

function localSaveCollection(collection: Collection): void {
  const collections = localGetAllCollections();
  const index = collections.findIndex((c) => c.id === collection.id);
  if (index >= 0) {
    collections[index] = collection;
  } else {
    collections.push(collection);
  }
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

function localDeleteCollection(id: string): void {
  const collections = localGetAllCollections().filter((c) => c.id !== id);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

function localCreateCollection(title: string, prompt: string): Collection {
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
  localSaveCollection(collection);
  return collection;
}

function localAddGroup(collectionId: string, title: string): SketchGroup {
  const collection = localGetCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  const group: SketchGroup = {
    id: generateId('grp'),
    collectionId,
    title,
    sketchIds: [],
  };

  collection.groups.push(group);
  collection.updatedAt = new Date();
  localSaveCollection(collection);
  return group;
}

function localUpdateGroup(collectionId: string, groupId: string, title: string): void {
  const collection = localGetCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  const group = collection.groups.find((g) => g.id === groupId);
  if (!group) throw new Error(`Group ${groupId} not found`);

  group.title = title;
  collection.updatedAt = new Date();
  localSaveCollection(collection);
}

function localDeleteGroup(collectionId: string, groupId: string): void {
  const collection = localGetCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  collection.groups = collection.groups.filter((g) => g.id !== groupId);
  collection.updatedAt = new Date();
  localSaveCollection(collection);
}

function localGetSketches(collectionId: string): Sketch[] {
  const collection = localGetCollection(collectionId);
  if (!collection) return [];

  const allSketches: Sketch[] = [];
  for (const group of collection.groups) {
    for (const sketchId of group.sketchIds) {
      const sketch = localLoadSketch(collectionId, sketchId);
      if (sketch) allSketches.push(sketch);
    }
  }
  return allSketches;
}

function localLoadSketch(collectionId: string, sketchId: string): Sketch | null {
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

function localSaveSketch(sketch: Sketch): void {
  localStorage.setItem(`sketches:sketch:${sketch.id}`, JSON.stringify(sketch));

  const collection = localGetCollection(sketch.collectionId);
  if (!collection) return;

  const group = collection.groups.find((g) => g.id === sketch.groupId);
  if (group && !group.sketchIds.includes(sketch.id)) {
    group.sketchIds.push(sketch.id);
    collection.metadata.totalSketches = collection.groups.reduce(
      (sum, g) => sum + g.sketchIds.length,
      0
    );
    collection.updatedAt = new Date();
    localSaveCollection(collection);
  }
}

function localDeleteSketch(collectionId: string, sketchId: string): void {
  const collection = localGetCollection(collectionId);
  if (!collection) return;

  for (const group of collection.groups) {
    group.sketchIds = group.sketchIds.filter((id) => id !== sketchId);
  }

  collection.metadata.totalSketches = collection.groups.reduce(
    (sum, g) => sum + g.sketchIds.length,
    0
  );
  collection.updatedAt = new Date();
  localSaveCollection(collection);
  localStorage.removeItem(`sketches:sketch:${sketchId}`);
}

function localGetVoteCount(sketchId: string): number {
  try {
    const data = localStorage.getItem(`${VOTES_PREFIX}:${sketchId}`);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

function localAddVote(collectionId: string, sketchId: string): number {
  const current = localGetVoteCount(sketchId);
  const newCount = current + 1;
  localStorage.setItem(`${VOTES_PREFIX}:${sketchId}`, String(newCount));

  const collection = localGetCollection(collectionId);
  if (collection) {
    collection.metadata.totalVotes = 0;
    const sketches = localGetSketches(collectionId);
    collection.metadata.totalVotes = sketches.reduce(
      (sum, s) => sum + localGetVoteCount(s.id),
      0
    );
    collection.updatedAt = new Date();
    localSaveCollection(collection);
  }

  return newCount;
}

function localAddGenerationRecord(
  collectionId: string,
  record: Omit<GenerationRecord, 'id' | 'timestamp'>
): void {
  const collection = localGetCollection(collectionId);
  if (!collection) return;

  const generationRecord: GenerationRecord = {
    id: generateId('gen'),
    timestamp: new Date(),
    ...record,
  };

  collection.metadata.generationHistory.push(generationRecord);
  collection.metadata.ideaCount += record.ideaCount;
  collection.updatedAt = new Date();
  localSaveCollection(collection);
}

function localGenerateShareToken(collectionId: string): string {
  const collection = localGetCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  if (!collection.shareToken) {
    collection.shareToken = generateId('share');
    collection.isPublished = true;
    localSaveCollection(collection);
  }

  return collection.shareToken;
}

function localGetCollectionByShareToken(token: string): Collection | null {
  const collections = localGetAllCollections();
  return collections.find((c) => c.shareToken === token) || null;
}

// ===== Public API =====

export async function getAllCollections(): Promise<Collection[]> {
  if (USE_SUPABASE) {
    return supabaseManager.getAllCollections();
  }
  return localGetAllCollections();
}

export async function getCollection(id: string): Promise<Collection | null> {
  if (USE_SUPABASE) {
    return supabaseManager.getCollection(id);
  }
  return localGetCollection(id);
}

export async function saveCollection(collection: Collection): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.saveCollection(collection);
  }
  localSaveCollection(collection);
}

export async function deleteCollection(id: string): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.deleteCollection(id);
  }
  localDeleteCollection(id);
}

export async function createCollection(
  title: string,
  prompt: string
): Promise<Collection> {
  if (USE_SUPABASE) {
    return supabaseManager.createCollection(title, prompt);
  }
  return localCreateCollection(title, prompt);
}

export async function addGroup(
  collectionId: string,
  title: string
): Promise<SketchGroup> {
  if (USE_SUPABASE) {
    return supabaseManager.addGroup(collectionId, title);
  }
  return localAddGroup(collectionId, title);
}

export async function updateGroup(
  collectionId: string,
  groupId: string,
  title: string
): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.updateGroup(collectionId, groupId, title);
  }
  localUpdateGroup(collectionId, groupId, title);
}

export async function deleteGroup(
  collectionId: string,
  groupId: string
): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.deleteGroup(collectionId, groupId);
  }
  localDeleteGroup(collectionId, groupId);
}

export async function getSketches(collectionId: string): Promise<Sketch[]> {
  if (USE_SUPABASE) {
    return supabaseManager.getSketches(collectionId);
  }
  return localGetSketches(collectionId);
}

export async function saveSketch(sketch: Sketch): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.saveSketch(sketch);
  }
  localSaveSketch(sketch);
}

export async function deleteSketch(
  collectionId: string,
  sketchId: string
): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.deleteSketch(collectionId, sketchId);
  }
  localDeleteSketch(collectionId, sketchId);
}

export async function getVoteCount(sketchId: string): Promise<number> {
  if (USE_SUPABASE) {
    return supabaseManager.getVoteCount(sketchId);
  }
  return localGetVoteCount(sketchId);
}

export async function addVote(
  collectionId: string,
  sketchId: string
): Promise<number> {
  if (USE_SUPABASE) {
    return supabaseManager.addVote(collectionId, sketchId);
  }
  return localAddVote(collectionId, sketchId);
}

export async function addGenerationRecord(
  collectionId: string,
  record: Omit<GenerationRecord, 'id' | 'timestamp'>
): Promise<void> {
  if (USE_SUPABASE) {
    return supabaseManager.addGenerationRecord(collectionId, record);
  }
  localAddGenerationRecord(collectionId, record);
}

export async function generateShareToken(collectionId: string): Promise<string> {
  if (USE_SUPABASE) {
    return supabaseManager.generateShareToken(collectionId);
  }
  return localGenerateShareToken(collectionId);
}

export async function getCollectionByShareToken(
  token: string
): Promise<Collection | null> {
  if (USE_SUPABASE) {
    return supabaseManager.getCollectionByShareToken(token);
  }
  return localGetCollectionByShareToken(token);
}
