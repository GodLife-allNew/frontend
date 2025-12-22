// src/components/routine/RoutineForm/index.js
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { GitFork } from "lucide-react"; // GitFork 아이콘 임포트 추가
import { formSchema } from "./schema";
import useFormSections from "./hooks/useFormSections";
import CreateRoutineDialog from "./dialogs/CreateRoutineDialog";
import axiosInstance from "@/shared/api/axiosInstance";

export default function RoutineForm({
  isReadOnly = false,
  routineData = null,
  isActive = false,
  certifiedActivities = {},
  onCertifyActivity = null,
  onSubmit = null,
  isEditMode = false, // 수정 모드 prop 추가
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isForkData, setIsForkData] = useState(false);
  const [forkIdx, setForkIdx] = useState(null);
  const navigate = useNavigate();

  const originalRoutineDataRef = useRef(null);

  // 기본값 설정 - 읽기 전용 모드에서는 routineData 사용
  const defaultValues = routineData
    ? {
        ...routineData,
        activities: routineData.activities.map((a) => ({
          activityIdx: a.activityIdx, // 기존 활동 ID 유지
          activityName: a.activityName || "",
          setTime: a.setTime || "08:00",
          description: a.description || "",
          activityImp: a.activityImp ?? 3, // 기본 중요도 3
          verified: a.verified ?? false,
        })),
      }
    : {
        planTitle: "",
        userIdx: null,
        endTo: 7,
        targetIdx: null,
        isShared: 0,
        planImp: 5,
        jobIdx: null,
        jobEtcCateDTO: null,
        activities: [],
        repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        forkIdx: null,
        forked: false,
      };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onSubmit",
    shouldUnregister: false, // ✅ form 리렌더 시 기존 필드 유지
  });

  // 사용자 정보 및 포크 데이터 로드
  useEffect(() => {
    if (!isReadOnly && !isEditMode) {
      try {
        // 1. 세션스토리지에서 포크된 루틴 데이터 확인
        const forkData = sessionStorage.getItem("forkRoutineData");

        if (forkData) {
          // 포크 데이터가 있으면 파싱하여 폼 값 설정
          const parsedForkData = JSON.parse(forkData);
          console.log("포크된 루틴 데이터 불러옴:", parsedForkData);

          // 폼 값 설정
          form.reset(parsedForkData);

          // 개별 필드 설정 (필요한 경우)
          form.setValue("planTitle", parsedForkData.planTitle);
          form.setValue("endTo", parsedForkData.endTo);
          form.setValue("targetIdx", parsedForkData.targetIdx);
          form.setValue("isShared", parsedForkData.isShared);
          form.setValue("planImp", parsedForkData.planImp);
          form.setValue("jobIdx", parsedForkData.jobIdx);
          form.setValue("jobEtcCateDTO", parsedForkData.jobEtcCateDTO);
          form.setValue("activities", parsedForkData.activities);
          form.setValue("repeatDays", parsedForkData.repeatDays);

          // 포크 정보 저장
          if (parsedForkData.forkIdx && parsedForkData.forked) {
            setIsForkData(true);
            setForkIdx(parsedForkData.forkIdx);
            form.setValue("forkIdx", parsedForkData.forkIdx);
            form.setValue("forked", parsedForkData.forked);
          }

          // 사용자 정보는 덮어쓰지 않음 (포크된 데이터에 없을 수 있음)
          const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          if (userInfo.userIdx) {
            form.setValue("userIdx", userInfo.userIdx);
          }

          // 사용 후 세션스토리지에서 데이터 삭제 (선택사항)
          sessionStorage.removeItem("forkRoutineData");
          return;
        }

        // 2. 포크된 데이터가 없고 수정 모드인 경우 루틴 데이터 사용
        if (routineData) {
          return; // 이미 defaultValues로 설정되어 있음
        }

        // 3. 새로운 루틴 생성 모드일 때 사용자 정보 적용
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (userInfo.userIdx) {
          form.setValue("userIdx", userInfo.userIdx);
        }
        if (userInfo.jobIdx) {
          form.setValue("jobIdx", userInfo.jobIdx);
        }
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    }
  }, [form, isReadOnly, routineData]);

  useEffect(() => {
    if (isEditMode && routineData) {
      // ✅ routineData.activities에 activityIdx를 포함시켜 form에 다시 주입
      originalRoutineDataRef.current = {
        ...routineData,
        activities: routineData.activities.map((a) => ({
          activityIdx: a.activityIdx,
          activityName: a.activityName || "",
          setTime: a.setTime || "08:00",
          description: a.description || "",
          activityImp: a.activityImp ?? 3,
          verified: a.verified ?? false,
        })),
      };
      const resetValues = {
        ...routineData,
        activities: routineData.activities.map((a) => ({
          activityIdx: a.activityIdx,
          activityName: a.activityName || "",
          setTime: a.setTime || "08:00",
          description: a.description || "",
          activityImp: a.activityImp ?? 3,
          verified: a.verified ?? false,
        })),
      };

      console.log("폼 초기화 (resetValues):", resetValues);
      form.reset(resetValues); // ✅ form 상태 강제 동기화

      console.log(
        "form.getValues('activities'):",
        form.getValues("activities")
      );
    }
  }, [isEditMode, routineData, form]);

  // 폼 제출 핸들러
  async function handleFormSubmit(values) {
    if (isReadOnly) return;

    console.log("제출된 values:", values);
    console.log("제출된 activities:", values.activities);
    console.log(
      "activities 상세:",
      values.activities.map((a) => ({
        activityIdx: a.activityIdx,
        activityName: a.activityName,
        hasIdx: !!a.activityIdx,
      }))
    );

    // 수정 모드일 때만 삭제된 활동 추적
    const deleteActivityIdx = [];
    if (isEditMode && originalRoutineDataRef.current?.activities) {
      const originalActivityIds = originalRoutineDataRef.current.activities
        .map((a) => Number(a.activityIdx))
        .filter((id) => id > 0); // 0이 아닌 ID만 포함

      const currentActivityIds = values.activities
        .filter((a) => a.activityIdx && Number(a.activityIdx) > 0)
        .map((a) => Number(a.activityIdx));

      deleteActivityIdx.push(
        ...originalActivityIds.filter((id) => !currentActivityIds.includes(id))
      );

      console.log("원본 활동 IDs:", originalActivityIds);
      console.log("현재 활동 IDs:", currentActivityIds);
      console.log("삭제할 활동 IDs:", deleteActivityIdx);
    }

    const processedActivities = values.activities.map((activity) => ({
      activityIdx:
        activity.activityIdx !== undefined && activity.activityIdx !== null
          ? Number(activity.activityIdx)
          : 0,
      planIdx: isEditMode ? routineData?.planIdx : null,
      activityName: activity.activityName,
      setTime: activity.setTime,
      description: activity.description || "",
      activityImp: activity.activityImp,
    }));

    // 수정 모드용 데이터 구조
    if (isEditMode) {
      const requestData = {
        planIdx: routineData?.planIdx,
        planTitle: values.planTitle,
        endTo: values.endTo,
        repeatDays: values.repeatDays || [],
        targetIdx: values.targetIdx,
        jobIdx: values.jobIdx,
        planImp: values.planImp,
        isShared: values.isShared,
        isActive: 0,
        activities: processedActivities,
        deleteActivityIdx: deleteActivityIdx,
        jobCateDTO: null,
        jobEtcCateDTO: values.jobIdx === 19 ? values.jobEtcCateDTO : null,
      };

      // 포크 정보 추가
      if (isForkData && forkIdx) {
        requestData.forkIdx = forkIdx;
        requestData.forked = true;
      }

      if (onSubmit) {
        onSubmit(requestData);
      }
      return;
    }

    // 일반 생성 모드 로직
    const processedValues = {
      ...values,
      activities: processedActivities.map((a) => ({
        activityName: a.activityName,
        setTime: a.setTime,
        description: a.description,
        activityImp: a.activityImp,
      })),
    };

    if (isForkData && forkIdx) {
      processedValues.forkIdx = forkIdx;
      processedValues.forked = true;
    } else {
      processedValues.forkIdx = null;
      processedValues.forked = false;
    }

    setFormData(processedValues);
    setShowCreateDialog(true);
  }
  // 루틴 생성 함수 (모달에서 선택 시 호출)
  const handleCreateRoutine = async (startNow) => {
    setShowCreateDialog(false);

    if (!formData) return;

    const requestData = {
      ...formData,
      isActive: startNow ? 1 : 0, // 시작 여부에 따라 isActive 설정
    };

    // jobIdx가 999가 아니고 jobEtcCateDTO가 설정된 경우 null로 변경
    if (requestData.jobIdx !== 19 && requestData.jobEtcCateDTO) {
      requestData.jobEtcCateDTO = null;
    }

    let token = localStorage.getItem("accessToken");

    try {
      // 루틴 생성 API 호출 함수
      const createRoutine = async (authToken) => {
        try {
          const response = await axiosInstance.post(
            "/plan/auth/write",
            requestData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          return response;
        } catch (error) {
          // 다른 오류는 그대로 던지기
          throw error;
        }
      };

      // API 호출
      const response = await createRoutine(token);
      console.log("루틴 생성 성공:", response.data);

      // 성공 메시지
      alert(
        startNow
          ? "루틴이 성공적으로 생성되었고 지금부터 시작됩니다!"
          : "루틴이 성공적으로 생성되었습니다. 나중에 시작할 수 있습니다."
      );

      // 루틴 목록 페이지로 이동
      navigate("/routine/mylist");
    } catch (error) {
      console.error("루틴 생성 실패:", error);
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
        alert(
          `루틴 생성 실패: ${
            error.response.data.message || "알 수 없는 오류가 발생했습니다."
          }`
        );
      } else if (error.request) {
        console.error("요청 실패:", error.request);
        alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        console.error("오류 메시지:", error.message);
        alert("요청 중 오류가 발생했습니다.");
      }
    }
  };

  // 폼 섹션들 가져오기
  const {
    TitleSectionCard,
    JobSectionCard,
    DurationAndImportanceSection,
    RepeatDaysCard,
    InterestSectionCard,
    ShareSettingsCard,
    ActivitiesSectionCard,
  } = useFormSections({
    form,
    isReadOnly,
    isActive,
    certifiedActivities,
    onCertifyActivity,
    routineData,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
        lang="ko"
      >
        {isForkData && forkIdx && (
          <div className="bg-purple-50 border border-purple-200 p-3 rounded-md text-purple-700 text-sm">
            <GitFork className="inline-block w-4 h-4 mr-1 mb-1" />
            다른 사용자의 루틴을 포크하여 작성 중입니다. 루틴을 저장하면 원본
            루틴의 포크 카운트가 증가합니다.
          </div>
        )}

        {/* 각 섹션 렌더링 */}
        <TitleSectionCard />
        <JobSectionCard />
        <DurationAndImportanceSection />
        <RepeatDaysCard />
        <InterestSectionCard />
        {!isReadOnly && <ShareSettingsCard />}
        <ActivitiesSectionCard />

        {/* 제출 버튼 (읽기 전용 모드가 아닐 때만) */}
        {!isReadOnly && (
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" className="w-1/2 bg-blue-500">
              {isEditMode ? "루틴 저장하기" : "루틴 생성하기"}
            </Button>
          </div>
        )}
      </form>

      {/* 루틴 시작 확인 다이얼로그 - 수정 모드가 아닌 경우에만 표시 */}
      {!isEditMode && (
        <CreateRoutineDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onConfirm={handleCreateRoutine}
        />
      )}
    </Form>
  );
}
