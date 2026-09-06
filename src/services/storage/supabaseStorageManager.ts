import { Collection, GenerationRecord, Sketch, SketchGroup } from '../../types';
import { generateId } from '../../utils/idGenerator';
import { supabase } from '../supabase/client';
import { getCurrentSession } from '../supabase/sessionManager';
import { cacheManager } from './cacheManager';

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  collections: 5 * 60 * 1000,  // 5 minutes
  collection: 5 * 60 * 1000,   // 5 minutes
  sketches: 3 * 60 * 1000,     // 3 minutes
  voteCount: 1 * 60 * 1000,    // 1 minute
  shareToken: 10 * 60 * 1000,  // 10 minutes
};

// Helper to deserialize dates
function deserializeCollection(row: any): Collection {
  return {
    ...row,
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    description: row.description,
    isPublished: row.is_published,
    shareToken: row.share_token || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    groups: (row.sketch_groups || []).map(deserializeGroup),
    metadata: {
      totalSketches: row.total_sketches || 0,
      ideaCount: row.idea_count || 0,
      totalVotes: row.total_votes || 0,
      generationHistory: (row.generation_records || []).map((g: any) => ({
        id: g.id,
        timestamp: new Date(g.generated_at),
        ideaCount: g.idea_count,
        prompt: g.prompt,
        additionalInstruction: g.additional_instruction,
        resultSketchIds: g.result_sketch_ids || [],
      })),
    },
  };
}

function deserializeGroup(row: any): SketchGroup {
  return {
    id: row.id,
    collectionId: row.collection_id,
    title: row.title,
    sketchIds: (row.sketches || []).map((s: any) => s.id),
  };
}

function deserializeSketch(row: any): Sketch {
  return {
    id: row.id,
    collectionId: row.collection_id,
    groupId: row.group_id,
    title: row.title,
    description: row.description,
    layout: row.layout,
    conceptVariations: row.concept_variations || [],
    votes: row.vote_count || 0,
    createdAt: new Date(row.created_at),
  };
}

// Collections
export async function getAllCollections(): Promise<Collection[]> {
  const cacheKey = 'collections:all';
  const cached = cacheManager.get<Collection[]>(cacheKey);
  if (cached) return cached;

  const sessionId = getCurrentSession();
  if (!sessionId) return [];

  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        sketch_groups(
          *,
          sketches(id, title)
        ),
        generation_records(*)
      `)
      .eq('session_id', sessionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      return [];
    }

    const collections = (data || []).map(deserializeCollection);
    cacheManager.set(cacheKey, collections, CACHE_TTL.collections);
    return collections;
  } catch (err) {
    console.error('Error in getAllCollections:', err);
    return [];
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const cacheKey = `collection:${id}`;
  const cached = cacheManager.get<Collection>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        sketch_groups(
          *,
          sketches(*)
        ),
        generation_records(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      console.error('Error fetching collection:', error);
      return null;
    }

    const collection = deserializeCollection(data);
    cacheManager.set(cacheKey, collection, CACHE_TTL.collection);
    return collection;
  } catch (err) {
    console.error('Error in getCollection:', err);
    return null;
  }
}

export async function saveCollection(collection: Collection): Promise<void> {
  const sessionId = getCurrentSession();
  if (!sessionId) throw new Error('No session');

  try {
    const { error } = await supabase
      .from('collections')
      .upsert({
        id: collection.id,
        title: collection.title,
        prompt: collection.prompt,
        description: collection.description,
        is_published: collection.isPublished,
        share_token: collection.shareToken,
        session_id: sessionId,
        total_sketches: collection.metadata.totalSketches,
        idea_count: collection.metadata.ideaCount,
        total_votes: collection.metadata.totalVotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', collection.id);

    if (error) {
      console.error('Error saving collection:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collection.id}`);
    cacheManager.invalidate('collections:all');
  } catch (err) {
    console.error('Error in saveCollection:', err);
    throw err;
  }
}

export async function deleteCollection(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('collections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${id}`);
    cacheManager.invalidate('collections:all');
  } catch (err) {
    console.error('Error in deleteCollection:', err);
    throw err;
  }
}

export async function createCollection(
  title: string,
  prompt: string
): Promise<Collection> {
  const sessionId = getCurrentSession();
  if (!sessionId) throw new Error('No session');

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

  await saveCollection(collection);
  return collection;
}

// Groups
export async function addGroup(
  collectionId: string,
  title: string
): Promise<SketchGroup> {
  const group: SketchGroup = {
    id: generateId('grp'),
    collectionId,
    title,
    sketchIds: [],
  };

  try {
    const { error } = await supabase
      .from('sketch_groups')
      .insert({
        id: group.id,
        collection_id: collectionId,
        title,
        position: 0,
      });

    if (error) {
      console.error('Error adding group:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');
    return group;
  } catch (err) {
    console.error('Error in addGroup:', err);
    throw err;
  }
}

export async function updateGroup(
  collectionId: string,
  groupId: string,
  title: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('sketch_groups')
      .update({ title })
      .eq('id', groupId);

    if (error) {
      console.error('Error updating group:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');
  } catch (err) {
    console.error('Error in updateGroup:', err);
    throw err;
  }
}

export async function deleteGroup(
  collectionId: string,
  groupId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('sketch_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');
  } catch (err) {
    console.error('Error in deleteGroup:', err);
    throw err;
  }
}

// Sketches
export async function getSketches(
  collectionId: string
): Promise<Sketch[]> {
  const cacheKey = `sketches:${collectionId}`;
  const cached = cacheManager.get<Sketch[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('sketches')
      .select('*')
      .eq('collection_id', collectionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sketches:', error);
      return [];
    }

    const sketches = (data || []).map(deserializeSketch);
    cacheManager.set(cacheKey, sketches, CACHE_TTL.sketches);
    return sketches;
  } catch (err) {
    console.error('Error in getSketches:', err);
    return [];
  }
}

export async function saveSketch(sketch: Sketch): Promise<void> {
  try {
    const { error } = await supabase
      .from('sketches')
      .upsert({
        id: sketch.id,
        collection_id: sketch.collectionId,
        group_id: sketch.groupId,
        title: sketch.title,
        description: sketch.description,
        layout: sketch.layout,
        concept_variations: sketch.conceptVariations,
        vote_count: sketch.votes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sketch.id);

    if (error) {
      console.error('Error saving sketch:', error);
      throw error;
    }

    cacheManager.invalidate(`sketches:${sketch.collectionId}`);
    cacheManager.invalidate(`collection:${sketch.collectionId}`);
  } catch (err) {
    console.error('Error in saveSketch:', err);
    throw err;
  }
}

export async function deleteSketch(
  collectionId: string,
  sketchId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('sketches')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sketchId);

    if (error) {
      console.error('Error deleting sketch:', error);
      throw error;
    }

    cacheManager.invalidate(`sketches:${collectionId}`);
    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate(`voteCount:${sketchId}`);
  } catch (err) {
    console.error('Error in deleteSketch:', err);
    throw err;
  }
}

// Votes
export async function getVoteCount(sketchId: string): Promise<number> {
  const cacheKey = `voteCount:${sketchId}`;
  const cached = cacheManager.get<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const { data, error } = await supabase
      .from('sketches')
      .select('vote_count')
      .eq('id', sketchId)
      .single();

    if (error) {
      console.error('Error fetching vote count:', error);
      return 0;
    }

    const count = data?.vote_count || 0;
    cacheManager.set(cacheKey, count, CACHE_TTL.voteCount);
    return count;
  } catch (err) {
    console.error('Error in getVoteCount:', err);
    return 0;
  }
}

export async function addVote(
  collectionId: string,
  sketchId: string
): Promise<number> {
  const sessionId = getCurrentSession();
  if (!sessionId) throw new Error('No session');

  try {
    // Try to insert vote (unique constraint prevents duplicates)
    const { error } = await supabase
      .from('votes')
      .insert({
        sketch_id: sketchId,
        collection_id: collectionId,
        session_id: sessionId,
      });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - vote already exists
        return getVoteCount(sketchId);
      }
      console.error('Error adding vote:', error);
      throw error;
    }

    // Increment vote_count on sketch
    const currentCount = await getVoteCount(sketchId);
    const newCount = currentCount + 1;

    await supabase
      .from('sketches')
      .update({ vote_count: newCount })
      .eq('id', sketchId);

    cacheManager.invalidate(`voteCount:${sketchId}`);
    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');

    return newCount;
  } catch (err) {
    console.error('Error in addVote:', err);
    throw err;
  }
}

// Generation history
export async function addGenerationRecord(
  collectionId: string,
  record: Omit<GenerationRecord, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('generation_records')
      .insert({
        id: generateId('gen'),
        collection_id: collectionId,
        idea_count: record.ideaCount,
        prompt: record.prompt,
        additional_instruction: record.additionalInstruction,
        result_sketch_ids: record.resultSketchIds,
      });

    if (error) {
      console.error('Error adding generation record:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');
  } catch (err) {
    console.error('Error in addGenerationRecord:', err);
    throw err;
  }
}

// Sharing
export async function generateShareToken(collectionId: string): Promise<string> {
  const collection = await getCollection(collectionId);
  if (!collection) throw new Error(`Collection ${collectionId} not found`);

  if (collection.shareToken) {
    return collection.shareToken;
  }

  const shareToken = generateId('share');

  try {
    const { error } = await supabase
      .from('collections')
      .update({
        share_token: shareToken,
        is_published: true,
      })
      .eq('id', collectionId);

    if (error) {
      console.error('Error generating share token:', error);
      throw error;
    }

    cacheManager.invalidate(`collection:${collectionId}`);
    cacheManager.invalidate('collections:all');
    return shareToken;
  } catch (err) {
    console.error('Error in generateShareToken:', err);
    throw err;
  }
}

export async function getCollectionByShareToken(
  token: string
): Promise<Collection | null> {
  const cacheKey = `shareToken:${token}`;
  const cached = cacheManager.get<Collection>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        sketch_groups(
          *,
          sketches(*)
        ),
        generation_records(*)
      `)
      .eq('share_token', token)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      console.error('Error fetching collection by share token:', error);
      return null;
    }

    const collection = deserializeCollection(data);
    cacheManager.set(cacheKey, collection, CACHE_TTL.shareToken);
    return collection;
  } catch (err) {
    console.error('Error in getCollectionByShareToken:', err);
    return null;
  }
}
