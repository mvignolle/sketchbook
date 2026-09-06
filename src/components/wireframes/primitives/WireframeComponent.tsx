import React from 'react';
import { WireframeComponent as WireframeComponentType } from '../../../types';

interface Props {
  component: WireframeComponentType;
}

export const WireframeComponent: React.FC<Props> = ({ component }) => {
  const { x, y } = component.position;
  const { width, height } = component.size;
  const { label } = component.properties;

  switch (component.type) {
    case 'card':
      return <WireframeCard x={x} y={y} width={width} height={height} label={label} component={component} />;
    case 'button':
      return <WireframeButton x={x} y={y} width={width} height={height} label={label} />;
    case 'text':
      return <WireframeText x={x} y={y} width={width} height={height} label={label} />;
    case 'shape':
      return <WireframeShape x={x} y={y} width={width} height={height} label={label} />;
    case 'list':
      return <WireframeList x={x} y={y} width={width} height={height} items={component.properties.items || 3} />;
    case 'grid':
      return (
        <WireframeGrid
          x={x}
          y={y}
          width={width}
          height={height}
          columns={component.properties.columns || 2}
          children={component.children || []}
        />
      );
    case 'form':
      return <WireframeForm x={x} y={y} width={width} height={height} label={label} />;
    case 'input':
      return <WireframeInput x={x} y={y} width={width} height={height} placeholder={component.properties.placeholder} />;
    case 'separator':
      return <WireframeSeparator x={x} y={y} width={width} />;
    default:
      return null;
  }
};

const WireframeCard: React.FC<{ x: number; y: number; width: number; height: number; label?: string; component: WireframeComponentType }> = ({
  x,
  y,
  width,
  height,
  label,
  component,
}) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="white" stroke="#333" strokeWidth="1.5" />
      {label && (
        <text
          x={x + 8}
          y={y + 20}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fill="#666"
        >
          {label}
        </text>
      )}
      {component.children?.map((child) => (
        <WireframeComponent key={child.id} component={child} />
      ))}
    </g>
  );
};

const WireframeButton: React.FC<{ x: number; y: number; width: number; height: number; label?: string }> = ({
  x,
  y,
  width,
  height,
  label,
}) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="white"
        stroke="#333"
        strokeWidth="1.5"
        rx="2"
      />
      {label && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 4}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fill="#333"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

const WireframeText: React.FC<{ x: number; y: number; width: number; height: number; label?: string }> = ({
  x,
  y,
  width,
  height,
  label,
}) => {
  return (
    <text
      x={x}
      y={y + 12}
      fontSize="13"
      fontFamily="system-ui, sans-serif"
      fill="#333"
      fontWeight="500"
    >
      {label || 'Text'}
    </text>
  );
};

const WireframeShape: React.FC<{ x: number; y: number; width: number; height: number; label?: string }> = ({
  x,
  y,
  width,
  height,
  label,
}) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#f5f5f5"
        stroke="#999"
        strokeWidth="1.5"
        strokeDasharray="4,4"
      />
      {label && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fill="#999"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};

const WireframeList: React.FC<{ x: number; y: number; width: number; height: number; items: number }> = ({
  x,
  y,
  width,
  height,
  items,
}) => {
  const itemHeight = height / items;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="white" stroke="#333" strokeWidth="1" />
      {Array.from({ length: items }).map((_, i) => (
        <line
          key={i}
          x1={x}
          y1={y + (i + 1) * itemHeight}
          x2={x + width}
          y2={y + (i + 1) * itemHeight}
          stroke="#ddd"
          strokeWidth="0.5"
        />
      ))}
      <circle cx={x + 8} cy={y + itemHeight / 2} r="3" fill="#999" />
      <text
        x={x + 16}
        y={y + itemHeight / 2 + 3}
        fontSize="11"
        fontFamily="system-ui, sans-serif"
        fill="#666"
      >
        Item
      </text>
    </g>
  );
};

const WireframeGrid: React.FC<{ x: number; y: number; width: number; height: number; columns: number; children: any[] }> = ({
  x,
  y,
  width,
  height,
  columns,
  children,
}) => {
  const colWidth = width / columns;

  return (
    <g>
      {Array.from({ length: columns }).map((_, col) => (
        <line
          key={`vcol-${col}`}
          x1={x + col * colWidth}
          y1={y}
          x2={x + col * colWidth}
          y2={y + height}
          stroke="#ddd"
          strokeWidth="0.5"
        />
      ))}
      {children.slice(0, 4).map((child, i) => (
        <WireframeComponent
          key={i}
          component={{
            ...child,
            position: {
              x: x + (i % columns) * colWidth + 4,
              y: y + Math.floor(i / columns) * (height / Math.ceil(children.length / columns)) + 4,
            },
          }}
        />
      ))}
    </g>
  );
};

const WireframeForm: React.FC<{ x: number; y: number; width: number; height: number; label?: string }> = ({
  x,
  y,
  width,
  height,
  label,
}) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="white" stroke="#333" strokeWidth="1" />
      {label && (
        <text x={x + 8} y={y + 16} fontSize="12" fontFamily="system-ui, sans-serif" fill="#333" fontWeight="500">
          {label}
        </text>
      )}
      <line x1={x + 8} y1={y + 24} x2={x + width - 8} y2={y + 24} stroke="#ccc" strokeWidth="1" />
    </g>
  );
};

const WireframeInput: React.FC<{ x: number; y: number; width: number; height: number; placeholder?: string }> = ({
  x,
  y,
  width,
  height,
  placeholder,
}) => {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="white" stroke="#ccc" strokeWidth="1" rx="2" />
      {placeholder && (
        <text x={x + 6} y={y + height / 2 + 3} fontSize="11" fontFamily="system-ui, sans-serif" fill="#999">
          {placeholder}
        </text>
      )}
    </g>
  );
};

const WireframeSeparator: React.FC<{ x: number; y: number; width: number }> = ({ x, y, width }) => {
  return <line x1={x} y1={y} x2={x + width} y2={y} stroke="#ddd" strokeWidth="0.5" />;
};
