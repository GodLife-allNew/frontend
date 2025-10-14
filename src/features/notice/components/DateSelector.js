import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

/** 📅 팝업 날짜 선택 공통 컴포넌트 */
const DateSelector = ({ label, date, onSelect, minDate }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : <span>날짜 선택</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={(d) => (minDate ? d < minDate : false)}
            initialFocus
            className="bg-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
