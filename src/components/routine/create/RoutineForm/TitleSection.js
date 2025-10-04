import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

export default function TitleSection({ control, required, readOnly }) {
  return (
    <FormField
      control={control}
      name="planTitle"
      rules={{ required: required ? "제목을 입력해주세요" : false }}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              placeholder="루틴 제목을 입력하세요"
              {...field}
              disabled={readOnly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
