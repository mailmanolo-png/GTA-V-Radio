import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!station || station.name === "None" || !station.link) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
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

    const handleLoadedMetadata = () => {
      startPlayback();
    };

    const handleEnded = () => {
      startPlayback();
    };

    audio.src = station.link;
    audio.load();

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [station?.name, station?.link, station?.filename]);

  return (
    <div
      style={{
        position: "fixed",
        left: "12px",
        right: "12px",
        bottom: "20px",
        zIndex: 999999,
        background: "rgba(0, 0, 0, 0.75)",
        padding: "10px",
        borderRadius: "12px"
      }}
    >
      <audio
        ref={audioRef}
        preload="auto"
        controls
        playsInline
        style={{ width: "100%" }}
      />
    </div>
  );
}