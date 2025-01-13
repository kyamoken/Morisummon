import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router";
import AppRouter from "./AppRouter.tsx";
import "@/styles/globals.css";
import { SWRConfig, SWRConfiguration } from "swr";
import { ky } from "./utils/api.ts";
import { Toaster } from "react-hot-toast";

const swrConfig: SWRConfiguration = {
  fetcher: (url) => ky.get(url).json(),
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SWRConfig value={swrConfig}>
          <AppRouter />
          <Toaster/>
        </SWRConfig>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
