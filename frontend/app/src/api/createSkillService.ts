import api from "./axiosInstance";

interface CreateSkillInput {
  name: string;
  category: "frontend" | "backend" | "database" | "cloud" | "other";
}

export const createSkillApi = async (data: CreateSkillInput) => {
  const { data: result } = await api.post("/skills", data);
  return result;
};
