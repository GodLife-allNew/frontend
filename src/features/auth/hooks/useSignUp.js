// 📁 src/hooks/useSignUp.js
import { useState } from "react";
import axiosInstance from "@/shared/api/axiosInstance";
import { useToast } from "@/shared/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useSignUp = ({
  form,
  refs = {},
  isEmailVerified,
  isIdValid,
}) => {

  if (!form) {
    throw new Error("useSignUp 훅에 form을 반드시 전달해야 합니다.");
  }

  const {
    userIdInputRef,
    userPwInputRef,
    userPwConfirmInputRef,
    userNameInputRef,
    userNickInputRef,
    userEmailInputRef,
    jobIdxInputRef,
    targetIdxInputRef,
    userPhoneInputRef,
    userGenderInputRef,
  } = refs;

  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    const { userPwConfirm, verificationCode, ...apiData } = data;

    // 문자열 → 숫자 변환
    const submitData = {
      ...apiData,
      userGender: parseInt(data.userGender, 10),
      jobIdx: parseInt(data.jobIdx || "0", 10),
      targetIdx: parseInt(data.targetIdx || "0", 10),
    };

    console.log("회원가입 버튼 클릭, 전달 데이터:", submitData);

    // 이메일 인증 체크
    if (!isEmailVerified) {
      toast({
        variant: "destructive",
        title: "이메일 인증 필요",
        description: "이메일 인증을 완료해주세요.",
      });
      return;
    }

    // 아이디 중복 확인 체크
    if (!isIdValid) {
      toast({
        variant: "destructive",
        title: "아이디 확인 필요",
        description: "아이디 중복 확인을 완료해주세요.",
      });
      userIdInputRef?.current?.focus();
      return;
    }

    // 비밀번호 일치 확인
    if (data.userPw !== data.userPwConfirm) {
      toast({
        variant: "destructive",
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
      });
      userPwConfirmInputRef?.current?.focus();
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await axiosInstance.post(`/user/join`, submitData);
      console.log("회원가입 응답:", response.data);

      if (response.data.success === false) {
        const message = response.data.message || "회원가입에 실패했습니다.";
        setServerError(message);
        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: message,
        });
      } else {
        toast({
          title: "회원가입 성공",
          description: "로그인 페이지로 이동합니다.",
        });
        navigate("/user/login");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);

      let errorMessage = "회원가입 처리 중 오류가 발생했습니다.";
      let errorField = "";

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else {
          for (const key in data) {
            if (data[key]) {
              errorMessage = data[key];
              errorField = key;
              break;
            }
          }
        }
      }

      setServerError(errorMessage);
      toast({
        variant: "destructive",
        title: "회원가입 실패",
        description: errorMessage,
      });

      // 에러 필드에 포커스
      setTimeout(() => {
        switch (errorField) {
          case "userId":
            userIdInputRef?.current?.focus();
            break;
          case "userPw":
            userPwInputRef?.current?.focus();
            break;
          case "userPwConfirm":
            userPwConfirmInputRef?.current?.focus();
            break;
          case "userName":
            userNameInputRef?.current?.focus();
            break;
          case "userNick":
            userNickInputRef?.current?.focus();
            break;
          case "userEmail":
            userEmailInputRef?.current?.focus();
            break;
          case "jobIdx":
            jobIdxInputRef?.current?.focus();
            break;
          case "targetIdx":
            targetIdxInputRef?.current?.focus();
            break;
          case "userPhone":
            userPhoneInputRef?.current?.focus();
            break;
          case "userGender":
            userGenderInputRef?.current?.focus();
            break;
          default:
            break;
        }
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  return { loading, serverError, onSubmit };
};
