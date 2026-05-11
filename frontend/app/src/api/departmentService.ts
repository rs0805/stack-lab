import api from "./axiosInstance";

export const fetchDepartmentsApi = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/employees/departments");
  return data;
};
