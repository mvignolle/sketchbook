import React from 'react';
import { Collection } from '../../types';
import './CollectionCard.css';

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onClick,
}) => {
  const lastModified = new Date(collection.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: collection.updatedAt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div className="collection-card" onClick={onClick}>
      <div className="collection-card-header">
        <h3 className="collection-card-title">{collection.title}</h3>
        <span className="collection-card-meta">
          {collection.metadata.totalSketches} idea{collection.metadata.totalSketches === 1 ? '' : 's'}
        </span>
      </div>

      <p className="collection-card-prompt">
        {collection.prompt.substring(0, 120)}
        {collection.prompt.length > 120 ? '...' : ''}
      </p>

      <div className="collection-card-footer">
        <div className="collection-card-stats">
          <span>{collection.groups.length} group{collection.groups.length === 1 ? '' : 's'}</span>
          <span className="stat-separator">·</span>
          <span>{collection.metadata.totalVotes} vote{collection.metadata.totalVotes === 1 ? '' : 's'}</span>
        </div>
        <span className="collection-card-date">{lastModified}</span>
      </div>
    </div>
  );
};
