import { ReactNode } from "react";
import Header from "./Header";

type Props = {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="app-layout">
      <Header />
      <main>
        {children}
      </main>
    </div>
  )
}
