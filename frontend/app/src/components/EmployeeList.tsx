import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../helpers/hooks";
import { fetchEmployees, setPage, setSort } from "../api/employeeSlice";
import { deleteEmployeeApi } from "../api/employeeService";
import type { Employee, EmployeeSkillResponse } from "../types/types";
import ErrorBox from "./ErrorBox";

type SortField = "id" | "name" | "department" | "location";

const SORTABLE_HEADERS: Record<string, SortField | null> = {
  "ID": "id",
  "Name": "name",
  "Email": null,
  "Department": "department",
  "Location": "location",
  "Skills": null,
};

const HEADERS = Object.keys(SORTABLE_HEADERS);

const Stars = ({ count }: { count: number }) => (
  <span className="text-slate-500 text-xs tracking-wide">{"★".repeat(count)}</span>
);
const gridCols = "grid grid-cols-[0.4fr_1fr_1.6fr_0.9fr_0.9fr_1.2fr_auto]"
const SkillsCell = ({ skills }: { skills: EmployeeSkillResponse[] }) => {
  const [hovered, setHovered] = useState(false);
  if (skills.length === 0) {
    return <span className="text-[13px] text-gray-400">—</span>;
  }
  const first = skills[0].skill.name;
  const remaining = skills.length - 1;
  return (
    <span
      className="relative text-[13px] text-gray-800 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {first}{remaining > 0 && <span className="text-slate-500 ml-1">(+{remaining})</span>}
      {hovered && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-700 shadow-md z-20 py-2 px-3 min-w-[140px]">
          {skills.map((s) => (
            <div key={s.skill_id} className="flex items-center justify-between gap-3 py-0.5 text-[12px] text-slate-800">
              <span>{s.skill.name}</span>
              <Stars count={s.proficiency} />
            </div>
          ))}
        </div>
      )}
    </span>
  );
};

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-transparent border-none cursor-pointer p-0.5 text-slate-400 hover:text-red-600 transition-colors"
    title="Delete employee"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  </button>
);

const EmployeeCard = ({ emp, onDelete }: { emp: Employee; onDelete: () => void }) => (
  <div className="border border-slate-700 p-3 flex flex-col gap-1">
    <div className="flex justify-between items-baseline">
      <span className="text-slate-800 font-bold text-sm">{emp.name}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs">#{emp.id}</span>
        <DeleteButton onClick={onDelete} />
      </div>
    </div>
    <span className="text-[13px] text-gray-800 break-all">{emp.email}</span>
    <div className="flex gap-3 text-[13px] text-gray-800">
      <span>{emp.department}</span>
      <span>·</span>
      <span>{emp.location}</span>
    </div>
    {(emp.skills ?? []).length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-1">
        {(emp.skills ?? []).map((s: EmployeeSkillResponse) => (
          <span key={s.skill_id} className="text-[12px] text-slate-700 bg-slate-50 border border-slate-300 px-2 py-0.5">
            {s.skill.name} <Stars count={s.proficiency} />
          </span>
        ))}
      </div>
    ) : (
      <span className="text-[12px] text-gray-400 mt-1">No skills</span>
    )}
  </div>
);

interface EmployeeListProps {
  onAdd: () => void;
  onClear: () => void;
}

const EmployeeList = ({ onAdd, onClear }: EmployeeListProps) => {
  const dispatch = useAppDispatch();
  const { employees, loading, total, filters, error } = useAppSelector((s) => s.employees);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    if (!showDeleted) return;
    const timer = setTimeout(() => setShowDeleted(false), 1500);
    return () => clearTimeout(timer);
  }, [showDeleted]);

  const handleDelete = async (id: number) => {
    if (deleting) return;
    setDeleting(id);
    try {
      await deleteEmployeeApi(id);
      dispatch(fetchEmployees());
      setShowDeleted(true);
    } catch {
      // silently fail — row stays visible
    } finally {
      setDeleting(null);
    }
  };
  const totalPages = Math.ceil(total / filters.limit);
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  return (
    <div className="w-full max-w-[960px] mt-6">
      <div className="hidden md:flex justify-end mb-1">
        <span className="text-slate-500 text-sm">Total: {total}</span>
      </div>

      <div className={`${gridCols} py-2.5 border-b-2 border-slate-700 hidden md:grid items-center`}>
        {HEADERS.map((h) => {
          const sortField = SORTABLE_HEADERS[h];
          const isActive = sortField && filters.sort_by === sortField;
          const isAsc = isActive && filters.sort_order === "asc";
          const isDesc = isActive && filters.sort_order === "desc";

          return sortField ? (
            <span
              key={h}
              className="text-slate-800 font-bold text-sm cursor-pointer select-none"
              onClick={() => dispatch(setSort(sortField))}
            >
              {h} {isAsc ? "▲" : isDesc ? "▼" : "⇅"}
            </span>
          ) : (
            <span key={h} className="text-slate-800 font-bold text-sm">{h}</span>
          );
        })}
        <span />
      </div>

      <div className="flex md:hidden gap-2 flex-wrap mb-3">
        {HEADERS.filter((h) => SORTABLE_HEADERS[h]).map((h) => {
          const sortField = SORTABLE_HEADERS[h]!;
          const isActive = filters.sort_by === sortField;
          const isAsc = isActive && filters.sort_order === "asc";
          const isDesc = isActive && filters.sort_order === "desc";
          return (
            <button
              key={h}
              className={`text-xs font-bold px-2 py-1 border cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-800 border-slate-700"
              }`}
              onClick={() => dispatch(setSort(sortField))}
            >
              {h} {isAsc ? "▲" : isDesc ? "▼" : "⇅"}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="flex gap-1.5 spinner-dots" />
        </div>
      ) : error ? (
        <div className="flex justify-center py-6">
          <ErrorBox message={error} />
        </div>
      ) : employees.length === 0 ? (
        <div className="flex justify-center py-6">
          <ErrorBox message="No results found" />
        </div>
      ) : (
        <>
          <div className="hidden md:flex flex-col">
            {employees.map((emp) => (
              <div key={emp.id} className={`${gridCols} py-2 border-b border-slate-300 items-center`}>
                <span className="text-[13px] text-gray-800">{emp.id}</span>
                <span className="text-[13px] text-gray-800">{emp.name}</span>
                <span className="text-[13px] text-gray-800">{emp.email}</span>
                <span className="text-[13px] text-gray-800">{emp.department}</span>
                <span className="text-[13px] text-gray-800">{emp.location}</span>
                <SkillsCell skills={emp.skills ?? []} />
                <span className={deleting === emp.id ? "opacity-50" : ""}>
                  <DeleteButton onClick={() => handleDelete(emp.id)} />
                </span>
              </div>
            ))}
          </div>

          <div className="flex md:hidden flex-col gap-3">
            {employees.map((emp) => (
              <EmployeeCard key={emp.id} emp={emp} onDelete={() => handleDelete(emp.id)} />
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-5 pb-5">
        <button
          className="bg-slate-800 text-white border border-slate-700 py-1.5 px-5 text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-slate-700"
          onClick={onAdd}
        >
          Add
        </button>

        {totalPages > 0 && (
          <div className="flex items-center gap-4">
            <button
              className={`bg-transparent border-none text-lg cursor-pointer ${canPrev ? 'text-slate-800' : 'text-gray-300 cursor-default'}`}
              disabled={!canPrev}
              onClick={() => dispatch(setPage(filters.page - 1))}
            >
              ◀
            </button>
            <span className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {filters.page}
            </span>
            <button
              className={`bg-transparent border-none text-lg cursor-pointer ${canNext ? 'text-slate-800' : 'text-gray-300 cursor-default'}`}
              disabled={!canNext}
              onClick={() => dispatch(setPage(filters.page + 1))}
            >
              ▶
            </button>
          </div>
        )}

        <button
          className="bg-slate-800 text-white border border-slate-700 py-1.5 px-5 text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-slate-700"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      {showDeleted && (
        <div className="toast bg-slate-800 text-white">
          Employee Deleted Successfully!
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
