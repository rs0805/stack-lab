import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './helpers/hooks'
import { fetchEmployees, setDepartment, setLocation, toggleSkill, clearFilters } from './api/employeeSlice'
import { useGetDepartments } from './api/useGetDepartments'
import { useGetLocations } from './api/useGetLocations'
import { useGetSkills } from './api/useGetSkills'
import SearchBar from './components/SearchBar'
import EmployeeList from './components/EmployeeList'
import Dropdown from './components/Dropdown'
import Modal from './components/Modal'
import AddForm from './components/AddForm'
import LandingPage from './components/LandingPage'
import './App.css'


function App() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.employees.search);
  const filters = useAppSelector((s) => s.employees.filters);
  const { departments } = useGetDepartments();
  const { locations } = useGetLocations();
  const { skills } = useGetSkills();
  const [showLanding, setShowLanding] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [search, filters.department, filters.location, filters.skills, filters.sort_by, filters.sort_order, filters.page, dispatch]);

  useEffect(() => {
    if (!showAdded) return;
    const timer = setTimeout(() => setShowAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [showAdded]);

  const handleFormSuccess = () => {
    setShowModal(false);
    setShowAdded(true);
    dispatch(fetchEmployees());
  };

  return (
    <div className="page">
      {showLanding && <LandingPage onEnter={() => setShowLanding(false)} />}
      <div className="flex items-end justify-between w-full max-w-[960px] mt-2 gap-3 flex-wrap">
        <div className="flex gap-3 flex-wrap flex-1">
          <Dropdown
            label="Department"
            options={departments}
            value={filters.department || undefined}
            onChange={(val) => dispatch(setDepartment(val ?? ""))}
          />
          <Dropdown
            label="Location"
            options={locations}
            value={filters.location || undefined}
            onChange={(val) => dispatch(setLocation(val ?? ""))}
          />
          <Dropdown
            label="Skill"
            options={(skills ?? []).map((s) => s.name)}
            value={filters.skills}
            multi
            onChange={(val) => dispatch(toggleSkill(val))}
          />
        </div>
        <SearchBar />
      </div>

      <EmployeeList
        onAdd={() => setShowModal(true)}
        onClear={() => dispatch(clearFilters())}
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <AddForm onSuccess={handleFormSuccess} />
        </Modal>
      )}

      {showAdded && (
        <div className="toast bg-slate-800 text-white">
          Employee Added Successfully!
        </div>
      )}
    </div>
  );
}

export default App;
