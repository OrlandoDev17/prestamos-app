import type { LucideIcon } from "lucide-react";

export interface InputProps {
  label: string,
  placeholder: string;
  name: string;
  type: 'text' | 'password' | 'email' | 'number';
  value?: string;
  icon: LucideIcon;
}

export function Input({ label, placeholder, name, type, value, icon: Icon }: InputProps) {
  return (
    <label className='flex flex-col gap-1 relative'>
      <h4>{label}</h4>
      <input className='pl-10 pr-5 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-lg' type={type} name={name} value={value} placeholder={placeholder} />
      <Icon className='absolute left-4 top-1/2 translate-y-1/4 size-5 text-text-muted' />
    </label>
  )
}