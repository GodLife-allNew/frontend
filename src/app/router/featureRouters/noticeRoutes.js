import { List, Detail, Edit } from "@/features/notice";

export const NOTICE_ROUTES = [
  { path: "/notice/detail/:noticeIdx", element: <Detail /> },
  { path: "/notice/list", element: <List /> },

  // 관리자용 라우트 (새로 추가)
  { path: "/admin/notice/detail/:noticeIdx", element: <Detail isAdminMode={true} /> },
  { path: "/notice/edit/:noticeIdx", element: <Edit isAdminMode={true} /> },
  { path: "/notice/create", element: <Edit isAdminMode={true} /> },
];
