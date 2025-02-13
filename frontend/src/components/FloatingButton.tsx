// FloatingButton.tsx
import React from "react";
import styled from "styled-components";
import useSoundEffect from "@/hooks/useSoundEffect";

const DEFAULT_SOUND_URL = "/static/sounds/Click_button.mp3";

const StyledFloatingButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 30px;
  font-size: 18px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.3s ease, background-color 0.3s ease;

  &:hover {
    background-color: var(--button-hover);
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(-1px) scale(1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  // 光のエフェクト
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transform: skewX(-25deg);
  }

  &:hover::after {
    animation: shine 0.8s;
  }

  @keyframes shine {
    from {
      left: -100%;
    }
    to {
      left: 100%;
    }
  }
`;

const StyledFloatingDangerButton = styled(StyledFloatingButton)`
  background-color: red;
  margin-top: 20px;

  &:hover {
    background-color: darkred;
  }
`;

/**
 * ポリモーフィックな FloatingButtonProps 型
 * T はレンダリングする要素の型（デフォルトは "button"）
 */
export type FloatingButtonProps<T extends React.ElementType = "button"> = {
  soundUrl?: string;
  children: React.ReactNode;
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "onClick" | "children"> & {
  onClick?: React.MouseEventHandler<any>;
};

/**
 * サウンド付きの FloatingButton コンポーネント
 */
export function FloatingButton<T extends React.ElementType = "button">({
  soundUrl = DEFAULT_SOUND_URL,
  onClick,
  children,
  ...rest
}: FloatingButtonProps<T>) {
  const playSoundEffect = useSoundEffect();

  const handleClick = (e: React.MouseEvent<any>) => {
    playSoundEffect(soundUrl);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <StyledFloatingButton onClick={handleClick} {...rest}>
      {children}
    </StyledFloatingButton>
  );
}

/**
 * サウンド付きの FloatingDangerButton コンポーネント
 */
export function FloatingDangerButton<T extends React.ElementType = "button">({
  soundUrl = DEFAULT_SOUND_URL,
  onClick,
  children,
  ...rest
}: FloatingButtonProps<T>) {
  const playSoundEffect = useSoundEffect();

  const handleClick = (e: React.MouseEvent<any>) => {
    playSoundEffect(soundUrl);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <StyledFloatingDangerButton onClick={handleClick} {...rest}>
      {children}
    </StyledFloatingDangerButton>
  );
}
