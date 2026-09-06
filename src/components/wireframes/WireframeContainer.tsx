import React from 'react';
import { SketchLayout } from '../../types';
import './WireframeContainer.css';
import { WireframeSection } from './primitives/WireframeSection';

interface WireframeContainerProps {
  layout: SketchLayout;
  isInteractive?: boolean;
}

export const WireframeContainer: React.FC<WireframeContainerProps> = ({
  layout,
  isInteractive = false,
}) => {
  return (
    <div className="wireframe-container">
      <svg
        className="wireframe-canvas"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
      >
        <defs>
          <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect
          width={layout.width}
          height={layout.height}
          fill="white"
          stroke="#ddd"
          strokeWidth="1"
        />
        {layout.sections.map((section) => (
          <WireframeSection key={section.id} section={section} />
        ))}
      </svg>
    </div>
  );
};
