import useTimeout from "@/hooks/useTimeout";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

type Props = {
  target: "player" | "opponent" | null;
}

const PlayerTurnOverlay = ({ target }: Props) => {
  const [isShown, setIsShown] = useState(false);
  const { start, stop } = useTimeout(() => {
    setIsShown(false);
  }, 5000);

  useEffect(() => {
    if (target === "player") {
      setIsShown(true);
      start();
    } else {
      setIsShown(false);
      stop();
    }
  }, [target, start, stop]);

  if (!isShown || !target) {
    return null;
  }

  if (target === "player") {
    return (
      <BackGuard>
        <Overlay>
          <p className="text">あなたのターンです</p>
        </Overlay>
      </BackGuard>
    );
  } else {
    return (
      <BackGuard>
        <Overlay>
          <p className="text">相手のターンです</p>
        </Overlay>
      </BackGuard>
    );
  }
};

const overlayKeyframes = keyframes`
  0% {
    transform: translateY(-50%) scale(1.3) rotate(-6deg);
    clip-path: polygon(0 100%, 100% 0, 100% 0, 0 100%);
  }
  25% {
    transform: translateY(-50%) scale(1);
    clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%);
  }
  75% {
    transform: translateY(-50%) scale(1);
    clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%);
  }
  100% {
    transform: translateY(-50%) scale(1) rotate(6deg);
    clip-path: polygon(0 100%, 100% 0, 100% 0, 0 100%);
  }
`;

const textKeyframes = keyframes`
  0% {
    transform: scale(0.8);
    letter-spacing: 12px;
  }
  100% {
    transform: scale(1);
    letter-spacing: 2px;
  }
`;

const BackGuard = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.1);
`;

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 150px;
  transform: translateY(-50%);
  background: linear-gradient(-35deg, #3d4cb1, #23327c);
  display: flex;
  clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%);
  justify-content: center;
  align-items: center;
  color: white;

  animation: ${overlayKeyframes} 0.5s ease-out;

  .text {
    font-size: 22px;
    letter-spacing: 2px;
    animation: ${textKeyframes} 0.5s ease-out;
  }
`;

export default PlayerTurnOverlay;
