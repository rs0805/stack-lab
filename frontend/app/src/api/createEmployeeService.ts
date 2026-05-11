import api from "./axiosInstance";

interface EmployeeSkillInput {
  skill_id: number;
  proficiency: number;
}

interface CreateEmployeeInput {
  name: string;
  email: string;
  department: string;
  location: string;
  skills?: EmployeeSkillInput[];
}

export const createEmployeeApi = async (data: CreateEmployeeInput) => {
  const { data: result } = await api.post("/employees", data);
  return result;
};
