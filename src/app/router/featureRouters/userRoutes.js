import Home from "@/pages/Home/Home";
import { Login, Signup } from "@/features/auth";
import FindPassword from "@/pages/Auth/FindPassword";
import FindId from "@/pages/Auth/FindId";
import MyPage from "@/pages/MyPage/MyPage";

export const USER_ROUTES = [
  { path: "/", element: <Home /> },
  { path: "/user/login", element: <Login /> },
  { path: "/user/signup", element: <Signup /> },
  { path: "/user/find_id", element: <FindId /> },
  { path: "/user/find_password", element: <FindPassword /> },
  { path: "/user/MyPage", element: <MyPage /> },
];
