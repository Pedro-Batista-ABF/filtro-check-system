
import { Service } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ServiceCheckboxProps {
  service: Service;
  onChange: (id: string, checked: boolean) => void;
  isCompleted?: boolean;
  completedCheckboxId?: string;
}

export default function ServiceCheckbox({ 
  service, 
  onChange, 
  isCompleted,
  completedCheckboxId
}: ServiceCheckboxProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox 
        id={completedCheckboxId || service.id}
        checked={isCompleted !== undefined ? isCompleted : service.selected}
        onCheckedChange={(checked) => onChange(service.id, checked === true)}
      />
      <div className="space-y-1 flex-1">
        <Label 
          htmlFor={completedCheckboxId || service.id} 
          className="text-sm font-medium leading-none cursor-pointer"
        >
          {service.name}
          {service.quantity ? ` (${service.quantity})` : ''}
        </Label>
      </div>
    </div>
  );
}
