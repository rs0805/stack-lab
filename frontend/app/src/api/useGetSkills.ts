import { useEffect, useState } from "react";
import { fetchSkillsApi } from "./skillService";
import type { SkillResponse } from "../types/types";

export const useGetSkills = () => {
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSkillsApi()
      .then((data) => setSkills(Array.isArray(data) ? data : []))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, []);
  return { skills, loading };
};
