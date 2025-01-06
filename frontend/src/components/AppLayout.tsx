import { ReactNode } from "react";

type Props = {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="app-layout">
      <header>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
