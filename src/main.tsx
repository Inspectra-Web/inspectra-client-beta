import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider, useTheme } from "@/lib/theme";

const queryClient = new QueryClient();

function Toasts() {
  const { resolved } = useTheme();
  return <ToastContainer theme={resolved} position="bottom-right" />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toasts />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
