import { useApi } from "@/shared/hooks/useApi";

export const useFaqService = () => {
  const { get, post, patch, del, loading } = useApi();

  const getFaqList = async () => {
    const res = await get("/faq");
    const data = res.data;
    if (data?.message && Array.isArray(data.message)) return data.message;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getFaqDetail = async (faqIdx) => {
    const res = await get(`/faq/${faqIdx}`);
    return res.data?.message ?? res.data;
  };

  const createFaq = async (data) => {
    await post("/faq/admin/write", data);
  };

  const updateFaq = async (faqIdx, data) => {
    await patch(`/faq/admin/${faqIdx}`, data);
  };

  const deleteFaq = async (faqIdx) => {
    await del(`/faq/admin/${faqIdx}`);
  };

  return { getFaqList, getFaqDetail, createFaq, updateFaq, deleteFaq, loading };
};
