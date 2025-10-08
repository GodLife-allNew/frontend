import Home from "@/pages/Home/Home";
import { Login, Signup, FindId, FindPassword } from "@/features/auth";
import MyPage from "@/pages/MyPage/MyPage";

export const USER_ROUTES = [
  { path: "/", element: <Home /> },
  { path: "/user/login", element: <Login /> },
  { path: "/user/signup", element: <Signup /> },
  { path: "/user/find_id", element: <FindId /> },
  { path: "/user/find_password", element: <FindPassword /> },
  { path: "/user/MyPage", element: <MyPage /> },
];
