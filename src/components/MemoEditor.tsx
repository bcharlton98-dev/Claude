import { useState, useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (memo: string) => void;
  placeholder?: string;
}

export default function MemoEditor({ value, onChange, placeholder = 'Add a memo...' }: Props) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  function handleChange(newVal: string) {
    setLocal(newVal);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(newVal), 400);
  }

  return (
    <textarea
      value={local}
      onChange={e => handleChange(e.target.value)}
      onBlur={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (local !== value) onChange(local);
      }}
      placeholder={placeholder}
      rows={3}
      className="w-full text-sm border border-warm-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 resize-y placeholder:text-warm-400"
    />
  );
}
