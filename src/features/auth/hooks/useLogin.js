import { useApi } from "@/shared/hooks/useApi";
import { useAuth } from "@/shared/context/AuthContext";

export const useLogin = () => {
  const { post, loading, error } = useApi();
  const { login } = useAuth();

  const handleLogin = async (formData) => {
    try {
      const response = await post("/user/login", formData);

      const data = response.data;
      
      // 응답에서 토큰 추출
      const accessToken =
        response.headers?.authorization?.startsWith("Bearer ")
          ? response.headers.authorization.substring(7)
          : null;


      // AuthContext에 로그인 처리
      login(data, accessToken);

      return data;
    } catch (err) {
      throw err;
    }
  };

  return { handleLogin, loading, error };
};
