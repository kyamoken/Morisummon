// Header.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: rgba(45, 45, 103, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: var(--box-shadow);
`;

const LanguageButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 28px;
  }
`;

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <HeaderContainer>
      <img
        src="/static/images/morisummonLOGO.png"
        alt="Logo"
        width="100"
        height="100"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      <LanguageButton>
        <img src="/static/images/globe.svg" alt="Language" />
      </LanguageButton>
    </HeaderContainer>
  );
};

export default Header;
