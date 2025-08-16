import './App.style.ts'
import AppStyle from "./App.style.ts";
import {lightTheme, darkTheme} from "./styles/theme";
import {BrowserRouter} from "react-router-dom";
import PrimaryLayout from "./layouts/PrimaryLayout.tsx";
import AppRouter from "./routes/AppRouter.tsx";
import { ThemeProvider } from 'styled-components';
import {useEffect, useState} from "react";

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <BrowserRouter>
        <AppStyle/>
        <PrimaryLayout>
          <AppRouter/>
        </PrimaryLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
