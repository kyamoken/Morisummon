import AppLayout from "@/components/AppLayout.tsx";
import { Link } from "react-router";
import styled from 'styled-components';

export default function Page404() {
  return (
    <AppLayout>
      <ErrorContainer>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>ページが見つかりません</ErrorMessage>
        <HomeLink to="/">ホームに戻る</HomeLink>
      </ErrorContainer>
    </AppLayout>
  );
}


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

const HomeLink = styled(Link)`
  margin-top: 20px;
  font-size: 1.2rem;
  color: var(--primary-color);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
