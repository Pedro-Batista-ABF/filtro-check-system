
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BasicFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function BasicFormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error = false,
  errorMessage,
  disabled = false,
  className = ""
}: BasicFormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor={id} 
        className={error ? "text-red-500" : ""}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
