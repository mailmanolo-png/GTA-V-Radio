import { useEffect, useState } from "react";
import { RadioWheel } from "./RadioWheel";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {showSplash && (
        <div className="splash-screen">
          <img src="/icons/icon-512.png" alt="GTA Radio" />
          <h1>GTA Radio</h1>
          <p>Loading stations...</p>
        </div>
      )}

      <RadioWheel />
    </div>
  );
}

export default App;