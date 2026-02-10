import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LoanApplications from './components/LoanApplications'
import NewApplication from './components/NewApplication'
import Analytics from './components/Analytics'
import ProjectFinancingDashboard from './components/ProjectFinancingDashboard'
import ProjectFinancingList from './components/ProjectFinancingList'
import ProjectFinancingDetail from './components/ProjectFinancingDetail'

function App() {
  const [activeView, setActiveView] = useState('project-financing-dashboard')
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)

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
      case 'project-financing-dashboard':
        return <ProjectFinancingDashboard />
      case 'project-financing-list':
        return (
          <ProjectFinancingList 
            onViewDetail={(id) => {
              setSelectedApplicationId(id)
              setActiveView('project-financing-detail')
            }}
          />
        )
      case 'project-financing-detail':
        return (
          <ProjectFinancingDetail 
            applicationId={selectedApplicationId}
            onBack={() => setActiveView('project-financing-list')}
          />
        )
      default:
        return <ProjectFinancingDashboard />
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
