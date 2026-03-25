import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/components/ui/use-toast";
import { useCategories } from "@/shared/hooks/categories/useCategories";
import { faqSchema } from "../schemas/faqSchema";
import { useFaqService } from "../services/faqService";

export const useFaqEdit = (faqIdx) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getFaqDetail, createFaq, updateFaq } = useFaqService();
  const { categories: rawCategories, loading: categoryLoading } = useCategories("faq");

  const [isLoading, setIsLoading] = useState(!!faqIdx);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!faqIdx;

  const form = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: { faqTitle: "", faqAnswer: "", faqCategory: "" },
    mode: "onSubmit",
  });

  const categories = rawCategories.map((cat) => ({
    idx: cat.idx,
    name: cat.name,
  }));

  useEffect(() => {
    if (!faqIdx) return;
    const loadFaq = async () => {
      try {
        const data = await getFaqDetail(faqIdx);
        form.reset({
          faqTitle: data.faqTitle,
          faqAnswer: data.faqAnswer,
          faqCategory: data.faqCategory.toString(),
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "FAQ 데이터 불러오기 실패",
          description: "잠시 후 다시 시도해주세요.",
        });
        navigate("/adminBoard?tab=faq");
      } finally {
        setIsLoading(false);
      }
    };
    loadFaq();
  }, [faqIdx, getFaqDetail, form, toast, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        faqTitle: data.faqTitle,
        faqAnswer: data.faqAnswer,
        faqCategory: parseInt(data.faqCategory, 10),
      };
      if (isEditMode) {
        await updateFaq(faqIdx, submitData);
        toast({ title: "FAQ가 수정되었습니다", description: "FAQ 목록으로 이동합니다." });
      } else {
        await createFaq(submitData);
        toast({ title: "FAQ가 작성되었습니다", description: "FAQ 목록으로 이동합니다." });
      }
      navigate("/adminBoard?tab=faq");
    } catch (err) {
      toast({
        variant: "destructive",
        title: isEditMode ? "FAQ 수정 실패" : "FAQ 작성 실패",
        description: err.response?.data?.message || "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = () => {
    toast({
      variant: "destructive",
      title: "입력 오류",
      description: "모든 필수 항목을 올바르게 입력해주세요.",
    });
  };

  return {
    form,
    categories,
    categoryLoading,
    isLoading,
    isSubmitting,
    isEditMode,
    onSubmit,
    handleValidationError,
  };
};
