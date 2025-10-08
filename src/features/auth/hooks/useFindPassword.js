import { useState } from "react"
import { useToast } from "@/shared/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

import { useApi } from "@/shared/hooks/useApi"; // useApi 경로 확인

export const useFindPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userEmail, setUserEmail] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const { loading: apiLoading, error, patch, post } = useApi();

  const loading = apiLoading;

  // 이메일 조회
  const checkUserEmail = async (e) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이메일을 입력해주세요.",
      });
      return;
    }

    try {
      const response = await post("/verify/emails/send/just/verification-requests", { userEmail });

      if (response.status === 200) {
        toast({ title: "인증 메일 발송 완료", description: "이메일을 확인해주세요." });
        setStep(2);
      } else if (response.status === 500) {
        toast({ variant: "destructive", title: "오류", description: "서버 문제로 인해 코드 전송에 실패했습니다." });
      }
    } catch {
      toast({ variant: "destructive", title: "전송 실패", description: "메일이 존재하지 않거나 유효하지 않은 이메일 입니다." });
    }
  };

  // 인증 코드 확인
  const verifyCode = async (e) => {

    e.preventDefault();

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
      if (response.data.verified) {
        toast({ title: "인증 성공", description: "새로운 비밀번호를 설정해주세요." });
        setStep(3);
      }
    } catch {
      toast({ variant: "destructive", title: "오류", description: "인증 코드가 일치하지 않거나, 유효 시간을 초과 했습니다." });
    }
  };

  // 비밀번호 변경
  const changePassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "새 비밀번호를 입력해주세요.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    try {
      const response = await patch(`/user/find/userPw/${userEmail}`, 
        {
          userPw: newPassword,
          userPwConfirm: confirmPassword,
        }
      );

      if (response.status === 200) {
        toast({ title: "비밀번호 변경 완료", description: "비밀번호가 성공적으로 변경되었습니다.", });
        navigate("/user/login");
      } else if (response.status === 500) {
        toast({ variant: "destructive", title: "오류", description: "서버 문제로 인해 비밀번호 변경에 실패 했습니다." });
      }
    } catch(error) {
      toast({ variant: "destructive", title: "오류", description: "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요." });
      // const err = error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.";
      console.log(error);
    }
  };

  return {
    navigate,
    userEmail,
    step,
    newPassword,
    confirmPassword,
    verificationCode,
    loading,
    setUserEmail,
    setStep,
    setNewPassword,
    setConfirmPassword,
    setVerificationCode,
    checkUserEmail,
    verifyCode,
    changePassword,
    error,
  };
};