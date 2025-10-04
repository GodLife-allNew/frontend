import MyRoutineList from "@/pages/Routine/MyRoutineList";
import RoutineDetailPage from "@/pages/Routine/Detail";
import RoutineCreatePage from "@/pages/Routine/Create";
import RoutineListPage from "@/pages/Routine/List";

export const ROUTINE_ROUTES = [
  { path: "/routine/list", element: <RoutineListPage /> },
  { path: "/routine/mylist", element: <MyRoutineList /> },
  { path: "/routine/detail/:planIdx", element: <RoutineDetailPage /> },
  { path: "/routine/create", element: <RoutineCreatePage />, protected: true },
];
