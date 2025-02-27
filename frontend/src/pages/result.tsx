// pages/result.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import styled from 'styled-components';
import useAuth from '@/hooks/useAuth';
import Header from '@/components/Header';
import BubblesBackground from '@/components/BubblesBackground';
import { FloatingButton } from '@/components/FloatingButton';

type BattleResult = {
  room_id: string;
  winner: string;
};

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [resultMessage, setResultMessage] = useState<string>('結果を読み込み中です...');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  // ナビゲーションの state から結果データを取得
  useEffect(() => {
    const stateData = location.state as { battleResult?: BattleResult } | undefined;
    if (stateData && stateData.battleResult) {
      setBattleResult(stateData.battleResult);
    } else {
      // state に結果がなければ、信頼できる API から取得するなどの処理を入れる
      // 今回はエラーメッセージを表示
      setResultMessage('結果情報が取得できませんでした。再度バトルを行ってください。');
    }
  }, [location.state]);

  useEffect(() => {
    if (!battleResult || !user) return;

    // 両方とも文字列に変換して比較
    if (String(battleResult.winner) === String(user.id)) {
      setResultMessage('おめでとうございます！あなたの勝利です！');
    } else {
      setResultMessage('残念！あなたの敗北です。');
    }
  }, [battleResult, user]);

  return (
    <PageContainer>
      <BubblesBackground />
      <Header />
      <Content>
        <h1>バトル結果</h1>
        <Message>{resultMessage}</Message>
        <FloatingButton onClick={() => navigate('/home')}>
          ホームへ戻る
        </FloatingButton>
      </Content>
    </PageContainer>
  );
};

export default ResultPage;

const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--background-color);
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  padding-top: 90px;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 90px 20px 20px;
`;

const Message = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
`;
