import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings, Building2 } from 'lucide-react'

const Sidebar = ({ activeView, setActiveView, selectedProjectId, setSelectedProjectId }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_financing_data')
        .select('id, project_name, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by project_name (in case there are duplicates)
      const uniqueProjects = []
      const seenNames = new Set()
      
      data.forEach(project => {
        const name = project.project_name || 'Unnamed Project'
        if (!seenNames.has(name)) {
          seenNames.add(name)
          uniqueProjects.push({
            id: project.id,
            name: name,
            created_at: project.created_at
          })
        }
      })

      setProjects(uniqueProjects)
      
      // Auto-select first project if none selected
      if (!selectedProjectId && uniqueProjects.length > 0) {
        setSelectedProjectId(uniqueProjects[0].id)
        setActiveView('project-dashboard')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'new-application', label: 'New Application', icon: PlusCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Loan Origination</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
            General
          </p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
            Project Financing
          </p>
          <ul className="space-y-2">
            {projectFinancingItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id || (item.id === 'project-financing-dashboard' && activeView === 'project-financing-detail')
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={loadProjects}
          className="w-full bg-blue-50 rounded-lg p-4 text-left hover:bg-blue-100 transition-colors"
        >
          <p className="text-sm font-medium text-blue-900">Refresh Projects</p>
          <p className="text-xs text-blue-700 mt-1">Reload project list</p>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
