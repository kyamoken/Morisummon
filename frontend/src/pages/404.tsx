import AppLayout from "../components/AppLayout.tsx";
import styled from 'styled-components';
import '../GlobalStyle.css'; // CSSファイルをインポート

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  color: var(--text-color);
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  margin: 0;
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  margin: 0;
`;

const HomeLink = styled.a`
  margin-top: 20px;
  font-size: 1.2rem;
  color: var(--primary-color);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default function Page404() {
  return (
    <AppLayout>
      <div className="global-style" /> {/* GlobalStyleの代わりにdivを追加 */}
      <ErrorContainer>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>ページが見つかりません</ErrorMessage>
        <HomeLink href="/">ホームに戻る</HomeLink>
      </ErrorContainer>
    </AppLayout>
  );
}
