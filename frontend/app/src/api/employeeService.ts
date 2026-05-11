import api from "./axiosInstance";
import type {
  EmployeeListResponse,
  EmployeeSearchParams
} from "../types/types";

export const fetchEmployeesApi = async (
  params: EmployeeSearchParams
): Promise<EmployeeListResponse> => {
  const { skills, ...rest } = params;

  const filtered: Record<string, string | number> = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined) as [string, string | number][]
  );

  if (skills && skills.length > 0) {
    filtered.skills = skills.join(",");
  }

  const { data } = await api.get<EmployeeListResponse>("/employees", {
    params: filtered,
  });

  return data;
};

export const deleteEmployeeApi = async (employeeId: number): Promise<void> => {
  await api.delete(`/employees/${employeeId}`);
};