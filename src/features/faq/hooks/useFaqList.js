import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/shared/components/ui/use-toast";
import { useCategories } from "@/shared/hooks/categories/useCategories";
import { useFaqService } from "../services/faqService";

const PER_PAGE = 4;

export const useFaqList = () => {
  const { toast } = useToast();
  const { getFaqList, getFaqDetail, deleteFaq } = useFaqService();
  const { categories: rawCategories, loading: categoryLoading } = useCategories("faq");

  const [faqData, setFaqData] = useState([]);
  const [faqDetails, setFaqDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(1);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const isAdmin = userInfo?.roleStatus === true;

  const categories = useMemo(() => {
    const all = [{ key: "all", label: "전체" }];
    const mapped = rawCategories.map((cat) => ({
      key: cat.idx.toString(),
      label: cat.name,
    }));
    return [...all, ...mapped];
  }, [rawCategories]);

  const fetchFaqList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFaqList();
      setFaqData(data);
      setError(null);
    } catch (err) {
      setError("FAQ 데이터를 불러오는 데 실패했습니다.");
      setFaqData([]);
    } finally {
      setLoading(false);
    }
  }, [getFaqList]);

  useEffect(() => {
    fetchFaqList();
  }, [fetchFaqList]);

  const handleFaqClick = useCallback(async (faqIdx) => {
    if (openId === faqIdx) {
      setOpenId(null);
      return;
    }
    setOpenId(faqIdx);
    if (faqDetails[faqIdx]) return;
    try {
      setDetailLoading(true);
      const detail = await getFaqDetail(faqIdx);
      setFaqDetails((prev) => ({ ...prev, [faqIdx]: detail }));
    } catch (err) {
      // 상세 로드 실패 시 조용히 처리
    } finally {
      setDetailLoading(false);
    }
  }, [openId, faqDetails, getFaqDetail]);

  const handleCategoryChange = useCallback((key) => {
    setCategory(key);
    setPage(1);
    setOpenId(null);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDeleteFaq = useCallback(async (faqIdx) => {
    try {
      await deleteFaq(faqIdx);
      setFaqData((prev) => prev.filter((item) => item.faqIdx !== faqIdx));
      if (openId === faqIdx) setOpenId(null);
      toast({ title: "성공", description: "FAQ가 성공적으로 삭제되었습니다." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "FAQ 삭제에 실패했습니다. 다시 시도해주세요.",
      });
    }
  }, [deleteFaq, openId, toast]);

  const filtered = useMemo(() => {
    if (!Array.isArray(faqData)) return [];
    return faqData.filter((item) => {
      const matchesCategory =
        category === "all" || item.faqCategoryIdx?.toString() === category;
      const matchesSearch = item.faqTitle
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqData, category, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  const getFaqAnswer = (faqIdx) => {
    return faqDetails[faqIdx]?.faqAnswer ?? "답변을 불러오는 중...";
  };

  const getCategoryName = (faqItem) =>
    faqItem.faqCategoryName || faqItem.faqCategory || "미분류";

  return {
    categories,
    categoryLoading,
    loading,
    detailLoading,
    error,
    search,
    category,
    openId,
    page,
    paginated,
    totalPages,
    isAdmin,
    handleFaqClick,
    handleCategoryChange,
    handleSearchChange,
    handleDeleteFaq,
    setPage,
    getFaqAnswer,
    getCategoryName,
  };
};
