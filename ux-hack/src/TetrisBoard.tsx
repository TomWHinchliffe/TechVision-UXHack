import React, { useState } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import manifestData from './data'; 

const STAGE_SIZE = 720; // Slightly larger for 12x12
const GRID_COUNT = 12;
const CELL_SIZE = STAGE_SIZE / GRID_COUNT;

const Piece = ({ piece }: any) => {
  const [img] = useImage(`/tetris_pieces/${piece.url}`);
  const [pos, setPos] = useState({
    x: Math.random() * (STAGE_SIZE - CELL_SIZE * 2),
    y: Math.random() * (STAGE_SIZE - CELL_SIZE * 2),
  });

  const correctX = piece.gridX * CELL_SIZE;
  const correctY = piece.gridY * CELL_SIZE;

  const handleDragEnd = (e: any) => {
    const nx = Math.round(e.target.x() / CELL_SIZE) * CELL_SIZE;
    const ny = Math.round(e.target.y() / CELL_SIZE) * CELL_SIZE;
    setPos({ x: nx, y: ny });
  };

  const isCorrect = Math.abs(pos.x - correctX) < 1 && Math.abs(pos.y - correctY) < 1;

  return (
    <Image
      image={img}
      x={pos.x}
      y={pos.y}
      width={piece.wCells * CELL_SIZE}
      height={piece.hCells * CELL_SIZE}
      draggable
      onDragEnd={handleDragEnd}
      onDragStart={(e) => e.target.moveToTop()}
      // Green border if correct, otherwise subtle gray
      stroke={isCorrect ? '#00FF00' : '#444'}
      strokeWidth={isCorrect ? 3 : 1}
      shadowBlur={isCorrect ? 0 : 5}
      opacity={1}
    />
  );
};

export default () => {
  return (
    <div style={{ background: '#111', padding: '20px' }}>
      <Stage width={STAGE_SIZE} height={STAGE_SIZE}>
        <Layer>
          {Array.from({ length: GRID_COUNT * GRID_COUNT }).map((_, i) => (
            <Rect
              key={i}
              x={(i % GRID_COUNT) * CELL_SIZE}
              y={Math.floor(i / GRID_COUNT) * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              stroke="#222"
              listening={false}
            />
          ))}
        </Layer>
        <Layer>
          {manifestData.map((p) => (
            <Piece key={p.id} piece={p} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};