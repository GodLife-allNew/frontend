import NoticeListPage from "@/pages/Notice/NoticeList";
import NoticeDetail from "@/pages/Notice/NoticeDetail";

import { Edit } from "@/features/notice";

export const NOTICE_ROUTES = [
  { path: "/notice/detail/:noticeIdx", element: <NoticeDetail /> },
  { path: "/notice/edit/:noticeIdx", element: <Edit /> },
  { path: "/notice/create", element: <Edit /> },
  { path: "/notice/list", element: <NoticeListPage /> },

  // 관리자용 라우트 (새로 추가)
  { path: "/admin/notice/detail/:noticeIdx", element: <NoticeDetail isAdminMode={true} /> },
  { path: "/admin/notice/edit/:noticeIdx", element: <Edit isAdminMode={true} /> },
];
