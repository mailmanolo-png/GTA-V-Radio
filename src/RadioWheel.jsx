import { useState, useContext, useEffect } from "react";
import { RadioStation } from "./RadioStation";
import { SongContext } from "./context/songplaying";
import { RadioPlayer } from "./RadioPlayer";

function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function RadioWheel() {
  const [mouseCoord, setMouseCoord] = useState({ x: null, y: null });

  const {
    songs,
    stationPlaying,
    setStationPlaying,
    qDown,
    angle,
    setAngle
  } = useContext(SongContext);

  const angleStep = songs.length ? 360 / songs.length : 0;
  const height = 45;

  let songname = null;
  let artistname = null;

  stationPlaying?.timestamps?.forEach((timestamp) => {
    if (
      timestamp.start <= stationPlaying.location &&
      stationPlaying.location <= timestamp.end
    ) {
      songname = timestamp.song;
      artistname = timestamp.artist;
    }
  });

  const updateAngleFromPoint = (x, y) => {
    const vertical = window.innerHeight - y - window.innerHeight / 2;
    const horizontal = x - window.innerWidth / 2;

    let newAngle = (180 / Math.PI) * Math.atan2(horizontal, vertical);

    if (newAngle < 0) {
      newAngle += 360;
    }

    setAngle(newAngle);
  };

  const handleMouseMove = (e) => {
    setMouseCoord({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (!touch) return;

    updateAngleFromPoint(touch.clientX, touch.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;

    updateAngleFromPoint(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!qDown) return;

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [qDown]);

  useEffect(() => {
    if (mouseCoord.x === null) return;

    updateAngleFromPoint(mouseCoord.x, mouseCoord.y);
  }, [mouseCoord]);

  useEffect(() => {
    if (!songs.length || !angleStep) return;

    const touchDevice = isTouchDevice();

    if (!qDown && !touchDevice) return;

    let radioNumber = 0;

    for (
      let i = -angleStep / 2;
      i < -angleStep / 2 + 360;
      i += angleStep
    ) {
      if (i <= angle && angle < i + angleStep) {
        break;
      }

      radioNumber += 1;
    }

    const selectedIndex = songs.length - 1 - radioNumber;
    const selectedStation = songs[selectedIndex];

    if (
      selectedStation &&
      selectedStation.name !== stationPlaying?.name
    ) {
      setStationPlaying(selectedStation);
    }
  }, [qDown, angle, songs, angleStep, stationPlaying?.name, setStationPlaying]);

  return (
    <>
      {qDown ? (
        <style>{`body { cursor: none; }`}</style>
      ) : (
        <style>{`body { cursor: auto; }`}</style>
      )}

      <div
        className="radiowheel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {songs.map((stationdata, i) => (
          <RadioStation
            key={stationdata.name}
            anglelocation={angleStep * i}
            height={height}
            station={stationdata}
          />
        ))}
      </div>

      <div className="songmetadata">
        <h1 className="metadatatext">{stationPlaying?.name}</h1>
        <h2 className="metadatatext">{songname}</h2>
        <h3 className="metadatatext">{artistname}</h3>

        <div className="instructions">
          <h2 className="metadatatext">Hold</h2>
          {qDown ? (
            <img id="qlogo" src="./main/qlogooppositecolor.png" alt="Q key" />
          ) : (
            <img id="qlogo" src="./main/qlogo.png" alt="Q key" />
          )}
          <h2 className="metadatetext">to select radio</h2>
        </div>
      </div>

      <RadioPlayer station={stationPlaying} />
    </>
  );
}
