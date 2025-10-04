import ChallengeListPage from "@/pages/Challenge/List";
import ChallengeWritePage from "@/pages/Challenge/Write";
import ChallengDetailPage from "@/pages/Challenge/Detail";
import ChallengModifyPage from "@/pages/Challenge/Modify";

export const CHALLENGE_ROUTES = [
  { path: "/challenge", element: <ChallengeListPage /> },
  { path: "/challenge/write", element: <ChallengeWritePage /> },
  { path: "/challenge/modify/:challIdx", element: <ChallengModifyPage /> },
  { path: "/challenge/detail/:challIdx", element: <ChallengDetailPage /> },
];