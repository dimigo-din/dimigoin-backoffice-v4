import {Routes, Route} from "react-router-dom";
import LoginPage from "../pages/login/LoginPage.tsx";

const AppRouter = () => {


  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  );
};

export default AppRouter;
