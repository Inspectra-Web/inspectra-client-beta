import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { router } from "@/router";
import { ThemeProvider, useTheme } from "@/lib/theme";

const queryClient = new QueryClient();

function Toasts() {
  const { resolved } = useTheme();
  return <ToastContainer theme={resolved} position="bottom-right" />;
}

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toasts />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
