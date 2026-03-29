import { BrowserRouter as Router } from "react-router-dom";
import RoutesConfig from "./routing/RoutesConfig";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthProvider } from "./authentication/components/AuthenticationService";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <RoutesConfig />
          <Toaster richColors position="top-right" />
          <div className="fixed bottom-4 right-4 z-50 bg-background p-2 rounded-full shadow-lg">
              <ModeToggle />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
