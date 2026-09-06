import React, { useState, useEffect } from 'react';
import { Collection } from '../types';
import { getAllCollections } from '../services/storage/storageManager';
import { Button } from '../components/ui/Button';
import { CollectionCard } from '../components/collection/CollectionCard';
import './CollectionsHome.css';

interface CollectionsHomeProps {
  onNavigate: (page: any) => void;
}

export const CollectionsHome: React.FC<CollectionsHomeProps> = ({ onNavigate }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await getAllCollections();
        setCollections(data);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    loadCollections();
  }, []);

  const handleCreateNew = () => {
    onNavigate({ type: 'create' });
  };

  const handleOpenCollection = (collectionId: string) => {
    onNavigate({ type: 'collection-detail', collectionId });
  };

  return (
    <div className="collections-home">
      <div className="collections-header">
        <div>
          <h1>Collections</h1>
          <p className="collections-subtitle">
            {collections.length === 0
              ? 'Start exploring design concepts'
              : `${collections.length} collection${collections.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button onClick={handleCreateNew} variant="primary" size="large">
          + New Collection
        </Button>
      </div>

      {loading ? (
        <div className="collections-loading">Loading...</div>
      ) : collections.length === 0 ? (
        <div className="collections-empty">
          <p>No collections yet. Create one to start exploring design ideas.</p>
          <Button onClick={handleCreateNew} variant="primary">
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleOpenCollection(collection.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
