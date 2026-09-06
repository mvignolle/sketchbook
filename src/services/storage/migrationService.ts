import { supabase } from '../supabase/client';
import { getOrCreateSession } from '../supabase/sessionManager';

interface MigrationSummary {
  collectionsCount: number;
  sketchesCount: number;
  votesCount: number;
  generationRecordsCount: number;
  errors: string[];
  successCount: number;
  startTime: Date;
  endTime: Date;
}

const MIGRATION_COMPLETE_KEY = 'sketches:migration_v1_complete';

export async function isMigrationComplete(): Promise<boolean> {
  return localStorage.getItem(MIGRATION_COMPLETE_KEY) === 'true';
}

export async function migrateLocalStorageToSupabase(): Promise<MigrationSummary> {
  const startTime = new Date();
  const summary: MigrationSummary = {
    collectionsCount: 0,
    sketchesCount: 0,
    votesCount: 0,
    generationRecordsCount: 0,
    errors: [],
    successCount: 0,
    startTime,
    endTime: new Date(),
  };

  try {
    // Skip if already migrated
    if (await isMigrationComplete()) {
      console.log('Migration already complete, skipping');
      return summary;
    }

    // Get session
    const sessionId = await getOrCreateSession();
    console.log('Starting migration for session:', sessionId);

    // Get all data from localStorage
    const collectionsData = localStorage.getItem('sketches:collections');
    if (!collectionsData) {
      console.log('No collections to migrate');
      localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
      summary.endTime = new Date();
      return summary;
    }

    const collections = JSON.parse(collectionsData);
    console.log(`Migrating ${collections.length} collections`);

    // Migrate each collection
    for (const collection of collections) {
      try {
        // Insert collection
        const { error: collectionError } = await supabase
          .from('collections')
          .insert({
            id: collection.id,
            title: collection.title,
            prompt: collection.prompt,
            description: collection.description,
            is_published: collection.isPublished || false,
            share_token: collection.shareToken || null,
            session_id: sessionId,
            total_sketches: collection.metadata?.totalSketches || 0,
            idea_count: collection.metadata?.ideaCount || 0,
            total_votes: collection.metadata?.totalVotes || 0,
            created_at: collection.createdAt,
            updated_at: collection.updatedAt,
          });

        if (collectionError) {
          throw new Error(`Failed to insert collection: ${collectionError.message}`);
        }

        summary.collectionsCount++;

        // Migrate groups and sketches
        if (collection.groups && collection.groups.length > 0) {
          for (const group of collection.groups) {
            const { error: groupError } = await supabase
              .from('sketch_groups')
              .insert({
                id: group.id,
                collection_id: collection.id,
                title: group.title,
                position: 0,
              });

            if (groupError) {
              summary.errors.push(`Failed to insert group ${group.id}: ${groupError.message}`);
              continue;
            }

            // Migrate sketches in this group
            if (group.sketchIds && group.sketchIds.length > 0) {
              for (const sketchId of group.sketchIds) {
                try {
                  const sketchData = localStorage.getItem(`sketches:sketch:${sketchId}`);
                  if (sketchData) {
                    const sketch = JSON.parse(sketchData);

                    const { error: sketchError } = await supabase
                      .from('sketches')
                      .insert({
                        id: sketch.id,
                        collection_id: collection.id,
                        group_id: group.id,
                        title: sketch.title,
                        description: sketch.description,
                        layout: sketch.layout,
                        concept_variations: sketch.conceptVariations || [],
                        vote_count: sketch.votes || 0,
                        created_at: sketch.createdAt,
                      });

                    if (sketchError) {
                      summary.errors.push(`Failed to insert sketch ${sketchId}: ${sketchError.message}`);
                      continue;
                    }

                    summary.sketchesCount++;
                  }
                } catch (e) {
                  summary.errors.push(`Error processing sketch ${sketchId}: ${e}`);
                }
              }
            }
          }
        }

        // Migrate generation records
        if (collection.metadata?.generationHistory && collection.metadata.generationHistory.length > 0) {
          for (const record of collection.metadata.generationHistory) {
            const { error: recordError } = await supabase
              .from('generation_records')
              .insert({
                id: record.id,
                collection_id: collection.id,
                idea_count: record.ideaCount,
                prompt: record.prompt,
                additional_instruction: record.additionalInstruction,
                result_sketch_ids: record.resultSketchIds || [],
                generated_at: record.timestamp,
              });

            if (recordError) {
              summary.errors.push(`Failed to insert generation record: ${recordError.message}`);
              continue;
            }

            summary.generationRecordsCount++;
          }
        }

        summary.successCount++;
      } catch (e) {
        summary.errors.push(`Error migrating collection ${collection.id}: ${e}`);
      }
    }

    // Mark migration complete
    localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
    summary.endTime = new Date();

    const duration = summary.endTime.getTime() - summary.startTime.getTime();
    console.log(`Migration complete in ${duration}ms`, summary);

    return summary;
  } catch (err) {
    summary.errors.push(`Fatal error during migration: ${err}`);
    summary.endTime = new Date();
    return summary;
  }
}
