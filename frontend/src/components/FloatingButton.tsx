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
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
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
