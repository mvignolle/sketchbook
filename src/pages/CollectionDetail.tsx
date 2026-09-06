import React, { useState, useEffect } from 'react';
import { Collection, Sketch } from '../types';
import { getCollection, getSketches, getVoteCount, addVote, generateShareToken } from '../services/storage/storageManager';
import { Button } from '../components/ui/Button';
import { WireframeContainer } from '../components/wireframes/WireframeContainer';
import { Modal } from '../components/ui/Modal';
import './CollectionDetail.css';

interface CollectionDetailProps {
  collectionId: string;
  onNavigate: (page: any) => void;
}

export const CollectionDetail: React.FC<CollectionDetailProps> = ({
  collectionId,
  onNavigate,
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'votes'>('default');
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const col = getCollection(collectionId);
    if (col) {
      setCollection(col);
      const allSketches = getSketches(collectionId);
      setSketches(allSketches);
    }
  }, [collectionId]);

  if (!collection) {
    return <div>Collection not found</div>;
  }

  const sortedSketches = sortBy === 'votes'
    ? [...sketches].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
    : sketches;

  const sketchesByGroup: { [groupId: string]: Sketch[] } = {};
  sortedSketches.forEach(sketch => {
    if (!sketchesByGroup[sketch.groupId]) {
      sketchesByGroup[sketch.groupId] = [];
    }
    sketchesByGroup[sketch.groupId].push(sketch);
  });

  const handleVote = (sketchId: string) => {
    addVote(collectionId, sketchId);
    setSketches(getSketches(collectionId));
  };

  const handleShare = () => {
    const token = generateShareToken(collectionId);
    setShareLink(`${window.location.origin}?share=${token}`);
    setShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="collection-detail">
      <div className="collection-detail-header">
        <div>
          <button
            className="back-button"
            onClick={() => onNavigate({ type: 'home' })}
          >
            ← Back
          </button>
          <h1>{collection.title}</h1>
          <p className="collection-detail-prompt">{collection.prompt}</p>
        </div>
        <div className="header-actions">
          <Button onClick={handleShare} variant="secondary">
            Share
          </Button>
          <Button
            onClick={() => onNavigate({ type: 'create' })}
            variant="secondary"
          >
            + Add Ideas
          </Button>
        </div>
      </div>

      <div className="collection-controls">
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
                <div
                  key={sketch.id}
                  className="sketch-preview"
                  onClick={() => onNavigate({ type: 'sketch-detail', collectionId, sketchId: sketch.id })}
                >
                  <div className="sketch-preview-canvas">
                    <WireframeContainer layout={sketch.layout} />
                  </div>
                  <div className="sketch-preview-info">
                    <h4 className="sketch-preview-title">{sketch.title}</h4>
                    <div className="sketch-preview-footer">
                      <button
                        className="vote-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(sketch.id);
                        }}
                      >
                        ▲ {getVoteCount(sketch.id)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={shareModal} onClose={() => setShareModal(false)} title="Share Collection">
        <div className="share-modal-content">
          <p>Share this link to view the collection:</p>
          <div className="share-link-container">
            <input type="text" value={shareLink} readOnly className="share-link-input" />
            <Button onClick={copyToClipboard} variant="primary" size="small">
              Copy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
