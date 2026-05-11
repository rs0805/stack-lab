import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../helpers/hooks";
import { setSearch } from "../api/employeeSlice";

const DEBOUNCE_DELAY = 350;

const SearchBar = () => {
  const dispatch = useAppDispatch();
  const storedSearch = useAppSelector((s) => s.employees.search);
  const [localValue, setLocalValue] = useState(storedSearch);
  const [prevStoredSearch, setPrevStoredSearch] = useState(storedSearch);
  if (storedSearch !== prevStoredSearch) {
    setPrevStoredSearch(storedSearch);
    setLocalValue(storedSearch);
  }
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      dispatch(setSearch(value));
    }, DEBOUNCE_DELAY);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return (
    <div className="flex items-center gap-2 bg-white px-3 border border-slate-700 w-full max-w-[250px] h-[34px]">
      <svg
        className="text-slate-800 shrink-0"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search by name or email"
        className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm font-medium placeholder:text-gray-400"
      />
    </div>
  );
};
export default SearchBar;