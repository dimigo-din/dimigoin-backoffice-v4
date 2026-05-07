import "./App.style.ts";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import AppStyle from "./App.style.ts";
import PrimaryLayout from "./layouts/PrimaryLayout.tsx";
import AppRouter from "./routes/AppRouter.tsx";
import { lightTheme } from "./styles/theme";

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <BrowserRouter>
        <AppStyle />
        <PrimaryLayout>
          <AppRouter />
        </PrimaryLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
