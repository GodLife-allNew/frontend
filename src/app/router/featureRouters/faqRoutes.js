import FAQListPage from "@/pages/FAQ/FAQList";
import FAQWritePage from "@/pages/FAQ/Write";
import FAQEditPage from "@/pages/FAQ/Modify";

export const FAQ_ROUTES = [
  { path: "/FAQ", element: <FAQListPage /> },
  { path: "/FAQ/write", element: <FAQWritePage /> },
  { path: "/FAQ/modify/:faqIdx", element: <FAQEditPage /> },
];