import React, { useState, useEffect } from 'react';
import { Collection, Sketch } from '../types';
import { getCollectionByShareToken, getSketches, getVoteCount, addVote } from '../services/storage/storageManager';
import { Button } from '../components/ui/Button';
import { WireframeContainer } from '../components/wireframes/WireframeContainer';
import './SharedCollection.css';

interface SharedCollectionProps {
  token: string;
}

export const SharedCollection: React.FC<SharedCollectionProps> = ({ token }) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'votes'>('default');
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState<{ [sketchId: string]: number }>({});

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const col = await getCollectionByShareToken(token);
        if (col) {
          setCollection(col);
          const allSketches = await getSketches(col.id);
          setSketches(allSketches);

          // Load vote counts for all sketches
          const votes: { [sketchId: string]: number } = {};
          for (const sketch of allSketches) {
            votes[sketch.id] = await getVoteCount(sketch.id);
          }
          setVoteCounts(votes);
        }
      } catch (err) {
        console.error('Failed to load collection:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCollection();
  }, [token]);

  if (loading) {
    return <div className="shared-collection-loading">Loading...</div>;
  }

  if (!collection) {
    return (
      <div className="shared-collection-error">
        <h2>Collection not found</h2>
        <p>This shared collection no longer exists or the link is invalid.</p>
      </div>
    );
  }

  const sortedSketches = sortBy === 'votes'
    ? [...sketches].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0))
    : sketches;

  const sketchesByGroup: { [groupId: string]: Sketch[] } = {};
  sortedSketches.forEach(sketch => {
    if (!sketchesByGroup[sketch.groupId]) {
      sketchesByGroup[sketch.groupId] = [];
    }
    sketchesByGroup[sketch.groupId].push(sketch);
  });

  const handleVote = async (sketchId: string) => {
    try {
      const newCount = await addVote(collection.id, sketchId);
      setVoteCounts(prev => ({ ...prev, [sketchId]: newCount }));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  return (
    <div className="shared-collection">
      <div className="shared-collection-header">
        <div>
          <h1>{collection.title}</h1>
          <p className="shared-collection-prompt">{collection.prompt}</p>
        </div>
      </div>

      <div className="shared-controls">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'default' | 'votes')}>
            <option value="default">Default Order</option>
            <option value="votes">Most Votes</option>
          </select>
        </div>
        <div className="collection-stats">
          <span>{sketches.length} ideas · {collection.groups.length} groups</span>
        </div>
      </div>

      <div className="groups-container">
        {collection.groups.map(group => (
          <div key={group.id} className="group-section">
            <h2 className="group-title">
              {group.title}
              <span className="group-count">{sketchesByGroup[group.id]?.length || 0} ideas</span>
            </h2>
            <div className="sketches-grid">
              {sketchesByGroup[group.id]?.map(sketch => (
                <div key={sketch.id} className="sketch-preview-shared">
                  <div className="sketch-preview-canvas">
                    <WireframeContainer layout={sketch.layout} />
                  </div>
                  <div className="sketch-preview-info">
                    <h4 className="sketch-preview-title">{sketch.title}</h4>
                    <div className="sketch-preview-footer">
                      <button
                        className="vote-button"
                        onClick={() => handleVote(sketch.id)}
                      >
                        ▲ {voteCounts[sketch.id] || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
