import React from 'react';
import { WireframeSection as WireframeSectionType } from '../../../types';
import { WireframeComponent } from './WireframeComponent';

interface Props {
  section: WireframeSectionType;
}

export const WireframeSection: React.FC<Props> = ({ section }) => {
  const { x, y } = section.position;
  const { width, height } = section.size;
  const fill = section.backgroundColor === 'lightgray' ? '#f5f5f5' : 'white';

  return (
    <g key={section.id}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#ddd"
        strokeWidth="1"
      />
      {section.children.map((child) => (
        <WireframeComponent key={child.id} component={child} />
      ))}
    </g>
  );
};
