// import NoticeListPage from "@/pages/Notice/NoticeList";
// import NoticeDetail from "@/pages/Notice/NoticeDetail";

import { Edit, Detail, List } from "@/features/notice";

export const NOTICE_ROUTES = [
  { path: "/notice/detail/:noticeIdx", element: <Detail /> },
  { path: "/notice/edit/:noticeIdx", element: <Edit /> },
  { path: "/notice/create", element: <Edit /> },
  { path: "/notice/list", element: <List /> },
];