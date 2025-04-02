import React from 'react';
import styled from 'styled-components';

type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>プライバシーポリシー</Title>
        <Text>
          <h3>第1条（収集する情報）</h3>
          <p>本サービスは、ユーザー登録時に入力されるユーザー名、パスワード、アクセスログ（IPアドレス）を収集します。</p>
          <h3>第2条（情報の利用目的）</h3>
          <p>収集した情報は、ユーザー認証、サービス提供、問い合わせ対応、サービス改善の目的で利用します。</p>
          <h3>第3条（情報の第三者提供）</h3>
          <p>法令に基づく場合を除き、収集した個人情報をユーザーの同意なく第三者に提供することはありません。</p>
          <h3>第4条（情報の管理）</h3>
          <p>収集した情報は適切に管理し、不正アクセスや漏洩防止に努めます。</p>
          <h3>第5条（プライバシーポリシーの変更）</h3>
          <p>本ポリシーは必要に応じて変更する場合があり、変更後はサイト上で告知します。</p>
        </Text>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PrivacyPolicyModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
  z-index: 1002;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: var(--card-background);
  padding: 20px;
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--box-shadow);
  transform: scale(0.8);
  animation: scaleIn 0.3s ease-in-out forwards;
  color: var(--privacy-service-text-color);
  position: relative;
  max-height: 80vh; /* モーダルの最大高さを設定 */
  overflow-y: auto; /* 縦方向のスクロールを有効にする */

  @media (max-width: 768px) {
    max-width: 90%;
    padding: 15px;
  }
  @media (max-width: 480px) {
    max-width: 95%;
    padding: 10px;
  }

  @keyframes scaleIn {
    to {
      transform: scale(1);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.3s;

  &:hover {
    color: var(--button-hover);
  }

  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
    font-size: 20px;
  }
`;

const Title = styled.h2`
  margin-top: 0;
  text-align: center;
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const Text = styled.div`
  font-size: 1rem;
  text-align: left;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }

  h3 {
    margin-top: 1rem;
    font-size: 1.2rem;
  }

  p {
    margin: 0.5rem 0;
  }
`;
