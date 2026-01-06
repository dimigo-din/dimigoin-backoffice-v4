import {Routes, Route} from "react-router-dom";
import { lazy, Suspense } from "react";
import Loading from "../components/Loading.tsx";

const LoginPage = lazy(() => import("../pages/login/LoginPage.tsx"));
const EmptyPage = lazy(() => import("../pages/EmptyPage.tsx"));
const ApplyStayPage = lazy(() => import("../pages/applystay/ApplyStayPage.tsx"));
const ViewStaySeatPage = lazy(() => import("../pages/viewstayseat/ViewStaySeatPage.tsx"));
const WakeupPage = lazy(() => import("../pages/wakeup/WakeupPage.tsx"));
const FrigoPage = lazy(() => import("../pages/frigo/FrigoPage.tsx"));
const OpenWakeup = lazy(() => import("../pages/wakeup/OpenWakeup.tsx"));
const LaundryTimelinePage = lazy(() => import("../pages/laundry/LaundryTimelinePage.tsx"));
const LaundryApplyPage = lazy(() => import("../pages/laundry/LaundryApplyPage.tsx"));

const AppRouter = () => {


  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/applystay" element={<ApplyStayPage/>}/>
        <Route path="/viewstayseat" element={<ViewStaySeatPage/>}/>
        <Route path="/wakeup" element={<WakeupPage/>}/>
        <Route path="/applyfrigo" element={<FrigoPage/>}/>
        <Route path="/openwakeup" element={<OpenWakeup/>}/>
        <Route path="/laundrytimeline" element={<LaundryTimelinePage/>}/>
        <Route path="/applylaundry" element={<LaundryApplyPage/>}/>
        <Route path="*" element={<EmptyPage/>}/>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
