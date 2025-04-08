// src/components/LoginBonus.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';

interface BonusResponse {
  awarded: boolean;
  bonus?: number;
  streak?: number;
}

// 画面全体を覆うオーバーレイを定義（背景を半透明にして背景クリックを吸収）
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);  /* 背景部分への操作をブロック */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

// ボーナスモーダル本体（背景色は var(--primary-color) に変更）
const BonusModal = styled.div`
  background-color: var(--primary-color);
  padding: 20px;
  border-radius: 8px;
  color: white;
  text-align: center;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;

  /* スマホなど小さい画面用のレスポンシブ対応 */
  @media (max-width: 480px) {
    padding: 16px;
    font-size: 14px;
  }
`;

const CloseButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const LoginBonus: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [bonusInfo, setBonusInfo] = useState({ bonus: 0, streak: 0 });

  useEffect(() => {
    async function fetchLoginBonus() {
      try {
        const response: BonusResponse = await ky
          .get('/api/login_bonus/')
          .json();
        if (response.awarded) {
          setBonusInfo({
            bonus: response.bonus || 0,
            streak: response.streak || 0,
          });
          setShowModal(true);
        }
      } catch (error) {
        console.error('ログインボーナス取得エラー:', error);
      }
    }
    fetchLoginBonus();
  }, []);

  if (!showModal) return null;

  return (
    <ModalOverlay>
      <BonusModal>
        <p>
          ログイン {bonusInfo.streak} 日目、魔法石を {bonusInfo.bonus} 個手に入れました！
        </p>
        <CloseButton onClick={() => setShowModal(false)}>閉じる</CloseButton>
      </BonusModal>
    </ModalOverlay>
  );
};

export default LoginBonus;
