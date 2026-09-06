import React, { useState, useEffect } from 'react';
import { Sketch, Collection } from '../types';
import { getCollection, getSketches, getVoteCount, addVote } from '../services/storage/storageManager';
import { Button } from '../components/ui/Button';
import { WireframeContainer } from '../components/wireframes/WireframeContainer';
import './SketchDetail.css';

interface SketchDetailProps {
  collectionId: string;
  sketchId: string;
  onNavigate: (page: any) => void;
}

export const SketchDetail: React.FC<SketchDetailProps> = ({
  collectionId,
  sketchId,
  onNavigate,
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [sketch, setSketch] = useState<Sketch | null>(null);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    const loadSketch = async () => {
      const col = await getCollection(collectionId);
      setCollection(col);
      const allSketches = await getSketches(collectionId);
      setSketches(allSketches);
      const found = allSketches.find(s => s.id === sketchId);
      setSketch(found || null);

      if (found) {
        const votes = await getVoteCount(found.id);
        setVoteCount(votes);
      }
    };
    loadSketch();
  }, [collectionId, sketchId]);

  if (!sketch || !collection) {
    return <div>Sketch not found</div>;
  }

  const currentIndex = sketches.findIndex(s => s.id === sketchId);
  const prevSketch = currentIndex > 0 ? sketches[currentIndex - 1] : null;
  const nextSketch = currentIndex < sketches.length - 1 ? sketches[currentIndex + 1] : null;

  const handleVote = async () => {
    try {
      const newCount = await addVote(collectionId, sketchId);
      setVoteCount(newCount);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  return (
    <div className="sketch-detail">
      <button
        className="back-button"
        onClick={() => onNavigate({ type: 'collection-detail', collectionId })}
      >
        ← Back to Collection
      </button>

      <div className="sketch-detail-container">
        <div className="sketch-detail-main">
          <div className="sketch-canvas-wrapper">
            <WireframeContainer layout={sketch.layout} isInteractive={false} />
          </div>
        </div>

        <div className="sketch-detail-sidebar">
          <h1 className="sketch-detail-title">{sketch.title}</h1>

          <div className="sketch-detail-description">
            <h3>Concept</h3>
            <p>{sketch.description}</p>
          </div>

          <div className="sketch-detail-variations">
            <h3>Key Variations</h3>
            <ul>
              {sketch.conceptVariations.map((variation, i) => (
                <li key={i}>{variation}</li>
              ))}
            </ul>
          </div>

          <div className="sketch-detail-vote">
            <Button onClick={handleVote} variant="primary" size="large">
              ▲ Vote ({voteCount})
            </Button>
          </div>

          <div className="sketch-navigation">
            {prevSketch && (
              <Button
                onClick={() => onNavigate({ type: 'sketch-detail', collectionId, sketchId: prevSketch.id })}
                variant="secondary"
                size="small"
              >
                ← Previous
              </Button>
            )}
            {nextSketch && (
              <Button
                onClick={() => onNavigate({ type: 'sketch-detail', collectionId, sketchId: nextSketch.id })}
                variant="secondary"
                size="small"
              >
                Next →
              </Button>
            )}
          </div>

          <div className="sketch-info">
            <div className="info-item">
              <span className="info-label">Group:</span>
              <span className="info-value">
                {collection.groups.find(g => g.id === sketch.groupId)?.title || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(sketch.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
