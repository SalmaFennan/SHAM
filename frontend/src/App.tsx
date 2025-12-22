import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MembersModule } from './components/MembersModule';
import { EmployeesModule } from './components/EmployeesModule';
import { AttendanceModule } from './components/AttendanceModule';
import { ClassesModule } from './components/ClassesModule';
import { FinanceModule } from './components/FinanceModule';
import { ShopModule } from './components/ShopModule';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <MembersModule />;
      case 'employees':
        return <EmployeesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'classes':
        return <ClassesModule />;
      case 'finance':
        return <FinanceModule />;
      case 'shop':
        return <ShopModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 overflow-y-auto">
        {renderActiveModule()}
      </main>
    </div>
  );
}

export default App;