import type { Collection } from '../types';
import { saveCollection, saveSketch } from '../services/storage/storageManager';
import { generateSketches } from '../services/generation/variationGenerator';
import { generateId } from './idGenerator';

export async function seedExampleCollections() {
  // Check if data already exists
  const existing = localStorage.getItem('sketches:collections');
  if (existing) return;

  const examples = [
    {
      title: 'Challenge Registration',
      prompt: 'Explore different ways a participant could join or create a team during challenge registration.',
      ideaCount: 6,
    },
    {
      title: 'Rewards Dashboard',
      prompt: 'Design a dashboard that displays earned rewards, achievements, and points in an engaging way.',
      ideaCount: 4,
    },
    {
      title: 'Team Selection Flow',
      prompt: 'Create variations of how users can browse and join existing teams in a challenge.',
      ideaCount: 5,
    },
  ];

  for (const example of examples) {
    const collection: Collection = {
      id: generateId('col'),
      title: example.title,
      prompt: example.prompt,
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

    const group = {
      id: generateId('grp'),
      collectionId: collection.id,
      title: 'Exploration 1',
      sketchIds: [] as string[],
    };

    collection.groups.push(group);

    // Generate sketches
    const sketches = generateSketches(
      collection.id,
      group.id,
      example.ideaCount
    );

    for (const sketch of sketches) {
      sketch.createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      await saveSketch(sketch);
      group.sketchIds.push(sketch.id);
    }

    collection.metadata.totalSketches = sketches.length;
    collection.metadata.ideaCount = example.ideaCount;

    await saveCollection(collection);
  }
}
