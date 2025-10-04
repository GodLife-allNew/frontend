import { QNA_ROUTES } from "./featureRouters/qnaRoutes";
import { ROUTINE_ROUTES } from "./featureRouters/routineRoutes";
import { USER_ROUTES } from "./featureRouters/userRoutes";
import { CHALLENGE_ROUTES } from "./featureRouters/challengeRoutes";
import { FAQ_ROUTES } from "./featureRouters/faqRoutes";
import { NOTICE_ROUTES } from "./featureRouters/noticeRoutes";
import { ADMIN_ROUTES } from "./featureRouters/adminRoutes";

// import Notice, FAQ, Challenge 등 다른 그룹도 추가 가능

export const ALL_ROUTES = [
  ...QNA_ROUTES,
  ...ROUTINE_ROUTES,
  ...USER_ROUTES,
  ...NOTICE_ROUTES,
  ...FAQ_ROUTES,
  ...CHALLENGE_ROUTES,
  ...ADMIN_ROUTES,
];
