import { useState, useRef, useEffect } from "react";

interface SingleDropdownProps {
  label: string;
  options: string[];
  value?: string;
  multi?: false;
  onChange: (value: string | undefined) => void;
}

interface MultiDropdownProps {
  label: string;
  options: string[];
  value?: string[];
  multi: true;
  onChange: (value: string) => void;
}

type DropdownProps = SingleDropdownProps | MultiDropdownProps;

const Dropdown = (props: DropdownProps) => {
  const { label, options, multi } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelect = (option: string) => {
    if (multi) {
      (props as MultiDropdownProps).onChange(option);
    } else {
      const singleProps = props as SingleDropdownProps;
      singleProps.onChange(option === singleProps.value ? undefined : option);
      setOpen(false);
    }
  };
  const isSelected = (opt: string) => {
    if (multi) {
      return ((props as MultiDropdownProps).value ?? []).includes(opt);
    }
    return opt === (props as SingleDropdownProps).value;
  };
  const displayLabel = () => {
    if (multi) {
      const selected = (props as MultiDropdownProps).value ?? [];
      if (selected.length === 0) return label;
      if (selected.length === 1) return selected[0];
      return `${selected.length} selected`;
    }
    return (props as SingleDropdownProps).value || label;
  };
  return (
    <div className="relative flex-1 max-w-[160px]" ref={ref}>
      <button
        className="w-full flex items-center justify-between bg-white text-slate-800 border border-slate-700 py-1.5 px-3 text-xs font-bold cursor-pointer transition-colors duration-200 hover:bg-slate-50 h-[34px]"
        onClick={() => setOpen(!open)}
      >
        {displayLabel()} <span className="ml-2 text-slate-800">▾</span>
      </button>
      {open && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-700 list-none py-1 m-0 z-10 max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt}
              className={`py-1.5 px-3 text-slate-800 text-xs font-bold cursor-pointer hover:bg-slate-100 flex items-center gap-2 ${isSelected(opt) ? "bg-slate-100" : ""}`}
              onClick={() => handleSelect(opt)}
            >
              {multi && (
                <span className={`w-4 h-4 border-2 border-slate-700 rounded flex items-center justify-center text-xs ${isSelected(opt) ? "bg-slate-800 text-white" : ""}`}>
                  {isSelected(opt) ? "✓" : ""}
                </span>
              )}
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
