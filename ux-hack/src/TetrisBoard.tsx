import { useMemo, useState, useEffect, useRef } from "react";
import { Stage, Layer, Image, Rect, Text } from "react-konva";
import useImage from "use-image";
import manifestData from "./data";
import fullImage from "./assets/image.jpeg";

const BOARD_SIZE = 720;
const GRID_COUNT = 12;
const CELL_SIZE = BOARD_SIZE / GRID_COUNT;
const SIDEBAR_WIDTH = 280;
const STAGE_WIDTH = BOARD_SIZE + SIDEBAR_WIDTH;
const CORRECT_PIECE_COLOR = "#FFFF00";
const DEFAULT_PIECE_BORDER = "#7e8cae";

type ManifestPiece = {
  id: number;
  url: string;
  gridX: number;
  gridY: number;
  wCells: number;
  hCells: number;
};

type PiecePosition = {
  piece: ManifestPiece;
  x: number;
  y: number;
};

const getSpawnPosition = (piece: ManifestPiece) => {
  const pieceWidth = piece.wCells * CELL_SIZE;
  const pieceHeight = piece.hCells * CELL_SIZE;
  const spawnAreaX = BOARD_SIZE + 20;
  const spawnAreaY = 80;
  const spawnAreaWidth = SIDEBAR_WIDTH - 40;
  const spawnAreaHeight = BOARD_SIZE - 120;
  const maxX = spawnAreaX + Math.max(0, spawnAreaWidth - pieceWidth);
  const maxY = spawnAreaY + Math.max(0, spawnAreaHeight - pieceHeight);

  return {
    x: spawnAreaX + Math.random() * Math.max(1, maxX - spawnAreaX),
    y: spawnAreaY + Math.random() * Math.max(1, maxY - spawnAreaY),
  };
};

const clampToBoard = (value: number, max: number) =>
  Math.min(Math.max(value, 0), max);

const clampToStage = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const loginInputRef = useRef<HTMLInputElement>(null);
const passwordInputRef = useRef<HTMLInputElement>(null);

const [completedImage] = useImage("/assests/image.jpeg");

const Piece = ({
  piece,
  x,
  y,
  onDragEnd,
  dragBounds,
  draggable = true,
  borderColor = DEFAULT_PIECE_BORDER,
  borderWidth = 1,
}: any) => {
  const [img] = useImage(`/tetris_pieces/${piece.url}`);

  return (
    <Image
      image={img}
      x={x}
      y={y}
      width={piece.wCells * CELL_SIZE}
      height={piece.hCells * CELL_SIZE}
      draggable={draggable}
      dragBoundFunc={(pos) => ({
        x: Math.min(Math.max(pos.x, dragBounds.minX), dragBounds.maxX),
        y: Math.min(Math.max(pos.y, dragBounds.minY), dragBounds.maxY),
      })}
      onDragEnd={onDragEnd}
      onDragStart={(e) => e.target.moveToTop()}
      stroke={borderColor}
      strokeWidth={borderWidth}
      shadowBlur={0}
      opacity={1}
    />
  );
};

export default () => {
  const [fullBoardImage] = useImage(fullImage);
  const pieces = useMemo(() => manifestData as ManifestPiece[], []);
  const [piecePositions, setPiecePositions] = useState<PiecePosition[]>(() =>
    pieces.map((piece) => {
      const spawn = getSpawnPosition(piece);
      return { piece, x: spawn.x, y: spawn.y };
    }),
  );

  const movePiece = (pieceId: number, targetX: number, targetY: number) => {
    const targetPiece = pieces.find((p) => p.id === pieceId);
    if (!targetPiece) return;

    const width = targetPiece.wCells * CELL_SIZE;
    const height = targetPiece.hCells * CELL_SIZE;

    const isInsideBoard =
      targetX >= 0 &&
      targetY >= 0 &&
      targetX + width <= BOARD_SIZE &&
      targetY + height <= BOARD_SIZE;

    const nextX = clampToBoard(
      Math.round(targetX / CELL_SIZE) * CELL_SIZE,
      BOARD_SIZE - width,
    );

    const nextY = clampToBoard(
      Math.round(targetY / CELL_SIZE) * CELL_SIZE,
      BOARD_SIZE - height,
    );

    setPiecePositions((prev) =>
      prev.map((entry) =>
        entry.piece.id === pieceId ? { ...entry, x: nextX, y: nextY } : entry,
      ),
    );
  };

  const solvedCount = piecePositions.filter((entry) => {
    const correctX = entry.piece.gridX * CELL_SIZE;
    const correctY = entry.piece.gridY * CELL_SIZE;
    return Math.abs(entry.x - correctX) < 1 && Math.abs(entry.y - correctY) < 1;
  }).length;

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (solvedCount === pieces.length && pieces.length > 0) {
      setIsCompleted(true);
    }
  }, [solvedCount, pieces.length]);

  return (
    
    <div className="game-shell">
      <div className="game-header">
        <h1 className="game-title">Log In.</h1>
        <p className="game-subtitle">
          Drag and drop pieces of the login page from the tray into the 12x12 board. Pieces snap to
          the grid when dropped inside.
        </p>
      </div>
      <div
        style={{ border: isCompleted ? "4px solid #00FF00" : "none" }}
        className="game-canvas-wrap"
      >
        <Stage width={STAGE_WIDTH} height={BOARD_SIZE}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={BOARD_SIZE}
              height={BOARD_SIZE}
              fill="#5c6457"
              listening={false}
            />
            {Array.from({ length: GRID_COUNT * GRID_COUNT }).map((_, i) => (
              <Rect
                key={i}
                x={(i % GRID_COUNT) * CELL_SIZE}
                y={Math.floor(i / GRID_COUNT) * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                stroke="#a4ad9b"
                strokeWidth={1.35}
                listening={false}
              />
            ))}
            <Image
              visible={isCompleted ? true : false}
              image={fullBoardImage}
              x={0}
              y={0}
              width={BOARD_SIZE}
              height={BOARD_SIZE}
              listening={false}
            />
            <Rect
              x={BOARD_SIZE}
              y={0}
              width={SIDEBAR_WIDTH}
              height={BOARD_SIZE}
              fill="#a0ae8a"
              listening={false}
            />
            <Text
              x={BOARD_SIZE + 16}
              y={20}
              text={`Pieces: ${solvedCount}/${pieces.length}`}
              fontSize={21}
              fontStyle="bold"
              fill="#ffffff"
              listening={false}
            />
            <Text
              x={BOARD_SIZE + 16}
              y={48}
              width={SIDEBAR_WIDTH - 26}
              text="Piece Tray"
              fontSize={14}
              fill="#eef3ff"
              listening={false}
            />
          </Layer>
          <Layer visible={isCompleted ? false : true}>
            {piecePositions.map((entry) => {
              const correctX = entry.piece.gridX * CELL_SIZE;
              const correctY = entry.piece.gridY * CELL_SIZE;
              const isCorrect =
                Math.abs(entry.x - correctX) < 1 &&
                Math.abs(entry.y - correctY) < 1;

              return (
                <Piece
                  key={entry.piece.id}
                  piece={entry.piece}
                  x={entry.x}
                  y={entry.y}
                  draggable={!isCorrect}
                  dragBounds={{
                    minX: 0,
                    minY: 0,
                    maxX: STAGE_WIDTH - entry.piece.wCells * CELL_SIZE,
                    maxY: BOARD_SIZE - entry.piece.hCells * CELL_SIZE,
                  }}
                  borderColor={
                    isCompleted
                      ? DEFAULT_PIECE_BORDER
                      : isCorrect
                        ? CORRECT_PIECE_COLOR
                        : DEFAULT_PIECE_BORDER
                  }
                  borderWidth={isCompleted ? 1.5 : isCorrect ? 6 : 1.5}
                  onDragEnd={(e: any) =>
                    movePiece(entry.piece.id, e.target.x(), e.target.y())
                  }
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>

  );
};
