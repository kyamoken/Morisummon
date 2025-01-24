import styled from "styled-components";

export const FloatingButton = styled.button`
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

export const FloatingDangerButton = styled(FloatingButton)`
  background-color: red;
  margin-top: 20px;

  &:hover {
    background-color: darkred;
  }
`;
