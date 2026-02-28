import { useState } from "react";
import TetrisBoard from "./TetrisBoard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return (
      <div className="game-shell success-shell">
        <div className="game-header">
          <h1 className="game-title">Welcome</h1>
          <p className="game-subtitle">You are now on the next page.</p>
        </div>
      </div>
    );
  }

  return <TetrisBoard onLoginSuccess={() => setIsLoggedIn(true)} />;
}

export default App;
