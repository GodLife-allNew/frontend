import { useState } from "react";
import { useToast } from "@/shared/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/shared/hooks/useApi"; // useApi 경로 확인

export const useFindId = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: apiLoading, error, get, post } = useApi();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [foundUserId, setFoundUserId] = useState("");
  const [step, setStep] = useState(1);

  const loading = apiLoading; // 기존 loading과 통합

  // 이메일 인증 코드 요청
  const requestVerificationCode = async () => {
    try {
      const response = await post("/verify/emails/send/just/verification-requests", { userEmail });
      if (response.status === 200) {
        toast({ title: "인증 메일 발송 완료", description: "이메일을 확인해주세요." });
        setStep(3);
      } else if (response.status === 500) {
        toast({ variant: "destructive", title: "오류", description: "서버 문제로 인해 코드 전송에 실패했습니다." });
      }
    } catch {
      toast({ variant: "destructive", title: "전송 실패", description: "메일이 존재하지 않거나 유효하지 않은 이메일 입니다." });
    }
  };

  // 인증 코드 확인
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "인증 코드를 입력해주세요.",
      });
      return;
    }

    try {
      const response = await post(`/verify/emails/just/verifications?code=${verificationCode}`, { userEmail });
      if (response.status === 200) {
        if (response.data.verified) {
          toast({ title: "인증 성공", description: "이메일 인증 완료" });
          findDetailedUserId();
        } else {
          toast({ title: "인증 실패", description: "인증 코드가 일치하지 않거나, 유효 시간을 초과 했습니다." });
        }
      }
    } catch {
      toast({ variant: "destructive", title: "오류", description: "서버 오류로 인해 코드 검증에 실패했습니다." });
    }
  };

  // 마스킹된 아이디 찾기
  const findUserId = async () => {
    if (!userName.trim()) {
      toast({ variant: "destructive", title: "오류", description: "이름을 입력해주세요." });
      return;
    }
    if (!userEmail.trim()) {
      toast({ variant: "destructive", title: "오류", description: "이메일을 입력해주세요." });
      return;
    }

    try {
      const res = await get(`/user/find/userId?userName=${userName}&userEmail=${userEmail}`);
      if (res.status === 200 && res.data) {
        setFoundUserId(res.data.message);
        toast({ title: "아이디 찾기 성공" });
        setStep(2);
      }
    } catch {
      toast({ variant: "destructive", title: "오류", description: "아이디를 찾을 수 없습니다." });
    }
  };

  // 상세 아이디 찾기
  const findDetailedUserId = async () => {
    try {
      const res = await get(`/user/find/userId/noMask?userName=${userName}&userEmail=${userEmail}`);
      if (res.status === 200 && res.data) {
        setFoundUserId(res.data.message);
        setStep(4);
      }
    } catch {
      toast({ variant: "destructive", title: "오류", description: "상세 아이디 찾기 실패" });
    }
  };

  return {
    navigate,
    userName,
    userEmail,
    verificationCode,
    foundUserId,
    step,
    loading,
    setUserName,
    setUserEmail,
    setVerificationCode,
    setFoundUserId,
    setStep,
    requestVerificationCode,
    verifyCode,
    findUserId,
    findDetailedUserId,
    error,
  };
};
