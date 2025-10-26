import NoticeList from "@/features/notice/pages/NoticeList";
import NoticeDetail from "@/features/notice/pages/NoticeDetail";

import { Edit } from "@/features/notice";

export const NOTICE_ROUTES = [
  { path: "/notice/detail/:noticeIdx", element: <NoticeDetail /> },
  { path: "/notice/edit/:noticeIdx", element: <Edit /> },
  { path: "/notice/create", element: <Edit /> },
  { path: "/notice/list", element: <NoticeList /> },

  // 관리자용 라우트 (새로 추가)
  { path: "/admin/notice/detail/:noticeIdx", element: <NoticeDetail isAdminMode={true} /> },
  { path: "/admin/notice/edit/:noticeIdx", element: <Edit isAdminMode={true} /> },
];
