import api from "./axiosInstance";

export const fetchLocationsApi = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/employees/locations");
  return data;
};
