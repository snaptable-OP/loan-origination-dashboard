import { DollarSign, FileText, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Loan Volume',
      value: '$12.5M',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Applications',
      value: '142',
      change: '+8',
      trend: 'up',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: '23',
      change: '-3',
      trend: 'down',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Approved This Month',
      value: '89',
      change: '+15%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ]

  const recentApplications = [
    {
      id: 'LO-2024-001',
      applicant: 'Sarah Johnson',
      amount: '$250,000',
      type: 'Mortgage',
      status: 'Under Review',
      date: '2024-01-15',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'LO-2024-002',
      applicant: 'Michael Chen',
      amount: '$75,000',
      type: 'Personal',
      status: 'Approved',
      date: '2024-01-14',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'LO-2024-003',
      applicant: 'Emily Rodriguez',
      amount: '$500,000',
      type: 'Business',
      status: 'Pending',
      date: '2024-01-13',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'LO-2024-004',
      applicant: 'David Kim',
      amount: '$150,000',
      type: 'Mortgage',
      status: 'Rejected',
      date: '2024-01-12',
      statusColor: 'bg-red-100 text-red-800',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's your loan origination overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp size={16} className="text-green-500" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.applicant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
