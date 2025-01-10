import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const userName = "Kyamoken";
  const gachaStones = 5;

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
      <UserInfo>
        <div>{userName}</div>
        <div>魔法石: {gachaStones}</div>
      </UserInfo>
    </HeaderContainer>
  );
};


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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  & > div {
    margin-left: 20px;
  }

  & > div:not(:last-child) {
    margin-right: 20px; /* 右側の距離を追加 */
  }
`;


export default Header;
