import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { createCollection, saveCollection, addGroup, saveSketch, addGenerationRecord } from '../services/storage/storageManager';
import { generateSketches } from '../services/generation/variationGenerator';
import './CreateCollection.css';

interface CreateCollectionProps {
  onNavigate: (page: any) => void;
}

export const CreateCollection: React.FC<CreateCollectionProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [ideaCount, setIdeaCount] = useState('6');
  const [collectionId, setCollectionId] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !prompt.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setStep('generating');

    try {
      const collection = createCollection(title, prompt);
      setCollectionId(collection.id);

      const group = addGroup(collection.id, 'Exploration 1');
      const count = Math.max(1, Math.min(12, parseInt(ideaCount) || 6));
      const sketches = generateSketches(collection.id, group.id, count);

      sketches.forEach(sketch => {
        saveSketch(sketch);
      });

      collection.metadata.totalSketches = sketches.length;
      addGenerationRecord(collection.id, {
        ideaCount: count,
        prompt,
        resultSketchIds: sketches.map(s => s.id),
      });
      saveCollection(collection);

      setStep('complete');
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Error creating collection');
      setStep('form');
    }
  };

  if (step === 'generating') {
    return (
      <div className="create-collection-page">
        <div className="create-collection-generating">
          <h2>Generating ideas...</h2>
          <p>Creating {ideaCount} concept sketches</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="create-collection-page">
        <div className="create-collection-complete">
          <h2>Collection created!</h2>
          <p>{ideaCount} ideas generated</p>
          <div className="button-group">
            <Button
              onClick={() => onNavigate({ type: 'collection-detail', collectionId })}
              variant="primary"
            >
              View Collection
            </Button>
            <Button
              onClick={() => onNavigate({ type: 'home' })}
              variant="secondary"
            >
              Back to Collections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-collection-page">
      <div className="create-collection-form">
        <div className="form-header">
          <h1>New Collection</h1>
          <p>Start exploring design concepts with a new collection</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="form">
          <Input
            label="Collection Title"
            placeholder="e.g., Challenge Registration"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Exploration Brief"
            placeholder="Describe the design problem or concept you want to explore..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
          />

          <div className="form-group">
            <label className="form-label">Number of Ideas</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="20"
              value={ideaCount}
              onChange={(e) => setIdeaCount(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              size="large"
            >
              Create Collection
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={() => onNavigate({ type: 'home' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
