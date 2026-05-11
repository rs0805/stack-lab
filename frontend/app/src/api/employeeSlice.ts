import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchEmployeesApi } from "./employeeService";
import type { Employee } from "../types/types";

const initialState = {
  search: "",
  filters: {
    skills: [] as string[],
    location: "",
    department: "",
    sort_by: "id" as "id" | "name" | "department" | "location",
    sort_order: "asc" as "asc" | "desc",
    page: 1,
    limit: 10,
  },
  employees: [] as Employee[],
  total: 0,
  loading: false,
  error: null as string | null,
};

export const fetchEmployees = createAsyncThunk(
  "employees/fetch",
  async (_, { getState }) => {
    const state = getState() as { employees: typeof initialState };
    const { search, filters } = state.employees;
    return fetchEmployeesApi({
      search: search || undefined,
      department: filters.department || undefined,
      location: filters.location || undefined,
      skills: filters.skills.length > 0 ? filters.skills : undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      page: filters.page,
      limit: filters.limit,
    });
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.filters.page = 1;
    },
    setDepartment(state, action: PayloadAction<string>) {
      state.filters.department = action.payload;
      state.filters.page = 1;
    },
    setLocation(state, action: PayloadAction<string>) {
      state.filters.location = action.payload;
      state.filters.page = 1;
    },
    toggleSkill(state, action: PayloadAction<string>) {
      const skill = action.payload;
      const idx = state.filters.skills.indexOf(skill);
      if (idx >= 0) {
        state.filters.skills.splice(idx, 1);
      } else {
        state.filters.skills.push(skill);
      }
      state.filters.page = 1;
    },
    setSort(state, action: PayloadAction<"id" | "name" | "department" | "location">) {
      const field = action.payload;
      if (state.filters.sort_by === field) {
        state.filters.sort_order = state.filters.sort_order === "asc" ? "desc" : "asc";
      } else {
        state.filters.sort_by = field;
        state.filters.sort_order = "asc";
      }
      state.filters.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    clearFilters(state) {
      state.search = "";
      state.filters.skills = [];
      state.filters.department = "";
      state.filters.location = "";
      state.filters.sort_by = "id";
      state.filters.sort_order = "asc";
      state.filters.page = 1;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.total = action.payload.total;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const { setSearch, setDepartment, setLocation, toggleSkill, setSort, setPage, clearFilters } = employeeSlice.actions;
export default employeeSlice.reducer;
