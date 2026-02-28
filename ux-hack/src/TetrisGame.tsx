import React, { useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Image, Line, Rect } from 'react-konva';
import useImage from 'use-image';

const BLOCK_SNAP_SIZE = 30; // Your grid size
const TOTAL_PIECES = 25; 

// This component now handles scaling
const TetrisPiece: React.FC<any> = ({ id, url, x, y, onDragStart, onDragMove, onDragEnd }) => {
  const [image] = useImage(url);
  
  // Calculate scale once image loads
  // We assume the original 'cell' in Python was, for example, 100px.
  // We scale it down to match our 30px BLOCK_SNAP_SIZE.
  const scaleAttrs = useMemo(() => {
    if (!image) return { scaleX: 1, scaleY: 1 };

    /* IMPORTANT: This logic assumes your Python script cut the pieces 
       using a grid that you can define here. 
       If your Python grid was 100px and React is 30px, scale is 0.3
    */
    const originalCellSize = 100; // Change this to match your Python script's cell size
    const scale = BLOCK_SNAP_SIZE / originalCellSize;
    
    return {
      scaleX: scale,
      scaleY: scale
    };
  }, [image]);

  return (
    <Image
      image={image}
      x={x}
      y={y}
      scaleX={scaleAttrs.scaleX}
      scaleY={scaleAttrs.scaleY}
      draggable
      onDragStart={(e) => {
        e.target.moveToTop();
        onDragStart(id, e.target.x(), e.target.y());
      }}
      onDragMove={(e) => {
        onDragMove(e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        const snappedX = Math.round(e.target.x() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
        const snappedY = Math.round(e.target.y() / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE;
        onDragEnd(id, snappedX, snappedY);
      }}
    />
  );
};

const TetrisGame: React.FC = () => {
  const [pieces, setPieces] = useState<{ id: string; url: string; x: number; y: number }[]>([]);
  const [shadow, setShadow] = useState({ x: 0, y: 0, visible: false });

  // 1. Initialize pieces from the public folder
  useEffect(() => {
    const initialPieces = Array.from({ length: TOTAL_PIECES }).map((_, i) => ({
      id: `piece-${i}`,
      url: `/tetris_pieces/piece_${i}.png`,
      // Spread them out randomly so they don't all stack in one corner
      x: Math.floor(Math.random() * 10) * BLOCK_SNAP_SIZE,
      y: Math.floor(Math.random() * 10) * BLOCK_SNAP_SIZE,
    }));
    setPieces(initialPieces);
  }, []);

  // 2. Start showing the shadow when a piece is picked up
  const handleDragStart = (id: string, x: number, y: number) => {
    setShadow({
      x: Math.round(x / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
      y: Math.round(y / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
      visible: true,
    });
  };

  // 3. Move the shadow as the user drags
  const handleDragMove = (x: number, y: number) => {
    setShadow((prev) => ({
      ...prev,
      x: Math.round(x / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
      y: Math.round(y / BLOCK_SNAP_SIZE) * BLOCK_SNAP_SIZE,
    }));
  };

  // 4. Update the actual piece position and hide the shadow
  const handleDragEnd = (id: string, x: number, y: number) => {
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p))
    );
    setShadow((prev) => ({ ...prev, visible: false }));
  };

  // Memoize grid lines to prevent lag during dragging
  const gridLines = useMemo(() => {
    const lines = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    for (let i = 0; i < width / BLOCK_SNAP_SIZE; i++) {
      lines.push(<Line key={`v${i}`} points={[i * BLOCK_SNAP_SIZE, 0, i * BLOCK_SNAP_SIZE, height]} stroke="#eee" strokeWidth={1} />);
    }
    for (let j = 0; j < height / BLOCK_SNAP_SIZE; j++) {
      lines.push(<Line key={`h${j}`} points={[0, j * BLOCK_SNAP_SIZE, width, j * BLOCK_SNAP_SIZE]} stroke="#eee" strokeWidth={0.5} />);
    }
    return lines;
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      {/* Layer 1: The Grid Background */}
      <Layer>{gridLines}</Layer>
      
      {/* Layer 2: The Gameplay Elements */}
      <Layer>
        {/* The "Ghost" shadow that shows where the piece will land */}
        {shadow.visible && (
          <Rect
            x={shadow.x}
            y={shadow.y}
            width={BLOCK_SNAP_SIZE * 3} // Approximation; usually hidden behind the piece
            height={BLOCK_SNAP_SIZE * 3}
            fill="rgba(255, 123, 23, 0.3)"
            stroke="#CF6412"
            strokeWidth={1}
            dash={[5, 5]}
          />
        )}
        
        {/* Render all the pieces */}
        {pieces.map((p) => (
          <TetrisPiece
            key={p.id}
            {...p}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default TetrisGame;