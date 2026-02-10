import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LoanApplications from './components/LoanApplications'
import NewApplication from './components/NewApplication'
import Analytics from './components/Analytics'

function App() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'applications':
        return <LoanApplications />
      case 'new-application':
        return <NewApplication />
      case 'analytics':
        return <Analytics />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
