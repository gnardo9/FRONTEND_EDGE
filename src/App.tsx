import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import CompanyForm from './components/CompanyForm';
import WelcomePage from './components/WelcomePage';
import MachineDataPage from './components/MachineDataPage';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import HeaderUserForm from './components/HeaderUserForm';
import SuperUserForm from './components/SuperUserForm';
import SectionList from './components/SectionList';
import MachineList from './components/MachineList';
import AddSectionForm from './components/AddSectionForm';
import AddMachineForm from './components/AddMachineForm';
import StoppingReasonList from './components/StoppingReasonList';
import AddStoppingReasonForm from './components/AddStoppingReasonForm';
import TurnList from './components/TurnList'; // Import TurnList component
import AddTurnForm from './components/AddTurnForm'; // Import AddTurnForm component
import SettingsPage from './components/SettingsPage'; // Import SettingsPage component
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary component
import ProductionOrderList from './components/ProductionOrderList'; // Import ProductionOrderList
import DashboardPage from './components/DashboardPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.scss';

const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.clear();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <>{element}</> : <Navigate to="/login" state={{ from: location }} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <HeaderUserForm />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/cadastro-empresa" element={<CompanyForm />} />
        <Route path="/cadastro-usuario" element={<PrivateRoute element={<UserForm />} />} />
        <Route path="/users" element={<PrivateRoute element={<UserList />} />} />
        <Route path="/welcome" element={<PrivateRoute element={<WelcomePage />} />} />
        <Route path="/machine-data" element={<PrivateRoute element={<MachineDataPage />} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/register-superuser" element={<SuperUserForm />} />
        <Route path="/sections" element={<PrivateRoute element={<SectionList />} />} />
        <Route path="/add-section" element={<PrivateRoute element={<AddSectionForm />} />} />
        <Route path="/machines" element={<PrivateRoute element={<MachineList />} />} />
        <Route path="/add-machine" element={<PrivateRoute element={<AddMachineForm />} />} />
        <Route path="/stopping-reasons" element={<PrivateRoute element={<StoppingReasonList />} />} />
        <Route path="/add-stopping-reason" element={<PrivateRoute element={<AddStoppingReasonForm />} />} />
        <Route path="/turns" element={<PrivateRoute element={<TurnList />} />} /> {/* Add TurnList route */}
        <Route path="/add-turn" element={<PrivateRoute element={<AddTurnForm />} />} /> {/* Add AddTurnForm route */}
        <Route path="/settings" element={<PrivateRoute element={
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        } />} /> {/* Add SettingsPage route */}
        <Route path="/production-orders" element={<PrivateRoute element={<ErrorBoundary><ProductionOrderList /></ErrorBoundary>} />} /> {/* Add ProductionOrderList route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;




