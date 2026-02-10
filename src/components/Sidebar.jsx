import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings } from 'lucide-react'

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'new-application', label: 'New Application', icon: PlusCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">Loan Origination</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>
      <nav className="flex-1 p-4">
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
                      ? 'bg-primary-50 text-primary-700 font-medium'
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
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm font-medium text-primary-900">Need Help?</p>
          <p className="text-xs text-primary-700 mt-1">Contact support for assistance</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
