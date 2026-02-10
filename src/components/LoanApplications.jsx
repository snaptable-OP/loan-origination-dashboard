import { Search, Filter, Download } from 'lucide-react'

const LoanApplications = () => {
  const applications = [
    {
      id: 'LO-2024-001',
      applicant: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      amount: '$250,000',
      type: 'Mortgage',
      status: 'Under Review',
      date: '2024-01-15',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'LO-2024-002',
      applicant: 'Michael Chen',
      email: 'michael.chen@email.com',
      amount: '$75,000',
      type: 'Personal',
      status: 'Approved',
      date: '2024-01-14',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'LO-2024-003',
      applicant: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      amount: '$500,000',
      type: 'Business',
      status: 'Pending',
      date: '2024-01-13',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'LO-2024-004',
      applicant: 'David Kim',
      email: 'david.kim@email.com',
      amount: '$150,000',
      type: 'Mortgage',
      status: 'Rejected',
      date: '2024-01-12',
      statusColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'LO-2024-005',
      applicant: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      amount: '$95,000',
      type: 'Personal',
      status: 'Approved',
      date: '2024-01-11',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'LO-2024-006',
      applicant: 'Robert Taylor',
      email: 'robert.taylor@email.com',
      amount: '$350,000',
      type: 'Mortgage',
      status: 'Under Review',
      date: '2024-01-10',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Loan Applications</h2>
          <p className="text-gray-600 mt-1">Manage and track all loan applications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by applicant, ID, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            Filter
          </button>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Under Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Types</option>
            <option>Mortgage</option>
            <option>Personal</option>
            <option>Business</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.applicant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-700 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LoanApplications
