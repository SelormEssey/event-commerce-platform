import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  children: ReactNode;
};

export function SelectField({
  id,
  label,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className="select-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {children}
      </select>
    </div>
  );
}
