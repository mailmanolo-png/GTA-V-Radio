import { useContext, useEffect, useRef, useState } from "react";
import { SongContext } from "./context/songplaying";

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
  const { songs, setStationPlaying } = useContext(SongContext);

  const getPlayableStations = () =>
    songs.filter((s) => s.name !== "None" && s.link);

  const setMediaPlaybackState = (state) => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  };

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !station || station.name === "None") return;

    try {
      await audio.play();
      setMediaPlaybackState("playing");
    } catch (err) {
      console.error("Play failed:", err);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setMediaPlaybackState("paused");
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await playAudio();
    } else {
      pauseAudio();
    }
  };

  const skipToNextStation = () => {
    const playableStations = getPlayableStations();
    if (!playableStations.length || !station) return;

    const currentIndex = playableStations.findIndex(
      (s) => s.name === station.name
    );

    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex - 1 + playableStations.length) %
          playableStations.length;

    setStationPlaying(playableStations[nextIndex]);
  };

  const skipToPreviousStation = () => {
    const playableStations = getPlayableStations();
    if (!playableStations.length || !station) return;

    const currentIndex = playableStations.findIndex(
      (s) => s.name === station.name
    );

    const previousIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) % playableStations.length;

    setStationPlaying(playableStations[previousIndex]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!station || station.name === "None" || !station.link) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      setMediaPlaybackState("none");
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

        navigator.mediaSession.setActionHandler("play", playAudio);
        navigator.mediaSession.setActionHandler("pause", pauseAudio);
        navigator.mediaSession.setActionHandler("stop", pauseAudio);
        navigator.mediaSession.setActionHandler("nexttrack", skipToNextStation);
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          skipToPreviousStation
        );
      }

      playAudio();
    };

    const handleLoadedMetadata = () => {
      startPlayback();
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      playAudio();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setMediaPlaybackState("playing");
    };

    const handlePause = () => {
      setIsPlaying(false);
      setMediaPlaybackState("paused");
    };

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

      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("stop", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
      }
    };
  }, [station?.name, station?.link, station?.filename, songs]);

  return (
    <div className="custom-player">
      <audio ref={audioRef} preload="auto" playsInline />

      <button className="custom-play-button" onClick={togglePlayback}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button className="custom-play-button" onClick={skipToPreviousStation}>
        Prev
      </button>

      <button className="custom-play-button" onClick={skipToNextStation}>
        Next
      </button>

      <div className="custom-player-info">
        <strong>{station?.name || "Radio Off"}</strong>
        <span>Grand Theft Auto V Radio</span>
      </div>
    </div>
  );
}