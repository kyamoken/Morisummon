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
  }, 2500);

  useEffect(() => {
    if (target !== null) {
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

  return (
    <BackGuard>
      <Overlay isOpponent={target === "opponent"}>
        <p className="text">
          {target === "player" ? "あなたのターンです" : "相手のターンです"}
        </p>
      </Overlay>
    </BackGuard>
  );
};

const slideInOut = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  20% {
    transform: translateX(0%);
    opacity: 1;
  }
  80% {
    transform: translateX(0%);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
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

const Overlay = styled.div<{ isOpponent?: boolean }>`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 150px;
  transform: translateY(-50%);
  background: ${({ isOpponent }) =>
    isOpponent
      ? "linear-gradient(-35deg, #FF9999, #FF6666)"
      : "linear-gradient(-35deg, #3d4cb1, #23327c)"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  animation: ${slideInOut} 2.5s ease-in-out;
  animation-fill-mode: forwards;  /* ← 追加 */

  .text {
    font-size: 22px;
    letter-spacing: 2px;
  }
`;


export default PlayerTurnOverlay;
