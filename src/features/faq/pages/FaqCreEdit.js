import { useParams, useNavigate } from "react-router-dom";
import { useFaqEdit } from "../hooks/useFaqEdit";
import FaqForm from "../components/FaqForm";

export default function FaqCreEdit() {
  const { faqIdx } = useParams();
  const navigate = useNavigate();
  const {
    form,
    categories,
    categoryLoading,
    isLoading,
    isSubmitting,
    isEditMode,
    onSubmit,
    handleValidationError,
  } = useFaqEdit(faqIdx);

  if (isLoading || categoryLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <FaqForm
      form={form}
      categories={categories}
      onSubmit={onSubmit}
      handleValidationError={handleValidationError}
      isSubmitting={isSubmitting}
      isEditMode={isEditMode}
      onCancel={() => navigate("/adminBoard?tab=faq")}
    />
  );
}
