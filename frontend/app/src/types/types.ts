export interface SkillResponse {
  id: number;
  name: string;
  category: "frontend" | "backend" | "database" | "cloud" | "other";
}

export interface EmployeeSkillResponse {
  skill_id: number;
  proficiency: number; 
  skill: SkillResponse;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  location: string;
  skills: EmployeeSkillResponse[];
}

export interface EmployeeSearchParams {
  search?: string;
  skills?: string[];
  department?: string;
  location?: string;
  sort_by?: "id" | "name" | "department" | "location";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}