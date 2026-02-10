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
      
      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }
      
      // Get all projects ordered by created_at (newest first)
      const { data, error } = await supabase
        .from('project_financing_data')
        .select('id, project_name, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        setLoading(false)
        return
      }

      // Group by project_name and keep only the latest one (by created_at, then updated_at)
      const projectsByName = new Map()
      
      data.forEach(project => {
        const name = project.project_name || 'Unnamed Project'
        const existing = projectsByName.get(name)
        
        if (!existing) {
          // First occurrence of this project name
          projectsByName.set(name, {
            id: project.id,
            name: name,
            created_at: project.created_at,
            updated_at: project.updated_at
          })
        } else {
          // Compare timestamps to keep the latest
          const existingTime = new Date(existing.updated_at || existing.created_at).getTime()
          const currentTime = new Date(project.updated_at || project.created_at).getTime()
          
          if (currentTime > existingTime) {
            // This one is newer, replace it
            projectsByName.set(name, {
              id: project.id,
              name: name,
              created_at: project.created_at,
              updated_at: project.updated_at
            })
          }
        }
      })

      // Convert map to array and sort by most recent
      const uniqueProjects = Array.from(projectsByName.values())
        .sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at).getTime()
          const timeB = new Date(b.updated_at || b.created_at).getTime()
          return timeB - timeA // Newest first
        })

      setProjects(uniqueProjects)
      
      // Auto-select first project if none selected
      if (!selectedProjectId && uniqueProjects.length > 0) {
        setSelectedProjectId(uniqueProjects[0].id)
        if (activeView === 'dashboard' || !activeView) {
          setActiveView('project-dashboard')
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      setProjects([])
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
            Projects
          </p>
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No projects found</div>
          ) : (
            <ul className="space-y-1">
              {projects.map((project) => {
                const isActive = selectedProjectId === project.id && activeView === 'project-dashboard'
                return (
                  <li key={project.id}>
                    <button
                      onClick={() => {
                        setSelectedProjectId(project.id)
                        setActiveView('project-dashboard')
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 size={20} />
                      <span className="flex-1 truncate">{project.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
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
