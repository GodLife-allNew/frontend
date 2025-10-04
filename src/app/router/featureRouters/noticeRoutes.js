import NoticeListPage from "@/pages/Notice/NoticeList";
import NoticeDetail from "@/pages/Notice/NoticeDetail";
import NoticeCreateEdit from "@/pages/Notice/NoticeCreateEdit";

export const NOTICE_ROUTES = [
  { path: "/notice/detail/:noticeIdx", element: <NoticeDetail /> },
  { path: "/notice/edit/:noticeIdx", element: <NoticeCreateEdit /> },
  { path: "/notice/create", element: <NoticeCreateEdit /> },
  { path: "/notice/list", element: <NoticeListPage /> },
];