import React, { useState, useEffect } from "react";
import { User, FileText, MessageSquare, CheckCircle, Menu, ChevronDown, ChevronRight, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CompSystem from "@/components/ServiceAdmin/compSystem/compSystem";
import { FaqListContent } from "@/features/faq";
import ChallengeManager from "@/components/ServiceAdmin/contentsPage/ChallengeM";
import RoutineManager from "@/components/ServiceAdmin/contentsPage/RoutineM";
import UserManager from "./AdminUser";
import QnaAdminDashboard from "../QnA/QnADashboard";
import NoticeListPage from "@/features/notice/pages/NoticeList";
import useAdminPermission from "@/shared/hooks/useAdminPermission";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, firstAllowedPage } = useAdminPermission();

  // localStorage에서 마지막 페이지 가져오기, 없으면 "추천 루틴관리" 기본값
  const getInitialPage = () => {
    const savedPage = localStorage.getItem("adminActivePage");
    return savedPage || "추천 루틴관리";
  };

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(getInitialPage());
  const [contentMenuExpanded, setContentMenuExpanded] = useState(true); // 기본값 true로 변경
  const [userMenuExpanded, setUserMenuExpanded] = useState(false);
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);

  // activePage가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("adminActivePage", activePage);
  }, [activePage]);

  // 초기 페이지 검증: 저장된 페이지가 권한 밖이면 첫 번째 허용 페이지로 폴백
  useEffect(() => {
    if (!hasPermission(activePage)) {
      if (firstAllowedPage) {
        setActivePage(firstAllowedPage);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMenu = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  const toggleContentMenu = () => {
    setContentMenuExpanded(!contentMenuExpanded);
  };

  const toggleUserMenu = () => {
    setUserMenuExpanded(!userMenuExpanded);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // 페이지 변경 시 권한 체크 래퍼
  const handlePageChange = (pageName) => {
    if (hasPermission(pageName)) {
      setActivePage(pageName);
    } else {
      setShowPermissionDenied(true);
    }
  };

  // URL 파라미터에 따라 활성 페이지 설정
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "faq") {
      handlePageChange("FAQ 관리");
    } else if (tab === "공지사항 관리") {
      if (hasPermission("공지사항 관리")) {
        setActivePage("공지사항 관리");
        setContentMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "challenge") {
      if (hasPermission("챌린지 관리")) {
        setActivePage("챌린지 관리");
        setContentMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "routine") {
      if (hasPermission("추천 루틴관리")) {
        setActivePage("추천 루틴관리");
        setContentMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "user") {
      if (hasPermission("유저 관리")) {
        setActivePage("유저 관리");
        setUserMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "report") {
      if (hasPermission("신고처리")) {
        setActivePage("신고처리");
        setUserMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "permission") {
      if (hasPermission("권한관리")) {
        setActivePage("권한관리");
        setUserMenuExpanded(true);
      } else {
        setShowPermissionDenied(true);
      }
    } else if (tab === "inquiry") {
      handlePageChange("1:1 문의");
    } else if (tab === "component") {
      handlePageChange("컴포넌트 관리");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // 풀페이지 컴포넌트인지 확인
  const isFullPageComponent =
    activePage === "챌린지 관리" || activePage === "유저 관리" || activePage === "신고처리" || activePage === "권한관리";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 왼쪽 사이드바 */}
      <div className={`bg-blue-600 text-white ${menuCollapsed ? "w-16" : "w-64"} transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-500">
          {!menuCollapsed && <span className="text-lg font-semibold">관리자 페이지</span>}
          <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-blue-700">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1">
          <ul>
            {/* 컨텐츠 관리 (하위메뉴 있음) */}
            <li>
              <button onClick={toggleContentMenu} className="w-full flex items-center p-4 space-x-3 text-left hover:bg-blue-700">
                <CheckCircle size={20} />
                {!menuCollapsed && (
                  <>
                    <span>컨텐츠 관리</span>
                    <div className="ml-auto">{contentMenuExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                  </>
                )}
              </button>

              {/* 컨텐츠 관리 하위 메뉴 */}
              {contentMenuExpanded && !menuCollapsed && (
                <ul>
                  <li className={`hover:bg-blue-700 ${activePage === "추천 루틴관리" ? "bg-blue-700" : ""}`}>
                    <button onClick={() => handlePageChange("추천 루틴관리")} className="w-full flex items-center p-3 pl-12 text-left text-sm">
                      <span>추천 루틴관리</span>
                    </button>
                  </li>
                  <li className={`hover:bg-blue-700 ${activePage === "챌린지 관리" ? "bg-blue-700" : ""}`}>
                    <button onClick={() => handlePageChange("챌린지 관리")} className="w-full flex items-center p-3 pl-12 text-left text-sm">
                      <span>챌린지 관리</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 컴포넌트 관리 */}
            <li className={`hover:bg-blue-700 ${activePage === "컴포넌트 관리" ? "bg-blue-700" : ""}`}>
              <button onClick={() => handlePageChange("컴포넌트 관리")} className="w-full flex items-center p-4 space-x-3 text-left">
                <FileText size={20} />
                {!menuCollapsed && <span>컴포넌트 관리</span>}
              </button>
            </li>

            {/* 유저 관리 (하위메뉴 있음) */}
            <li>
              <button onClick={toggleUserMenu} className="w-full flex items-center p-4 space-x-3 text-left hover:bg-blue-700">
                <User size={20} />
                {!menuCollapsed && (
                  <>
                    <span>유저 관리</span>
                    <div className="ml-auto">{userMenuExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                  </>
                )}
              </button>

              {/* 유저 관리 하위 메뉴 */}
              {userMenuExpanded && !menuCollapsed && (
                <ul>
                  <li className={`hover:bg-blue-700 ${activePage === "유저 관리" ? "bg-blue-700" : ""}`}>
                    <button onClick={() => handlePageChange("유저 관리")} className="w-full flex items-center p-3 pl-12 text-left text-sm">
                      <span>유저 관리</span>
                    </button>
                  </li>
                  <li className={`hover:bg-blue-700 ${activePage === "신고처리" ? "bg-blue-700" : ""}`}>
                    <button onClick={() => handlePageChange("신고처리")} className="w-full flex items-center p-3 pl-12 text-left text-sm">
                      <span>신고처리</span>
                    </button>
                  </li>
                  <li className={`hover:bg-blue-700 ${activePage === "권한관리" ? "bg-blue-700" : ""}`}>
                    <button onClick={() => handlePageChange("권한관리")} className="w-full flex items-center p-3 pl-12 text-left text-sm">
                      <span>권한관리</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* FAQ 관리 */}
            <li className={`hover:bg-blue-700 ${activePage === "FAQ 관리" ? "bg-blue-700" : ""}`}>
              <button onClick={() => handlePageChange("FAQ 관리")} className="w-full flex items-center p-4 space-x-3 text-left">
                <FileText size={20} />
                {!menuCollapsed && <span>FAQ 관리</span>}
              </button>
            </li>

            {/* 공지사항 관리 */}
            <li className={`hover:bg-blue-700 ${activePage === "공지사항 관리" ? "bg-blue-700" : ""}`}>
              <button onClick={() => handlePageChange("공지사항 관리")} className="w-full flex items-center p-4 space-x-3 text-left">
                <FileText size={20} />
                {!menuCollapsed && <span>공지사항 관리</span>}
              </button>
            </li>

            {/* 1:1 문의 */}
            <li className={`hover:bg-blue-700 ${activePage === "1:1 문의" ? "bg-blue-700" : ""}`}>
              <button onClick={() => handlePageChange("1:1 문의")} className="w-full flex items-center p-4 space-x-3 text-left">
                <MessageSquare size={20} />
                {!menuCollapsed && <span>1:1 문의</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* 하단 나가기 버튼 */}
        <div className=" border-blue-500">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center p-3 space-x-3 text-left hover:bg-blue-700 rounded-md transition-colors"
          >
            <Home size={20} />
            {!menuCollapsed && <span>나가기</span>}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* 풀페이지 컴포넌트가 아닐 때만 헤더 표시 */}
        {!isFullPageComponent && (
          <header className="bg-white p-5 shadow flex justify-between items-center">
            <h1 className="text-xl font-semibold">{activePage}</h1>
          </header>
        )}

        {/* 메인 컨텐츠 - 풀페이지 컴포넌트일 때는 패딩 제거 */}
        <main className={`flex-1  ${isFullPageComponent ? "" : "p-6"}`}>
          {/* 컴포넌트 관리 페이지 */}
          {activePage === "컴포넌트 관리" && <CompSystem />}

          {activePage === "추천 루틴관리" && <RoutineManager />}

          {activePage === "챌린지 관리" && <ChallengeManager />}

          {/* 유저 관리 관련 페이지들 */}
          {(activePage === "유저 관리" || activePage === "신고처리" || activePage === "권한관리") && (
            <UserManager initialTab={activePage} />
          )}

          {activePage === "FAQ 관리" && <FaqListContent isAdminMode={true} />}
          {activePage === "공지사항 관리" && <NoticeListPage isAdminMode={true} />}
          {activePage === "1:1 문의" && <QnaAdminDashboard />}
        </main>
      </div>

      {/* 권한 부족 AlertDialog */}
      <AlertDialog open={showPermissionDenied} onOpenChange={setShowPermissionDenied}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>접근 제한</AlertDialogTitle>
            <AlertDialogDescription>권한이 부족합니다. 해당 페이지에 접근할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPermissionDenied(false)}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
