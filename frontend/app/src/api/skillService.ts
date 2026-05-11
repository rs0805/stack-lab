import api from "./axiosInstance";
import type { SkillResponse } from "../types/types";

export const fetchSkillsApi = async (): Promise<SkillResponse[]> => {
  const { data } = await api.get<SkillResponse[]>("/skills");
  return data;
};
