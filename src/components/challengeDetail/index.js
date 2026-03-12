import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosInstance from "@/shared/api/axiosInstance";
import { Card, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { GoPeople, GoClock, GoTrophy, GoPulse } from "react-icons/go";
import { MdOutlineDateRange, MdVerified, MdCheck } from "react-icons/md";
import { BsCalendarCheck } from "react-icons/bs";
import { useToast } from "@/shared/components/ui/use-toast";

// 분을 시간과 분으로 변환하는 함수
const formatMinutesToHoursAndMinutes = (totalMinutes) => {
  if (!totalMinutes || totalMinutes === 0) return "0분";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  } else if (minutes === 0) {
    return `${hours}시간`;
  } else {
    return `${hours}시간 ${minutes}분`;
  }
};

// 🔥 Props 추가: onEdit, onBack, challIdx, isIntegrated
const ChallengeDetailForm = ({
  onEdit,
  onBack,
  challIdx: propChallIdx,
  isIntegrated = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { challIdx: paramChallIdx } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // 🔥 challIdx는 props에서 우선 가져오고, 없으면 useParams에서 가져옴
  const challIdx = propChallIdx || paramChallIdx;

  const userJoin = queryParams.get("userJoin") || 1;
  const duration = queryParams.get("duration") || 60;

  const [userAuthority, setUserAuthority] = useState(null);
  const [challengeData, setChallengeData] = useState(null);

  // 카테고리 관련 상태 (List 페이지와 동일)
  const [categories, setCategories] = useState([
    { value: "all", label: "모든 카테고리" },
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  // 인증 관련 상태
  const [verificationRecords, setVerificationRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜

  // 인증 폼을 위한 React Hook Form
  const verificationForm = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
      activity: "",
    },
  });

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false;

  // 카테고리 목록 가져오기 (List 페이지와 동일)
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axiosInstance.get("/categories/challenge");

      // 응답 데이터 구조에 따라 처리
      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        categoryData = response.data.content;
      }

      // 카테고리 옵션 생성 (모든 카테고리 옵션 추가)
      const categoryOptions = [
        { value: "all", label: "모든 카테고리" },
        ...categoryData
          .map((category) => {
            const value =
              category.challName || category.name || category.categoryName;
            const label =
              category.challName ||
              category.name ||
              category.categoryName ||
              "이름 없음";
            return { value, label };
          })
          .filter((option) => option.value && option.value.trim() !== ""), // 빈 값 필터링
      ];

      setCategories(categoryOptions);
    } catch (err) {
      console.error("카테고리 불러오기 오류:", err);
      // 오류 발생 시 기본 옵션만 사용
      setCategories([{ value: "all", label: "모든 카테고리" }]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 카테고리 매핑 함수 (List 페이지와 동일)
  const getCategoryName = (categoryValue) => {
    if (!categoryValue && categoryValue !== 0) return "미분류";

    // challCategoryIdx가 숫자인 경우 인덱스로 찾기
    if (typeof categoryValue === "number") {
      const category = categories[categoryValue];
      return category ? category.label : `카테고리 ${categoryValue}`;
    }

    // 문자열인 경우 value로 찾기
    const category = categories.find((cat) => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // 상태값을 한글로 변환하는 함수
  const getStatusText = (status) => {
    const statusMap = {
      IN_PROGRESS: "진행중",
      PUBLISHED: "게시중",
      COMPLETED: "종료됨",
      게시중: "게시중",
      진행중: "진행중",
      종료됨: "종료됨",
    };

    return statusMap[status] || status || "상태 정보 없음";
  };

  // 컴포넌트 마운트 시 카테고리 목록 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  // 현재 사용자가 참여자인지 확인하는 함수 - useCallback으로 메모이제이션
  const checkUserParticipation = useCallback(
    (challengeData) => {
      if (!challengeData?.participants || !userIdx) {
        setIsParticipant(false);
        return;
      }

      const isUserParticipant = challengeData.participants.some(
        (participant) => {
          return participant.userIdx === parseInt(userIdx);
        }
      );

      setIsParticipant(isUserParticipant);
    },
    [userIdx]
  );

  // 챌린지 기간 내 날짜들 생성
  const generateChallengeDates = useCallback(() => {
    if (!challengeData) return [];

    const startDate = new Date(challengeData.challStartTime);
    const endDate = new Date(challengeData.challEndTime);
    const dates = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [challengeData]);

  // 날짜가 인증 완료된 날인지 확인
  const isDateVerified = useCallback(
    (date) => {
      // verificationRecords가 배열인지 확인
      if (!Array.isArray(verificationRecords)) {
        console.warn(
          "verificationRecords is not an array:",
          verificationRecords
        );
        return false;
      }

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateString = `${y}-${m}-${d}`;
      return verificationRecords.some((record) => {
        // startTime에서 날짜 부분 추출
        const recordDate = record.startTime
          ? record.startTime.split("T")[0]
          : null;
        return recordDate === dateString;
      });
    },
    [verificationRecords]
  );

  // 오늘 날짜인지 확인
  const isToday = useCallback((date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // 인증 가능한 날짜인지 확인 (오늘 날짜만)
  const canVerifyDate = useCallback(
    (date) => {
      return isToday(date) && !isDateVerified(date);
    },
    [isToday, isDateVerified]
  );

  // 챌린지 상세정보
  useEffect(() => {
    const fetchChallengeDetail = async () => {
      try {
        setLoading(true);
        setError(null); // 에러 상태 초기화

        const challIdxNumber = Number(challIdx);
        if (!challIdxNumber || isNaN(challIdxNumber)) {
          console.error("유효하지 않은 challIdx:", challIdx);
          setError("유효하지 않은 챌린지 ID입니다.");
          return;
        }

        const response = await axiosInstance.get(
          `/challenges/${challIdxNumber}`
        );
        console.log("=== 챌린지 상세 API 응답 ===");
        console.log("전체 response:", response);
        console.log("response.data:", response.data);
        // 응답 데이터 검증
        if (!response.data) {
          console.error("응답 데이터가 null 또는 undefined");
          setError("챌린지 데이터를 불러올 수 없습니다.");
          return;
        }

        // 필수 필드 확인
        const requiredFields = ["challTitle", "challDescription"];
        const missingFields = requiredFields.filter(
          (field) => !response.data[field]
        );
        if (missingFields.length > 0) {
          console.warn("누락된 필수 필드:", missingFields);
        }

        // 응답이 {success: true, challenge: {...}} 형태인 경우 처리
        const actualChallengeData = response.data.challenge || response.data;

        // challengeData 설정
        setChallengeData(actualChallengeData);

        // 참여 상태 확인 - 실제 챌린지 데이터를 직접 사용
        checkUserParticipation(actualChallengeData);
      } catch (err) {
        console.error("챌린지 상세정보 조회 실패:", err);
        setError(`챌린지 정보를 불러오는데 실패했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (challIdx) {
      fetchChallengeDetail();
    } else {
      setError("챌린지 ID가 제공되지 않았습니다.");
      setLoading(false);
    }
  }, [challIdx, checkUserParticipation]);

  useEffect(() => {
    if (isParticipant && !selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
  }, [isParticipant, selectedDate]);

  // 인증 기록 불러오기
  useEffect(() => {
    const fetchVerificationRecords = async () => {
      if (!isParticipant || !challIdx) {
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/challenges/verify-records/${challIdx}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // 응답 데이터가 배열인지 확인하고 설정
        if (Array.isArray(response.data)) {
          setVerificationRecords(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setVerificationRecords(response.data.data);
        } else if (response.data && Array.isArray(response.data.records)) {
          setVerificationRecords(response.data.records);
        } else {
          console.warn("예상하지 못한 응답 구조:", response.data);
          setVerificationRecords([]);
        }
      } catch (err) {
        console.error("인증 기록 불러오기 실패:", err);
        // API가 없는 경우 빈 배열로 설정
        setVerificationRecords([]);
      }
    };

    fetchVerificationRecords();
  }, [isParticipant, challIdx, userIdx, accessToken]);

  // 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    const dateString = date.toLocaleDateString();
    const isVerified = isDateVerified(date);
    const isTodayDate = isToday(date);

    // 선택된 날짜 설정
    setSelectedDate(date);
  };

  // 챌린지 참여 함수
  const joinChallenge = async () => {
    try {
      setJoining(true);

      const now = new Date();
      const startTime = now.toISOString();
      const endTime = new Date(now.getTime() + 30 * 60000).toISOString();

      const params = {
        challIdx: challIdx,
        userIdx: userIdx,
        duration: duration,
        challStartTime: startTime,
        challEndTime: endTime,
      };

      await axiosInstance.post(
        `/challenges/auth/join/${challIdx}`,
        {
          activity: challengeData?.challTitle || "챌린지",
          activityTime: challengeData?.totalClearTime || 0,
        },
        {
          params: params,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast({
        title: "성공",
        description: "챌린지 참여 신청이 완료되었습니다.",
      });

      // 챌린지 정보 재조회 - 일관된 엔드포인트 사용
      const updatedResponse = await axiosInstance.get(
        `/challenges/${challIdx}` // 동일한 엔드포인트 사용
      );

      // 응답 구조 확인 및 데이터 추출 (초기 조회와 동일한 패턴 적용)
      const updatedChallengeData =
        updatedResponse.data.challenge || updatedResponse.data;

      setChallengeData(updatedChallengeData);
      checkUserParticipation(updatedChallengeData);
    } catch (err) {
      console.error("챌린지 참여 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 참여에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  // 챌린지 인증 함수
  const verifyChallenge = async (data) => {
    try {
      setVerifying(true);

      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // 타입 가드 추가
      const isAlreadyVerified = Array.isArray(verificationRecords)
        ? verificationRecords.some((record) => {
            // startTime에서 날짜 부분 추출
            const recordDate = record.startTime
              ? record.startTime.split("T")[0]
              : null;
            return recordDate === todayString;
          })
        : false;

      if (isAlreadyVerified) {
        toast({
          title: "이미 인증 완료",
          description: "오늘은 이미 인증을 완료했습니다.",
          variant: "destructive",
        });
        return;
      }

      if (!data.startTime || !data.endTime || !data.activity) {
        toast({
          title: "입력 오류",
          description: "모든 필드를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      if (startTotalMinutes >= endTotalMinutes) {
        toast({
          title: "시간 오류",
          description: "종료 시간이 시작 시간보다 늦어야 합니다.",
          variant: "destructive",
        });
        return;
      }

      const startDateTime = `${todayString}T${data.startTime}:00`;
      const endDateTime = `${todayString}T${data.endTime}:00`;

      await axiosInstance.post(
        `/challenges/auth/verify/${challIdx}`,
        {
          startTime: startDateTime,
          endTime: endDateTime,
          activity: data.activity,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newRecord = {
        verifyIdx: Date.now(), // 임시 ID
        startTime: startDateTime,
        endTime: endDateTime,
        elapsedMinutes: endTotalMinutes - startTotalMinutes,
        activity: data.activity,
      };

      setVerificationRecords((prev) => [...prev, newRecord]);

      // 인증 완료 후 오늘 날짜를 선택된 날짜로 설정
      setSelectedDate(today);

      toast({
        title: "성공",
        description: "챌린지 인증이 완료되었습니다.",
      });

      verificationForm.reset({
        startTime: "",
        endTime: "",
        activity: "",
      });
    } catch (err) {
      console.error("챌린지 인증 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 인증에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  // 🔥 수정된 챌린지 삭제 함수
  const deleteChallenge = async () => {
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

      // 🔥 통합 모드일 때는 콜백 함수 사용, 아닐 때는 navigate 사용
      if (isIntegrated && onBack) {
        onBack();
      } else {
        navigate("/challenge");
      }
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">챌린지 정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">에러 발생</div>
          <div className="text-gray-600">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // challengeData가 없는 경우
  if (!challengeData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">챌린지 데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  // 달력 컴포넌트
  const ChallengeCalendar = () => {
    const challengeDates = generateChallengeDates();

    if (!challengeDates.length) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">챌린지 달력</h3>
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}

            {challengeDates.map((date, index) => {
              const isVerified = isDateVerified(date);
              const isTodayDate = isToday(date);
              const canVerify = canVerifyDate(date);
              const isSelected =
                selectedDate &&
                selectedDate.toDateString() === date.toDateString();

              return (
                <div
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    relative aspect-square border rounded-lg cursor-pointer transition-all
                  flex items-center justify-center
                    ${
                      isTodayDate
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }
                    ${isVerified ? "bg-green-100 border-green-500" : ""}
                    ${isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""}
                    ${canVerify ? "hover:bg-blue-100" : "hover:bg-gray-50"}
                  `}
                >
                  <span className="text-sm font-medium text-center">
                    {date.getDate()}
                  </span>
                  {isVerified && (
                    <div className="absolute top-1 right-1">
                      <MdCheck className="text-green-600 text-lg" />
                    </div>
                  )}
                  {isTodayDate && !isVerified && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>오늘</span>
            </div>
            <div className="flex items-center gap-1">
              <MdCheck className="text-green-600" />
              <span>인증 완료</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // 인증 기록 컴포넌트
  const VerificationHistory = () => {
    // 타입 가드 추가
    if (!Array.isArray(verificationRecords) || !verificationRecords.length) {
      return null;
    }

    // 선택된 날짜가 있으면 해당 날짜의 기록만 필터링
    let displayRecords = verificationRecords;
    if (selectedDate) {
      const sy = selectedDate.getFullYear();
      const sm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const sd = String(selectedDate.getDate()).padStart(2, "0");
      const selectedDateString = `${sy}-${sm}-${sd}`;
      displayRecords = verificationRecords.filter((record) => {
        // startTime에서 날짜 부분 추출
        const recordDate = record.startTime
          ? record.startTime.split("T")[0]
          : null;
        return recordDate === selectedDateString;
      });

      // 선택된 날짜에 기록이 없으면 메시지 표시
      if (displayRecords.length === 0) {
        return (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              인증 기록 - {selectedDate.toLocaleDateString()}
            </h3>
            <Card className="p-4">
              <div className="text-center py-6 text-gray-500">
                {selectedDate.toLocaleDateString()}에는 인증 기록이 없습니다.
              </div>
            </Card>
          </div>
        );
      }
    }

    const title = `챌린지 기록`;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold"> {title}</h3>
        </div>
        <div className="space-y-3">
          {displayRecords.map((record, index) => (
            <Card key={index} className="p-4">
              {/* 활동 내용 */}
              <div className="mb-4">
                <div className="flex items-center mt-1 mb-2">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <BsCalendarCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">인증일</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-7">
                  {selectedDate.toLocaleDateString()}
                </div>
              </div>
              {/* 활동 내용 */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <GoPulse className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">활동 내용</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-7">
                  {record.activity}
                </div>
              </div>
              {/* 참여 시간 */}
              <div className="mb-1">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <GoClock className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">참여 시간</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-7">
                  {record.startTime
                    ? new Date(record.startTime).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}{" "}
                  ~{" "}
                  {record.endTime
                    ? new Date(record.endTime).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}{" "}
                  ({record.elapsedMinutes}분)
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 🔥 수정된 수정/삭제 버튼 (관리자만)
  const ModifyDeleteButtons = () => {
    if (roleStatus === true) {
      const handleEdit = () => {
        if (isIntegrated && onEdit) {
          onEdit();
        } else {
          navigate(`/challenge/modify/${challIdx}`);
        }
      };

      return (
        <div className="flex space-x-2 mt-4">
          <Button variant="outline" className="w-1/2" onClick={handleEdit}>
            수정하기
          </Button>
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={() => {
              if (window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
                deleteChallenge();
              }
            }}
            disabled={deleting}
          >
            {deleting ? "삭제 중..." : "삭제하기"}
          </Button>
        </div>
      );
    }
    return null;
  };

  // 참여 버튼 (일반유저만, 참여하지 않은 경우)
  const JoinButtons = () => {
    if (roleStatus === false && !isParticipant) {
      return (
        <Button
          className="w-full mt-4"
          onClick={joinChallenge}
          disabled={joining}
        >
          {joining ? "참여 신청 중..." : "지금 참여하기"}
        </Button>
      );
    }
    return null;
  };

  // 인증 폼
  const VerificationForm = () => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // 타입 가드 추가
    const isAlreadyVerified = Array.isArray(verificationRecords)
      ? verificationRecords.some((record) => {
          // startTime에서 날짜 부분 추출
          const recordDate = record.startTime
            ? record.startTime.split("T")[0]
            : null;
          return recordDate === todayString;
        })
      : false;

    if (isAlreadyVerified) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <div className="text-center py-4">
              <MdCheck className="mx-auto text-green-600 text-4xl mb-2" />
              <h3 className="text-lg font-semibold text-green-600">
                오늘 인증 완료!
              </h3>
            </div>
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MdVerified className="mr-2" />
              {today.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}{" "}
              기록
            </h3>

            <form onSubmit={verificationForm.handleSubmit(verifyChallenge)}>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="w-full"
                    {...verificationForm.register("startTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="w-full "
                    {...verificationForm.register("endTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="activity">활동 내용</Label>
                  <Input
                    id="activity"
                    type="text"
                    placeholder="예: 러닝 5km, 독서 2시간 등"
                    {...verificationForm.register("activity")}
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    verificationForm.reset({
                      startTime: "",
                      endTime: "",
                      activity: "",
                    });
                  }}
                >
                  초기화
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white border-indigo-600 hover:bg-blue-700 active:bg-blue-800"
                  disabled={verifying}
                >
                  {verifying ? "인증 중..." : "인증하기"}
                </Button>
              </div>
            </form>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div>
      <div className={`mb-20 ${isIntegrated ? "mt-20" : ""}`}>
        {/* 카테고리 및 상태 */}
        <div className="flex flex-row items-center justify-center gap-1">
          <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
            {getStatusText(challengeData?.challState)}
          </div>
          <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
            {/* List 페이지와 동일한 방식으로 카테고리명 표시 */}
            {(() => {
              const categoryValue =
                challengeData.challCategoryIdx !== undefined
                  ? challengeData.challCategoryIdx
                  : challengeData.challCategory ||
                    challengeData.categoryName ||
                    challengeData.category ||
                    challengeData.challName ||
                    null;

              return categoryValue !== null && categoryValue !== undefined
                ? getCategoryName(categoryValue)
                : "카테고리 정보 없음";
            })()}
          </div>
        </div>

        {/* 제목 */}
        <div className="text-center text-2xl font-bold mb-2 mt-1">
          {challengeData?.challTitle || "제목 정보 없음"}
        </div>
        <div className="text-center text-gray-500">
          등록일 :{" "}
          {challengeData?.challCreatedAt
            ? new Date(challengeData.challCreatedAt).toLocaleDateString()
            : "등록일 정보 없음"}
        </div>
      </div>

      {/* 참여 인원 */}
      <div className="flex items-center justify-between mt-10">
        <div className="flex items-center">
          <GoPeople />
          <span className="ml-1">참여 인원</span>
        </div>
        <span>
          {challengeData?.currentParticipants || 0}/
          {challengeData?.maxParticipants || 0}명
        </span>
      </div>
      <hr className="my-3 border-gray-200" />

      {/* 기간 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <MdOutlineDateRange />
          <span className="ml-1">기간</span>
        </div>
        <span>
          {challengeData?.challStartTime
            ? new Date(challengeData.challStartTime).toLocaleDateString()
            : "시작일 없음"}{" "}
          ~{" "}
          {challengeData?.challEndTime
            ? new Date(challengeData.challEndTime).toLocaleDateString()
            : "종료일 없음"}
        </span>
      </div>
      <hr className="my-3 border-gray-200" />

      {/* 최소 참여 시간 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <GoClock />
          <span className="ml-1">최소 참여 시간</span>
        </div>
        <span>
          {formatMinutesToHoursAndMinutes(
            challengeData?.minParticipationTime || 0
          )}
        </span>
      </div>
      <hr className="my-3 border-gray-200" />

      {/* 총 클리어 시간 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <GoTrophy />
          <span className="ml-1">총 클리어 시간</span>
        </div>
        <span>
          {formatMinutesToHoursAndMinutes(
            challengeData?.totalClearTime || 1000
          )}
        </span>
      </div>
      <hr className="my-3 border-gray-200" />

      {/* 챌린지 소개 */}
      <div className="mt-3">
        챌린지 소개
        <Card className="bg-white shadow-sm mt-3">
          <CardHeader>
            {challengeData?.challDescription || "챌린지 설명이 없습니다."}
          </CardHeader>
        </Card>
      </div>

      {/* 버튼 렌더링 */}
      <ModifyDeleteButtons />
      <JoinButtons />

      {/* 참여자만 볼 수 있는 섹션 */}
      {roleStatus === false && isParticipant && (
        <>
          <ChallengeCalendar />
          <VerificationForm />
          <VerificationHistory />
        </>
      )}
    </div>
  );
};

export default ChallengeDetailForm;
