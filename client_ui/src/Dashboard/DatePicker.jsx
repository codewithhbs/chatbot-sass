import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ServiceDatePicker({ editForm, setEditForm }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="serviceDate" className="text-right">
        Service Date
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full col-span-3 justify-start text-left font-normal",
              !editForm.serviceDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {editForm.serviceDate
              ? format(new Date(editForm.serviceDate), "EEEE, MMMM d, yyyy")
              : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={editForm.serviceDate ? new Date(editForm.serviceDate) : undefined}
            onSelect={(date) =>
              setEditForm({
                ...editForm,
                serviceDate: date ? format(date, "yyyy-MM-dd") : ""
              })
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
