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

const playSound = (sound: HTMLAudioElement) => {
  sound.currentTime = 0;
  sound.play();
};

const DEFAULT_PIECE_BORDER = "#5e6960";
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "password123";
const USERNAME_INPUT_X = 170;
const USERNAME_INPUT_Y = 269;
const PASSWORD_INPUT_X = 170;
const PASSWORD_INPUT_Y = 420;
const SUBMIT_BUTTON_X = 165;
const SUBMIT_BUTTON_Y = 530;
const CAPTCHA_TRIGGER_STEP = 5;

type CaptchaType =
  | "human_phrase"
  | "duck_math"
  | "reverse_brain"
  | "human_delay";

type CaptchaChallenge = {
  type: CaptchaType;
  prompt: string;
  answer: string;
  timeLimitMs: number;
  minDelayMs?: number;
};

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

type TetrisBoardProps = {
  onLoginSuccess: () => void;
};

export default ({ onLoginSuccess }: TetrisBoardProps) => {
  const confetti = useRef(new Audio("/sounds/confetti.mp3"));
  const countdown = useRef(new Audio("/sounds/countdown.mp3"));
  const pop = useRef(new Audio("/sounds/pop.mp3"));
  const victory = useRef(new Audio("/sounds/victory.mp3"));
  const lose = useRef(new Audio("/sounds/lose.m4a"));
  const [fullBoardImage] = useImage(fullImage);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeCaptcha, setActiveCaptcha] = useState<CaptchaChallenge | null>(
    null,
  );
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaStartedAt, setCaptchaStartedAt] = useState(0);
  const [captchaTimeLeft, setCaptchaTimeLeft] = useState(0);
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

    const nextX = clampToBoard(
      Math.round(targetX / CELL_SIZE) * CELL_SIZE,
      BOARD_SIZE - width,
    );

    const nextY = clampToBoard(
      Math.round(targetY / CELL_SIZE) * CELL_SIZE,
      BOARD_SIZE - height,
    );

    playSound(pop.current);

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

  const [lastCaptchaSolvedCheckpoint, setLastCaptchaSolvedCheckpoint] =
    useState(0);

  const createCaptchaChallenge = (): CaptchaChallenge => {
    const captchaTypes: CaptchaType[] = [
      "human_phrase",
      "duck_math",
      "reverse_brain",
      "human_delay",
    ];
    const selectedType =
      captchaTypes[Math.floor(Math.random() * captchaTypes.length)];

    if (selectedType === "human_phrase") {
      return {
        type: "human_phrase",
        prompt: 'Type: "IaMdeFinItElYHumAN"',
        answer: "IaMdeFinItElYHumAN",
        timeLimitMs: 10000,
      };
    }

    if (selectedType === "duck_math") {
      const duckCount = 2 + Math.floor(Math.random() * 10);
      return {
        type: "duck_math",
        prompt: `2 + ${"🦆".repeat(duckCount)} = ?`,
        answer: String(2 + duckCount),
        timeLimitMs: 10000,
      };
    }

    if (selectedType === "reverse_brain") {
      const wordPool = [
        "login",
        "votepls",
        "linkedin",
        "puzzle",
      ];
      const selectedWord =
        wordPool[Math.floor(Math.random() * wordPool.length)];
      return {
        type: "reverse_brain",
        prompt: `Type this backwards: ${selectedWord}`,
        answer: selectedWord.split("").reverse().join(""),
        timeLimitMs: 10000,
      };
    }

    return {
      type: "human_delay",
      prompt: 'Wait at least 2 seconds, then type "ok" and submit',
      answer: "ok",
      timeLimitMs: 10000,
      minDelayMs: 2000,
    };
  };

  const openCaptcha = () => {
    const nextCaptcha = createCaptchaChallenge();
    setActiveCaptcha(nextCaptcha);
    setCaptchaInput("");
    setCaptchaStartedAt(Date.now());
    setCaptchaTimeLeft(Math.ceil(nextCaptcha.timeLimitMs / 1000));
    playSound(countdown.current);
  };

  useEffect(() => {
    const shouldTrigger =
      solvedCount > 0 &&
      solvedCount % CAPTCHA_TRIGGER_STEP === 0 &&
      !isCompleted &&
      !activeCaptcha &&
      solvedCount !== lastCaptchaSolvedCheckpoint;

    if (shouldTrigger) {
      setLastCaptchaSolvedCheckpoint(solvedCount);
      openCaptcha();
    }
  }, [solvedCount, lastCaptchaSolvedCheckpoint, isCompleted, activeCaptcha]);

  const resetBoard = () => {
    setPiecePositions(
      pieces.map((piece) => {
        const spawn = getSpawnPosition(piece);
        return { piece, x: spawn.x, y: spawn.y };
      }),
    );
    setIsCompleted(false);
    setLastCaptchaSolvedCheckpoint(0);
    setActiveCaptcha(null);
    setCaptchaInput("");
    setCaptchaStartedAt(0);
    setCaptchaTimeLeft(0);
  };

  useEffect(() => {
    if (!activeCaptcha) return;

    const timer = window.setInterval(() => {
      const elapsedMs = Date.now() - captchaStartedAt;
      const remainingMs = activeCaptcha.timeLimitMs - elapsedMs;

      if (remainingMs <= 0) {
        resetBoard();
        return;
      }

      setCaptchaTimeLeft(Math.ceil(remainingMs / 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [activeCaptcha, captchaStartedAt]);

  useEffect(() => {
    if (solvedCount === pieces.length && pieces.length > 0) {
      playSound(confetti.current);
      setIsCompleted(true);
    }
  }, [solvedCount, pieces.length]);

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
      setLoginError("");
      onLoginSuccess();
      return;
    }

    setLoginError("Invalid username or password");
  };

  const handleCaptchaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCaptcha) return;

    const elapsedMs = Date.now() - captchaStartedAt;
    if (elapsedMs > activeCaptcha.timeLimitMs) {
      resetBoard();
      return;
    }

    if (
      activeCaptcha.type === "human_delay" &&
      activeCaptcha.minDelayMs &&
      elapsedMs < activeCaptcha.minDelayMs
    ) {
      resetBoard();
      return;
    }

    const normalizedInput = captchaInput.trim();
    const normalizedAnswer = activeCaptcha.answer.trim();

    if (normalizedInput !== normalizedAnswer) {
      resetBoard();
      playSound(lose.current);
      return;
    } else if (normalizedInput == normalizedAnswer) {
      playSound(victory.current);
    }

    setActiveCaptcha(null);
    setCaptchaInput("");
    setCaptchaStartedAt(0);
    setCaptchaTimeLeft(0);
  };

  return (
    <div className="game-shell">
      <div className="game-header">
        <h1 className="game-title">Log In.</h1>
        <p className="game-subtitle">
          Drag and drop pieces from the tray to build the login page in the
          12x12 board. Pieces snap to the grid when dropped inside. The username
          is "admin", and the password is "password123". Login if you dare!
          Enjoy :)
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
              fill="#566d58"
              listening={false}
            />
            {Array.from({ length: GRID_COUNT * GRID_COUNT }).map((_, i) => (
              <Rect
                key={i}
                x={(i % GRID_COUNT) * CELL_SIZE}
                y={Math.floor(i / GRID_COUNT) * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                stroke="#9ca395"
                strokeWidth={3}
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
              fill="#536355"
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
                  draggable={!activeCaptcha}
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
                    activeCaptcha
                      ? undefined
                      : movePiece(entry.piece.id, e.target.x(), e.target.y())
                  }
                />
              );
            })}
          </Layer>
        </Stage>
        {activeCaptcha ? (
          <form className="captcha-overlay" onSubmit={handleCaptchaSubmit}>
            <h2 className="captcha-title">Captcha Check</h2>
            <p className="captcha-prompt">{activeCaptcha.prompt}</p>
            <p className="captcha-timer">Time left: {captchaTimeLeft}s</p>
            <input
              className="captcha-input"
              type="text"
              value={captchaInput}
              onChange={(event) => setCaptchaInput(event.target.value)}
              placeholder="Enter captcha answer"
              autoFocus
            />
            <button className="captcha-button" type="submit">
              Submit Captcha
            </button>
          </form>
        ) : null}
        {isCompleted ? (
          <form className="login-form-overlay" onSubmit={handleLoginSubmit}>
            <input
              className="login-form-input"
              style={{ left: USERNAME_INPUT_X, top: USERNAME_INPUT_Y }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
            <input
              className="login-form-input"
              style={{ left: PASSWORD_INPUT_X, top: PASSWORD_INPUT_Y }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              className="login-form-button"
              style={{ left: SUBMIT_BUTTON_X, top: SUBMIT_BUTTON_Y }}
              type="submit"
            >
              Login
            </button>
            {loginError ? (
              <p className="login-form-error">{loginError}</p>
            ) : null}
          </form>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
