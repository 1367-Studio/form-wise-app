"use client";

import PhoneInput from "react-phone-number-input";
import franceLabels from "react-phone-number-input/locale/fr";
import "react-phone-number-input/style.css";

interface Props {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function PhoneInputField({ value, onChange, placeholder }: Props) {
  return (
    <PhoneInput
      labels={franceLabels}
      international
      defaultCountry="FR"
      countryCallingCodeEditable={false}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  );
}
