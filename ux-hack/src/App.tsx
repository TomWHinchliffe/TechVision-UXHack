import { useState, useRef } from "react";
import TetrisBoard from "./TetrisBoard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const sixseven = useRef(new Audio("/sounds/victory.mp3"));

  if (isLoggedIn) {
    sixseven.current.currentTime = 0;
    sixseven.current.play();

    return (
      <div className="game-shell success-shell shake-screen">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="game-header"
        >
          <img
            style={{ width: "500px" }}
            src="/thumbs_up.png"
            alt="Success animation"
          />
        </div>
      </div>
    );
  }

  return <TetrisBoard onLoginSuccess={() => setIsLoggedIn(true)} />;
}

export default App;
