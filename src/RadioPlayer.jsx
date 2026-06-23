import { useEffect, useRef, useState } from "react";

function getLivePosition(duration) {
  const seconds = Math.floor(Number(duration));
  if (!seconds || seconds <= 0) return 0;
  return Math.floor(Date.now() / 1000) % seconds;
}

function getArtworkType(filename) {
  if (!filename) return "image/png";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  return "image/png";
}

export function RadioPlayer({ station }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !station || station.name === "None") return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error("Playback toggle failed:", err);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!station || station.name === "None" || !station.link) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    const startPlayback = () => {
      const livePosition = getLivePosition(audio.duration - 5);
      audio.currentTime = livePosition;

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: "Grand Theft Auto V",
          album: "Radio",
          artwork: [
            {
              src: `/radiostation/${station.filename}`,
              sizes: "512x512",
              type: getArtworkType(station.filename)
            }
          ]
        });
      }

      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
      });
    };

    const handleLoadedMetadata = () => startPlayback();
    const handleEnded = () => startPlayback();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.src = station.link;
    audio.load();

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [station?.name, station?.link, station?.filename]);

  return (
    <div className="custom-player">
      <audio ref={audioRef} preload="auto" playsInline />

      <button className="custom-play-button" onClick={togglePlayback}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div className="custom-player-info">
        <strong>{station?.name || "Radio Off"}</strong>
        <span>Grand Theft Auto V Radio</span>
      </div>
    </div>
  );
}