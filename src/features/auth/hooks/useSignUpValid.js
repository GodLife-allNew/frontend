import { useState } from "react";
import { useApi } from "@/shared/hooks/useApi";
import { useToast } from "@/shared/components/ui/use-toast";

export const useSignUpValid = (form, refs = {}) => {
  const { userIdInputRef, userEmailInputRef, emailCheckInputRef } = refs;
  const { toast } = useToast();

  const { get, post, loading, error } = useApi();
  const [isIdValid, setIsIdValid] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  /**
   *  아이디 중복 확인
   */
  const checkDuplicateId = async () => {
    const userId = form.getValues("userId").trim();

    if (!userId) {
      toast({
        title: "입력 필요",
        description: "아이디를 입력해주세요.",
        variant: "destructive",
      });
      userIdInputRef?.current?.focus();
      return;
    }

    try {
      const response = await get(`user/checkId/${userId}`);
      const data = response.data;

      if (data === true) {
        setIsIdValid(false);
        toast({
          title: "중복 확인",
          description: "이미 사용 중인 아이디입니다.",
          variant: "destructive",
        });
        userIdInputRef?.current?.focus();
      } else {
        setIsIdValid(true);
        toast({
          title: "사용 가능",
          description: "사용 가능한 아이디입니다!",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("아이디 중복 확인 오류:", err);
      toast({
        title: "오류",
        description: "중복 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  /**
   *  이메일 인증 코드 요청
   */
  const requestEmailVerification = async () => {
    const userEmail = form.getValues("userEmail").trim();

    if (!userEmail) {
      toast({
        title: "입력 필요",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      });
      userEmailInputRef?.current?.focus();
      return;
    }

    try {
      const response = await post(`/verify/emails/send/verification-requests`, {
        userEmail,
      });

      console.log("이메일 인증 코드 전송 응답:", response.data);
      toast({
        title: "인증 요청 완료",
        description: "인증 코드가 이메일로 전송되었습니다.",
      });
    } catch (err) {
      console.error("이메일 인증 코드 전송 오류:", err);
      const message =
        err?.response?.data?.message || "인증 코드 전송 중 오류가 발생했습니다.";
      toast({
        title: "오류",
        description: message,
        variant: "destructive",
      });
    }
  };

  /**
   *  이메일 인증 코드 확인
   */
  const verifyEmailCode = async () => {
    const userEmail = form.getValues("userEmail").trim();
    const verificationCode = form.getValues("verificationCode").trim();

    if (!userEmail) {
      toast({
        title: "입력 필요",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      });
      emailCheckInputRef?.current?.focus();
      return;
    }

    if (!verificationCode) {
      toast({
        title: "입력 필요",
        description: "인증 코드를 입력해주세요.",
        variant: "destructive",
      });
      emailCheckInputRef?.current?.focus();
      return;
    }

    try {
      const response = await post(
        `/verify/emails/verifications?code=${verificationCode}`,
        { userEmail }
      );

      console.log("이메일 인증 코드 확인 응답:", response.data);

      // 인증 성공
      setIsEmailVerified(true);
      toast({
        title: "인증 완료",
        description: "이메일 인증이 완료되었습니다.",
      });
    } catch (err) {
      console.error("이메일 인증 코드 확인 오류:", err);
      const message =
        err?.response?.data?.message || "인증 코드 확인 중 오류가 발생했습니다.";
      toast({
        title: "오류",
        description: message,
        variant: "destructive",
      });
    }
  };

  // ✅ 반환
  return {
    loading,
    error,
    isIdValid,
    isEmailVerified,
    checkDuplicateId,
    requestEmailVerification,
    verifyEmailCode,
  };
};
