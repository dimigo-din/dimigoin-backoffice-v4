import './App.style.ts'
import AppStyle from "./App.style.ts";
import {lightTheme} from "./styles/theme";
import {BrowserRouter} from "react-router-dom";
import PrimaryLayout from "./layouts/PrimaryLayout.tsx";
import AppRouter from "./routes/AppRouter.tsx";
import { ThemeProvider } from 'styled-components';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
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
