import React, { useEffect } from "react";
import {
  useFieldArray,
  useFormState,
  useFormContext,
  Controller,
} from "react-hook-form";
import {
  Plus,
  Trash2,
  AlarmClock,
  FileText,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import StarRating from "@/components/common/starRating/StarRating";
import ActivitiesTimeline from "./ActivitiesTimeline";

function ActivitiesSection({
  control,
  readOnly = false,
  isActive = false,
  certifiedActivities = {},
  onCertifyActivity = null,
  routineData = null,
  isEditMode = false,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  const { getValues, register } = useFormContext();

  const formState = useFormState({ control });

  // 새 활동 추가
  const addActivity = () => {
    const activities = getValues("activities");
    let newStartTime = "09:00";

    if (activities.length > 0) {
      const lastActivity = activities[activities.length - 1];
      if (lastActivity.setTime) {
        const [hour, minute] = lastActivity.setTime.split(":").map(Number);
        const newDate = new Date();
        newDate.setHours(hour);
        newDate.setMinutes(minute + 30);

        const newHour = String(newDate.getHours()).padStart(2, "0");
        const newMinute = String(newDate.getMinutes()).padStart(2, "0");
        newStartTime = `${newHour}:${newMinute}`;
      }
    }

    append({
      activityIdx: 0, // 새 활동은 0
      activityName: "",
      setTime: newStartTime,
      description: "",
      activityImp: 3,
      verified: false,
    });
  };

  useEffect(() => {
    console.log("useFieldArray fields:", fields);
    console.log(
      "fields with activityIdx:",
      fields.map((f) => ({
        id: f.id,
        activityIdx: f.activityIdx,
        activityName: f.activityName,
      }))
    );
    const formValues = getValues("activities");
    console.log("현재 폼의 activities 값:", formValues);
    console.log(
      "각 activity의 activityIdx:",
      formValues?.map((a) => a.activityIdx)
    );
  }, [fields]);

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={addActivity}
            className="flex items-center gap-1 bg-blue-500"
          >
            <Plus className="h-4 w-4" />새 활동 추가
          </Button>
        </div>
      )}

      {formState.errors.activities && (
        <div className="text-red-500 text-sm mt-2">
          {formState.errors.activities.message}
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-lg bg-muted/50">
          <AlarmClock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {readOnly
              ? "등록된 활동이 없습니다"
              : "활동을 추가하여 루틴을 만들어보세요"}
          </p>
        </div>
      )}

      {(routineData?.isWriter === 1 || routineData == null) &&
        !readOnly &&
        fields.map((field, index) => (
          <Card key={field.id} className="p-4 relative">
            {/* ✅ FormField로 activityIdx 등록 */}
            <FormField
              control={control}
              name={`activities.${index}.activityIdx`}
              defaultValue={field.activityIdx ?? 0}
              render={({ field: fieldProps }) => (
                <input type="hidden" {...fieldProps} />
              )}
            />

            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">{index + 1}번 활동</Badge>

                {isActive && (field.verified || certifiedActivities[index]) && (
                  <Badge className="bg-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    인증 완료
                  </Badge>
                )}
              </div>

              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* 활동 이름 */}
              <FormField
                control={control}
                name={`activities.${index}.activityName`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>활동 이름</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 아침 운동, 독서 등"
                        {...field}
                        disabled={readOnly}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 시작 시간 */}
              <FormField
                control={control}
                name={`activities.${index}.setTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작 시간</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="HH:MM"
                        {...field}
                        disabled={readOnly}
                        readOnly={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 중요도 표시 */}
              <FormField
                control={control}
                name={`activities.${index}.activityImp`}
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      중요도
                    </FormLabel>
                    <FormControl>
                      <div className="pt-1">
                        <StarRating
                          control={control}
                          name={`activities.${index}.activityImp`}
                          maxRating={5}
                          required={true}
                          readOnly={readOnly}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 한줄 메모 필드 */}
            <FormField
              control={control}
              name={`activities.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    한줄 메모
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="활동에 대한 간단한 메모를 남겨보세요"
                      {...field}
                      disabled={readOnly}
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}

      {/* 타임라인 미리보기 */}
      {fields.length > 0 && (
        <>
          <Separator className="my-4" />
          <ActivitiesTimeline
            control={control}
            certifiedActivities={certifiedActivities}
            isActive={isActive}
            onCertifyActivity={onCertifyActivity}
            isEditMode={isEditMode}
            routineData={routineData}
          />
        </>
      )}
    </div>
  );
}

export default ActivitiesSection;
