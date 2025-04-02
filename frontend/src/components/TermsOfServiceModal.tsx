import React from 'react';
import styled from 'styled-components';

type TermsOfServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>利用規約</Title>
        <Text>
          <h3>第1条（適用）</h3>
          <p>本規約は、本サービスの利用条件を定めるものです。ユーザーは本規約に同意した上で本サービスを利用してください。</p>
          <h3>第2条（アカウント管理）</h3>
          <p>ユーザーは自身のユーザー名及びパスワードを自己の責任で適切に管理し、第三者への開示・漏洩を防ぐ義務を負います。管理不十分による損害について、当サイトは一切責任を負いません。</p>
          <h3>第3条（チャット機能の利用）</h3>
          <p>ユーザーはチャット機能を通じて公序良俗に反する内容や他者への誹謗中傷、権利侵害を行ってはいけません。当サイトはユーザー同士のやり取りによるトラブルについて一切責任を負いません。</p>
          <h3>第4条（カードゲーム対戦）</h3>
          <p>対戦機能での不正行為、迷惑行為は禁止します。違反があった場合、当サイトは該当ユーザーへの利用制限などを行う場合があります。</p>
          <h3>第5条（禁止事項）</h3>
          <p>法令または公序良俗に違反する行為</p>
          <p>他のユーザーや第三者への迷惑行為</p>
          <p>その他、当サイトが不適切と判断する行為</p>
          <h3>第6条（サービスの変更・停止）</h3>
          <p>当サイトは事前通知なくサービス内容を変更または停止することがあります。</p>
        </Text>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TermsOfServiceModal;

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
