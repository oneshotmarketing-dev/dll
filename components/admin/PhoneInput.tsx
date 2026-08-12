"use client";

import { useState } from "react";
import { COUNTRY_CODES } from "@/lib/countryCodes";

// Unique dial codes, longest first, for splitting a stored number back into its
// country code + national digits. Country calling codes are prefix-free, so the
// first startsWith match is always the right one; longest-first is belt-and-braces.
const DIAL_CODES = [...new Set(COUNTRY_CODES.map((c) => c.code))].sort((a, b) => b.length - a.length);

// Split a stored E.164 string into a known dial code + national digits. Tolerates
// legacy values that had a space (e.g. "+91 98765 43210") by stripping non-digits.
function split(e164: string | null): { code: string; digits: string } {
  const v = (e164 ?? "").trim().replace(/\s+/g, "");
  const code = DIAL_CODES.find((c) => v.startsWith(c)) ?? "+91";
  return { code, digits: v.startsWith(code) ? v.slice(code.length).replace(/\D/g, "") : v.replace(/\D/g, "") };
}

// Controlled WhatsApp field: country select (full list) + digits-only input.
// Emits E.164 (e.g. "+919876543210") or "" when empty. The single shared phone
// control across add/edit user AND the student profile, so the same number the
// admin enters round-trips correctly to the student's profile.
export function PhoneInput({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (e164: string) => void;
  className?: string;
}) {
  const init = split(value);
  const [code, setCode] = useState(init.code);
  const [digits, setDigits] = useState(init.digits);

  function emit(nextCode: string, nextDigits: string) {
    onChange(nextDigits ? `${nextCode}${nextDigits}` : "");
  }

  return (
    <div className="flex gap-2">
      <select
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          emit(e.target.value, digits);
        }}
        aria-label="Country code"
        className={`w-40 shrink-0 rounded-input border border-hairline bg-canvas px-3 text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold ${className ?? ""}`}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.name} value={c.code}>{c.name} ({c.code})</option>
        ))}
      </select>
      <input
        value={digits}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, 15);
          setDigits(d);
          emit(code, d);
        }}
        inputMode="numeric"
        placeholder="9876543210"
        className={`flex-1 rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold ${className ?? ""}`}
      />
    </div>
  );
}

// Valid if empty (optional) or a "+" code followed by 6–15 national digits.
export function isValidPhone(e164: string): boolean {
  if (!e164) return true;
  return /^\+\d{1,4}\d{6,15}$/.test(e164);
}
