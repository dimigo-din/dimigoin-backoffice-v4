import {Routes, Route} from "react-router-dom";
import LoginPage from "../pages/login/LoginPage.tsx";
import EmptyPage from "../pages/EmptyPage.tsx";
import ApplyStayPage from "../pages/applystay/ApplyStayPage.tsx";
import WakeupPage from "../pages/wakeup/WakeupPage.tsx";
import FrigoPage from "../pages/frigo/FrigoPage.tsx";

const AppRouter = () => {


  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/applystay" element={<ApplyStayPage/>}/>
      <Route path="/wakeup" element={<WakeupPage/>}/>
      <Route path="/applyfrigo" element={<FrigoPage/>}/>
      <Route path="*" element={<EmptyPage/>}/>
    </Routes>
  );
};

export default AppRouter;
