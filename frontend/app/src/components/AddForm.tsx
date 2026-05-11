import { useState, useRef, useEffect } from "react";
import { createEmployeeApi } from "../api/createEmployeeService";
import { useGetSkills } from "../api/useGetSkills";
import { useGetDepartments } from "../api/useGetDepartments";
import type { SkillResponse } from "../types/types";

interface AddFormProps {
  onSuccess: () => void;
}

interface SkillEntry {
  skill_id: number;
  proficiency: number;
}

interface FormDraft {
  name: string;
  email: string;
  department: string;
  location: string;
  selectedSkills: SkillEntry[];
}

const emptyDraft: FormDraft = {
  name: "",
  email: "",
  department: "",
  location: "",
  selectedSkills: [],
};

let cachedDraft: FormDraft = { ...emptyDraft };

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-sm leading-none cursor-pointer bg-transparent border-none p-0 ${
          star <= value ? "text-slate-800" : "text-slate-300"
        }`}
      >
        ★
      </button>
    ))}
  </span>
);

const SkillCheckbox = ({
  skill,
  selected,
  proficiency,
  onToggle,
  onProficiency,
}: {
  skill: SkillResponse;
  selected: boolean;
  proficiency: number;
  onToggle: () => void;
  onProficiency: (v: number) => void;
}) => (
  <div
    className={`flex items-center justify-between gap-2 py-1.5 px-2 cursor-pointer hover:bg-slate-50 ${
      selected ? "bg-slate-50" : ""
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center gap-2">
      <span
        className={`w-4 h-4 border-2 border-slate-700 rounded flex items-center justify-center text-xs shrink-0 ${
          selected ? "bg-slate-800 text-white" : ""
        }`}
      >
        {selected ? "✓" : ""}
      </span>
      <span className="text-sm text-slate-800">{skill.name}</span>
    </div>
    {selected && (
      <span onClick={(e) => e.stopPropagation()}>
        <StarRating value={proficiency} onChange={onProficiency} />
      </span>
    )}
  </div>
);

const AddForm = ({ onSuccess }: AddFormProps) => {
  const [name, setName] = useState(cachedDraft.name);
  const [email, setEmail] = useState(cachedDraft.email);
  const [department, setDepartment] = useState(cachedDraft.department);
  const [location, setLocation] = useState(cachedDraft.location);
  const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>(
    cachedDraft.selectedSkills
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  const { skills: availableSkills } = useGetSkills();
  const { departments } = useGetDepartments();

  const draftRef = useRef<FormDraft>(cachedDraft);
  useEffect(() => {
    draftRef.current = { name, email, department, location, selectedSkills };
  }, [name, email, department, location, selectedSkills]);

  useEffect(() => {
    return () => {
      cachedDraft = draftRef.current;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(e.target as Node)
      ) {
        setSkillDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearForm = () => {
    setName("");
    setEmail("");
    setDepartment("");
    setLocation("");
    setSelectedSkills([]);
    cachedDraft = { ...emptyDraft };
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skill_id === skillId);
      if (exists) return prev.filter((s) => s.skill_id !== skillId);
      return [...prev, { skill_id: skillId, proficiency: 3 }];
    });
  };

  const updateProficiency = (skillId: number, value: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) =>
        s.skill_id === skillId ? { ...s, proficiency: value } : s
      )
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim() || !email.trim() || !department.trim()) {
      setError("Please fill in all required fields (Name, Email, Department).");
      return;
    }

    const ids = selectedSkills.map((s) => s.skill_id);
    if (ids.length !== new Set(ids).size) {
      setError("Duplicate skills are not allowed.");
      return;
    }

    setLoading(true);
    try {
      await createEmployeeApi({
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        location: location.trim() || "",
        skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      });
      clearForm();
      onSuccess();
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string | { msg: string }[] } } };
        const status = axiosErr.response?.status;
        const detail = axiosErr.response?.data?.detail;

        if (status === 422) {
          if (Array.isArray(detail)) {
            setError(detail.map((d) => d.msg).join(", "));
          } else if (typeof detail === "string") {
            setError(detail);
          } else {
            setError("Validation error. Please check your input.");
          }
        } else if (status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Failed to add employee. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const skillSummary =
    selectedSkills.length === 0
      ? "Select skills"
      : `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} selected`;

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-slate-800 font-bold text-base text-center">
        Add Employee
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-600 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          className="w-full border-2 border-slate-700 p-2 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full border-2 border-slate-700 p-2 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800">
          Department
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full border-2 border-slate-700 p-2 text-sm outline-none focus:border-slate-900 bg-white"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location (optional)"
          className="w-full border-2 border-slate-700 p-2 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-800">Skills</label>
        <div className="relative" ref={skillDropdownRef}>
          <button
            type="button"
            onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
            className="w-full flex items-center justify-between border-2 border-slate-700 p-2 text-sm bg-white cursor-pointer hover:bg-slate-50"
          >
            <span
              className={
                selectedSkills.length === 0
                  ? "text-gray-400"
                  : "text-slate-800"
              }
            >
              {skillSummary}
            </span>
            <span className="text-slate-800 ml-2">▾</span>
          </button>
          {skillDropdownOpen && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border-2 border-slate-700 z-10 max-h-[200px] overflow-y-auto">
              {availableSkills.map((skill) => {
                const entry = selectedSkills.find(
                  (s) => s.skill_id === skill.id
                );
                return (
                  <SkillCheckbox
                    key={skill.id}
                    skill={skill}
                    selected={!!entry}
                    proficiency={entry?.proficiency ?? 3}
                    onToggle={() => toggleSkill(skill.id)}
                    onProficiency={(v) => updateProficiency(skill.id, v)}
                  />
                );
              })}
              {availableSkills.length === 0 && (
                <div className="py-2 px-3 text-sm text-gray-400">
                  No skills available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-slate-800 text-white border border-slate-700 py-2.5 px-5 text-sm font-semibold cursor-pointer hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {loading ? "Adding..." : "Add Employee"}
      </button>
    </div>
  );
};

export default AddForm;
