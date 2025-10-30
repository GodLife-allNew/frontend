import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { Clock, Users, ArrowUpDown, Loader2, Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { MdOutlineMode, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/components/ui/use-toast";
import axiosInstance from "@/shared/api/axiosInstance";
import { Checkbox } from "@/shared/components/ui/checkbox"; // 체크박스 컴포넌트 추가

// Props 추가: onChallengeSelect, onCreateNew
const ChallengeListPage = ({ onChallengeSelect, onCreateNew }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false;

  // 상태 관리
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 라벨 유틸 (용기)
  const visibilityLabels = { PUBLIC: "공개", PRIVATE: "비공개" };
  const typeLabels = { NORMAL: "일반", SPECIAL: "이벤트" };
  const [updatingId, setUpdatingId] = useState(null);

  // 카테고리 관련 상태
  const [categories, setCategories] = useState([{ value: "all", label: "모든 카테고리" }]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 고급 필터 토글 상태
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // 검색 및 필터링 상태
  const [searchTitle, setSearchTitle] = useState("");
  const [searchInput, setSearchInput] = useState(""); // 검색어 임시 상태
  const [searchCategory, setSearchCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  // 새로운 필터 상태 추가
  const [onlyActive, setOnlyActive] = useState(true); // 기본값: 활성화된 챌린지만 표시
  const [onlyEnded, setOnlyEnded] = useState(false); // 기본값: 종료된 챌린지 제외
  const [selectedState, setSelectedState] = useState("all"); // 챌린지 상태 필터 (PUBLISHED, IN_PROGRESS, FINISHED 등)
  const [selectedVisibility, setSelectedVisibility] = useState("all"); // 공개/비공개 필터
  const [selectedType, setSelectedType] = useState("all"); // 챌린지 타입 필터 (NORMAL, SPECIAL)

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // 정렬 옵션
  const sortOptions = [
    { value: "default", label: "기본순" },
    { value: "chall_idx DESC", label: "최신순" },
    { value: "chall_idx ASC", label: "오래된순" },
    { value: "challEndTime ASC", label: "마감일 빠른 순" },
    { value: "challEndTime DESC", label: "마감일 늦은 순" },
  ];

  // 챌린지 상태 옵션
  const stateOptions = [
    { value: "all", label: "모든 상태" },
    { value: "PUBLISHED", label: "게시중" },
    { value: "IN_PROGRESS", label: "진행중" },
    { value: "FINISHED", label: "종료됨" },
    { value: "WAITING", label: "대기중" },
  ];

  // 공개 상태 옵션
  const visibilityOptions = [
    { value: "all", label: "모든 공개 상태" },
    { value: "PUBLIC", label: "공개" },
    { value: "PRIVATE", label: "비공개" },
  ];

  // 챌린지 타입 옵션
  const typeOptions = [
    { value: "all", label: "모든 타입" },
    { value: "NORMAL", label: "일반" },
    { value: "SPECIAL", label: "이벤트" },
  ];

  // 상태 텍스트 매핑 함수
  const getStatusText = (status) => {
    const statusMap = {
      IN_PROGRESS: "진행중",
      PUBLISHED: "게시중",
      COMPLETED: "종료됨",
      FINISHED: "종료됨",
      WAITING: "대기중",
      게시중: "게시중",
      진행중: "진행중",
      종료됨: "종료됨",
      대기중: "대기중",
      완료됨: "완료됨",
    };

    return statusMap[status] || status || "상태 정보 없음";
  };

  // 상태별 스타일 매핑 함수
  const getStatusStyle = (status) => {
    const normalizedStatus = getStatusText(status);

    const styleMap = {
      진행중: {
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      게시중: {
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      종료됨: {
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      완료됨: {
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      대기중: {
        variant: "outline",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    return (
      styleMap[normalizedStatus] || {
        variant: "destructive",
        className: "bg-red-100 text-red-800 border-red-200",
      }
    );
  };

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axiosInstance.get("/categories/challenge");

      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        categoryData = response.data.content;
      }

      const categoryOptions = [
        { value: "all", label: "모든 카테고리" },
        ...categoryData
          .map((category, index) => {
            const value = category.idx || category.id || index;
            const label = category.challName || category.name || category.categoryName || "이름 없음";
            return { value: value.toString(), label };
          })
          .filter((option) => option.label && option.label.trim() !== ""),
      ];
      setCategories(categoryOptions);
    } catch (err) {
      console.error("카테고리 불러오기 오류:", err);
      setCategories([{ value: "all", label: "모든 카테고리" }]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 컴포넌트 마운트 시 카테고리 목록 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  // 챌린지 데이터 fetching - 새로운 API 엔드포인트 사용
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // API 요청 파라미터 구성
      const params = {};

      // 페이징 파라미터
      params.page = currentPage + 1;
      params.size = pageSize;

      // 정렬 파라미터
      if (sortOrder && sortOrder !== "default") {
        params.sort = sortOrder;
      }

      // 검색어 파라미터
      if (searchTitle.trim()) {
        params.challTitle = searchTitle.trim();
      }

      // 카테고리 파라미터
      if (searchCategory && searchCategory !== "all") {
        const categoryIdx = parseInt(searchCategory);
        if (!isNaN(categoryIdx)) {
          params.challCategoryIdx = categoryIdx;
        }
      }

      // 챌린지 상태 필터
      if (selectedState && selectedState !== "all") {
        params.challState = selectedState;
      }

      // 챌린지 타입 필터
      if (selectedType && selectedType !== "all") {
        params.challengeType = selectedType;

        // SPECIAL 타입인 경우에는 종료된 챌린지도 볼 수 있음
        // 일반 유저에게는 공개된 챌린지만 보임 (백엔드에서 처리)
        if (selectedType === "SPECIAL") {
          // SPECIAL 타입은 종료된 챌린지도 볼 수 있음
          params.onlyEnded = false; // onlyEnded 설정을 무시하고 항상 false로 설정
        } else {
          // NORMAL 타입은 종료된 챌린지 조회 불가능
          params.onlyEnded = false; // 항상 false로 설정 (종료된 챌린지 제외)
        }
      } else {
        // 타입 필터가 선택되지 않은 경우, 기본 필터 적용
        params.onlyEnded = onlyEnded;
      }

      // 일반 사용자는 공개 챌린지만 볼 수 있음 (백엔드에서 처리)
      // 단, 관리자는 모든 챌린지 조회 가능
      if (!roleStatus) {
        params.visibilityType = "PUBLIC"; // 일반 사용자는 공개 챌린지만 볼 수 있음
      } else if (selectedVisibility && selectedVisibility !== "all") {
        params.visibilityType = selectedVisibility; // 관리자가 선택한 공개/비공개 필터 적용
      }

      // 활성화 필터 적용
      params.onlyActive = onlyActive;

      // console.log("🔍 최종 검색 파라미터:", params);
      // console.log("📡 API 호출 URL:", `/challenges/latest?${new URLSearchParams(params).toString()}`);

      // 일반 유저용 최신 챌린지 조회
      const response = await axiosInstance.get("/challenges/latest", {
        params,
      });

      if (response.data && typeof response.data === "object") {
        if (response.data.content && Array.isArray(response.data.content)) {
          setChallenges(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else if (Array.isArray(response.data)) {
          setChallenges(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else {
          const possibleArrays = ["data", "challenges", "items", "list"];
          let found = false;

          for (const field of possibleArrays) {
            if (Array.isArray(response.data[field])) {
              setChallenges(response.data[field]);
              setTotalPages(response.data.totalPages || 1);
              setTotalElements(response.data.totalElements || response.data[field].length);
              found = true;
              break;
            }
          }

          if (!found) {
            console.error("API 응답에서 배열 필드를 찾을 수 없습니다:", response.data);
            setChallenges([]);
            setTotalPages(0);
            setTotalElements(0);
          }
        }
      } else {
        console.error("API 응답이 예상 형식과 다릅니다:", response.data);
        setChallenges([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("챌린지 불러오기 오류:", err);
      setError("챌린지를 불러오는 중 오류가 발생했습니다.");
      setChallenges([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    sortOrder,
    searchTitle,
    searchCategory,
    selectedState,
    selectedVisibility,
    selectedType,
    onlyActive,
    onlyEnded,
    roleStatus, // 관리자 여부에 따라 필터링이 달라지므로 의존성 추가
  ]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearchTitle("");
    setCurrentPage(0);
  }, []);

  const handleSearchSubmit = () => {
    setSearchTitle(searchInput);
    setCurrentPage(0);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleFiltersReset = () => {
    setSearchInput("");
    setSearchTitle("");
    setSearchCategory("all");
    setSortOrder("default");
    setSelectedState("all");
    setSelectedVisibility("all");
    setSelectedType("all");
    setOnlyActive(true);
    setOnlyEnded(false);
    setCurrentPage(0);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChallengeClick = (challenge) => {
    if (onChallengeSelect) {
      onChallengeSelect(challenge);
    } else {
      navigate(`/challenge/detail/${challenge.challIdx}`);
    }
  };

  const handleCreateNewClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate("/challenge/write");
    }
  };

  // 챌린지 삭제 함수
  const deleteChallenge = async (challIdx, event) => {
    event.stopPropagation();

    if (!window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setDeleting(true);

      await axiosInstance.patch(
        "/admin/challenges/delete",
        { challIdx: challIdx },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "성공",
        description: "챌린지가 성공적으로 삭제되었습니다.",
      });

      fetchChallenges();
    } catch (err) {
      console.error("챌린지 삭제 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // 조기종료 함수
  const handleEarlyFinish = async (challIdx, event) => {
    event.stopPropagation();

    if (!window.confirm("정말 이 챌린지를 조기 종료하시겠습니까?")) {
      return;
    }

    try {
      await axiosInstance.put(`/admin/challenges/earlyFinish/${challIdx}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast({
        title: "성공",
        description: "챌린지가 조기 종료되었습니다.",
      });

      fetchChallenges();
    } catch (err) {
      console.error("챌린지 조기종료 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 조기종료에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 공개/비공개 변경
  const handleVisibilityChange = async (challIdx, next) => {
    if (!accessToken) {
      toast({ title: "권한 없음", description: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    try {
      setUpdatingId(challIdx);
      await axiosInstance.post(`/admin/challenges/visibility/${challIdx}`, null, {
        params: { visibilityType: next },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "완료", description: `챌린지 공개 상태가 '${visibilityLabels[next]}'로 변경되었습니다.` });
      fetchChallenges();
    } catch (e) {
      console.error(e);
      toast({ title: "오류", description: "공개 상태 변경에 실패했습니다.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // 타입 변경
  const handleTypeChange = async (challIdx, next) => {
    if (!accessToken) {
      toast({ title: "권한 없음", description: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    try {
      setUpdatingId(challIdx);
      await axiosInstance.post(`/admin/challenges/type/${challIdx}`, null, {
        params: { challengeType: next },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "완료", description: `챌린지 타입이 '${typeLabels[next]}'로 변경되었습니다.` });
      fetchChallenges();
    } catch (e) {
      console.error(e);
      toast({ title: "오류", description: "챌린지 타입 변경에 실패했습니다.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditClick = (challIdx, event) => {
    event.stopPropagation();
    navigate(`/challenge/modify/${challIdx}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "종료 날짜 미정";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜";
      }

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return ` ~ ${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 형식 오류";
    }
  };

  const getCategoryName = (categoryValue) => {
    if (!categoryValue && categoryValue !== 0) return "미분류";

    const category = categories.find((cat) => cat.value === categoryValue.toString());
    return category ? category.label : `카테고리 ${categoryValue}`;
  };

  const ModifyButton = ({ challIdx }) => {
    if (roleStatus === true) {
      return (
        <MdOutlineMode
          className="w-5 h-5 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
          onClick={(e) => handleEditClick(challIdx, e)}
          title="수정하기"
        />
      );
    }
    return null;
  };

  const DeleteButton = ({ challIdx }) => {
    if (roleStatus === true) {
      return (
        <MdOutlineDelete
          className="w-5 h-5 text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
          onClick={(e) => deleteChallenge(challIdx, e)}
          title="삭제하기"
        />
      );
    }
    return null;
  };

  // 🔥 조기종료 버튼 컴포넌트
  const EarlyFinishButton = ({ challenge }) => {
    if (roleStatus !== true) return null;

    const status = getStatusText(challenge.challState);
    const canEarlyFinish = status === "진행중" || status === "게시중";

    if (!canEarlyFinish) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        className="text-orange-600 border-orange-300 hover:bg-orange-50"
        onClick={(e) => handleEarlyFinish(challenge.challIdx, e)}
      >
        조기종료
      </Button>
    );
  };

  // 관리자가 아닌 경우, SPECIAL 타입이 아니면 종료된 챌린지 필터를 비활성화
  const isEndedFilterDisabled = !roleStatus && selectedType !== "SPECIAL";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        {error}
        <Button onClick={fetchChallenges} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        {roleStatus === true && (
          <Button className="bg-black text-white" onClick={handleCreateNewClick}>
            + 새 챌린지
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow mb-6">
        <div className="p-6 space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="챌린지 제목을 검색하세요..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button onClick={handleSearchSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              검색
            </Button>
          </div>

          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Filter size={16} />
            <span>{showAdvancedFilter ? "필터 숨기기" : "고급 필터"}</span>
            {showAdvancedFilter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvancedFilter && (
            <div className="p-4 rounded-lg space-y-4 border border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <Select
                    value={searchCategory}
                    onValueChange={(value) => {
                      setSearchCategory(value);
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          카테고리 불러오는 중...
                        </SelectItem>
                      ) : (
                        categories
                          .filter((option) => option.value && option.value.trim() !== "")
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {categoriesLoading && <p className="text-xs text-gray-500 mt-1">카테고리 로딩 중...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                  <Select value={sortOrder} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 새로운 필터 옵션들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">챌린지 상태</label>
                  <Select
                    value={selectedState}
                    onValueChange={(value) => {
                      setSelectedState(value);
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {stateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {roleStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공개 상태</label>
                    <Select
                      value={selectedVisibility}
                      onValueChange={(value) => {
                        setSelectedVisibility(value);
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="공개 상태 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">챌린지 타입</label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setSelectedType(value);
                      // 타입이 NORMAL이면 종료된 챌린지 필터 비활성화
                      if (value === "NORMAL" && onlyEnded) {
                        setOnlyEnded(false);
                      }
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="타입 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={handleFiltersReset}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}

          {/* 현재 적용된 필터 표시 */}
          {(searchTitle ||
            searchCategory !== "all" ||
            sortOrder !== "default" ||
            selectedState !== "all" ||
            (roleStatus && selectedVisibility !== "all") ||
            selectedType !== "all" ||
            !onlyActive ||
            onlyEnded) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">적용된 필터:</span>

              {searchTitle && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>검색: {searchTitle}</span>
                  <button
                    onClick={() => {
                      setSearchTitle("");
                      setSearchInput("");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {searchCategory !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>카테고리: {categories.find((c) => c.value === searchCategory)?.label || searchCategory}</span>
                  <button
                    onClick={() => {
                      setSearchCategory("all");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {sortOrder !== "default" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>정렬: {sortOptions.find((s) => s.value === sortOrder)?.label || sortOrder}</span>
                  <button
                    onClick={() => {
                      setSortOrder("default");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {selectedState !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>상태: {stateOptions.find((s) => s.value === selectedState)?.label}</span>
                  <button
                    onClick={() => {
                      setSelectedState("all");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {roleStatus && selectedVisibility !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>공개 상태: {visibilityOptions.find((v) => v.value === selectedVisibility)?.label}</span>
                  <button
                    onClick={() => {
                      setSelectedVisibility("all");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {selectedType !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>타입: {typeOptions.find((t) => t.value === selectedType)?.label}</span>
                  <button
                    onClick={() => {
                      setSelectedType("all");
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {!onlyActive && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>모든 챌린지 표시 (종료 포함)</span>
                  <button
                    onClick={() => {
                      setOnlyActive(true);
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {onlyEnded && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span>종료된 챌린지만 표시</span>
                  <button
                    onClick={() => {
                      setOnlyEnded(false);
                      setCurrentPage(0);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <button onClick={handleFiltersReset} className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline">
                모든 필터 제거
              </button>
            </div>
          )}
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {searchTitle ||
          searchCategory !== "all" ||
          selectedState !== "all" ||
          (roleStatus && selectedVisibility !== "all") ||
          selectedType !== "all" ||
          onlyEnded
            ? "검색 조건에 맞는 챌린지가 없습니다."
            : "현재 진행 중인 챌린지가 없습니다."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {challenges.map((challenge, index) => {
              if (index === 0) {
                console.log("challCategoryIdx:", challenge.challCategoryIdx);
                console.log("challState:", challenge.challState);
                console.log("전체 객체:", challenge);
              }

              const statusStyle = getStatusStyle(challenge.challState);

              return (
                <Card
                  key={challenge.challIdx || index}
                  className="hover:shadow-lg transition-shadow bg-white shadow-sm cursor-pointer"
                  onClick={() => handleChallengeClick(challenge)}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const categoryValue =
                            challenge.challCategoryIdx !== undefined
                              ? challenge.challCategoryIdx
                              : challenge.challCategory || challenge.categoryName || challenge.category || challenge.challName || null;

                          return categoryValue !== null && categoryValue !== undefined ? (
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(categoryValue)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">
                              카테고리 없음
                            </Badge>
                          );
                        })()}

                        <span>{challenge.challTitle || "제목 없음"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {challenge.challState && (
                          <Badge variant={statusStyle.variant} className={`text-xs ${statusStyle.className}`}>
                            {getStatusText(challenge.challState)}
                          </Badge>
                        )}

                        <div className="flex items-center gap-1">
                          <ModifyButton challIdx={challenge.challIdx} />
                          <DeleteButton challIdx={challenge.challIdx} />
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription className="p-2">{challenge.challDescription || "설명 없음"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 pb-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>
                        참가자: {challenge.currentParticipants || 0} / {challenge.maxParticipants || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{formatDate(challenge.challEndTime)}</span>
                    </div>
                  </CardContent>

                  {roleStatus === true && (
                    <CardFooter className="pt-0">
                      <div className="w-full flex flex-wrap items-center gap-2">
                        {/* 왼쪽: 조기종료 */}
                        <div className="flex items-center">
                          {/* EarlyFinishButton은 size="sm"라서 h-9 높이 -> 셀렉트도 h-9로 맞춰줍니다 */}
                          <EarlyFinishButton challenge={challenge} />
                        </div>

                        {/* 오른쪽: 공개/비공개 + 타입 (오른쪽 정렬) */}
                        <div className="ml-auto flex items-center gap-3">
                          {/* 공개/비공개 */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">공개 상태</span>
                            <Select
                              value={(challenge.visibilityType || "PUBLIC").toUpperCase()}
                              onValueChange={(v) => handleVisibilityChange(challenge.challIdx, v)}
                              disabled={updatingId === challenge.challIdx}
                            >
                              {/* h-9로 버튼(sm)과 동일 높이, 내부 패딩을 조정해 라인 높이 맞춤 */}
                              <SelectTrigger className="h-9 w-[140px] px-3 py-0">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="PUBLIC">공개</SelectItem>
                                <SelectItem value="PRIVATE">비공개</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* 챌린지 타입 */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">챌린지 타입</span>
                            <Select
                              value={(challenge.challengeType || "NORMAL").toUpperCase()}
                              onValueChange={(v) => handleTypeChange(challenge.challIdx, v)}
                              disabled={updatingId === challenge.challIdx}
                            >
                              {/* 동일하게 h-9로 통일 */}
                              <SelectTrigger className="h-9 w-[140px] px-3 py-0">
                                <SelectValue placeholder="선택" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="NORMAL">일반</SelectItem>
                                <SelectItem value="SPECIAL">이벤트</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={currentPage === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink onClick={() => handlePageChange(index)} isActive={currentPage === index} className="cursor-pointer">
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={currentPage === totalPages - 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default ChallengeListPage;
