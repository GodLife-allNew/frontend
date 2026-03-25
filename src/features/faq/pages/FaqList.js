import FaqListContent from "../components/FaqListContent";

export default function FaqList() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">FAQ</h1>
        <p className="text-muted-foreground mb-4">자주 묻는 질문들을 확인하세요</p>
        <FaqListContent isAdminMode={false} />
      </div>
    </div>
  );
}
