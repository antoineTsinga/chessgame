import React, { useEffect, useRef } from "react";

const SoundManager = ({ soundType }) => {
  const moveSound = useRef(null);
  const captureSound = useRef(null);
  const checkSound = useRef(null);
  const castleSound = useRef(null);
  const promotionSound = useRef(null);

  useEffect(() => {
    switch (soundType) {
      case "move":
        moveSound.current.play();
        break;
      case "capture":
        captureSound.current.play();
        break;
      case "check":
        checkSound.current.play();
        break;
      case "castle":
        castleSound.current.play();
        break;
      case "promote":
        promotionSound.current.play();
        break;
      default:
        break;
    }
  }, [soundType]);

  return (
    <div>
      <audio ref={moveSound} src="/sounds/move.mp3" />
      <audio ref={captureSound} src="/sounds/capture.mp3" />
      <audio ref={checkSound} src="/sounds/check.mp3" />
      <audio ref={castleSound} src="/sounds/castle.mp3" />
      <audio ref={promotionSound} src="/sounds/promote.mp3" />
    </div>
  );
};

export default SoundManager;
