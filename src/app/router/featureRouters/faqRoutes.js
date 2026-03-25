import { FaqList, FaqCreEdit } from "@/features/faq";

export const FAQ_ROUTES = [
  { path: "/FAQ", element: <FaqList /> },
  { path: "/FAQ/write", element: <FaqCreEdit /> },
  { path: "/FAQ/modify/:faqIdx", element: <FaqCreEdit /> },
];