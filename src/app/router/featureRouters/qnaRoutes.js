import QnaAdminDashboard from "@/pages/QnA/QnADashboard";
import QnACreate from "@/pages/QnA/QnACreate";
import QnAList from "@/components/QnA/QnaList";
import QnADetail from "@/components/QnA/QnaDetail";
import QnAEdit from "@/components/QnA/QnAEdit";
import ChatRoom from "@/pages/QnA/QnaSubscriber";

export const QNA_ROUTES = [
  { path: "/qna/edit/:qnaIdx", element: <QnAEdit /> },
  { path: "/qna/detail/:qnaIdx", element: <QnADetail /> },
  { path: "/qna/list", element: <QnAList /> },
  { path: "/qna/create", element: <QnACreate /> },
  { path: "/qna", element: <QnaAdminDashboard /> },
  { path: "/qna2", element: <ChatRoom /> },
];