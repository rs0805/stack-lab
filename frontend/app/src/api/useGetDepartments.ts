import { useEffect, useState } from "react";
import { fetchDepartmentsApi } from "./departmentService";

export const useGetDepartments = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDepartmentsApi()
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);
  return { departments, loading };
};
