import { TrendingUp, TrendingDown, DollarSign, Users, Clock, CheckCircle } from 'lucide-react'

const Analytics = () => {
  const metrics = [
    {
      title: 'Approval Rate',
      value: '68.5%',
      change: '+5.2%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Average Processing Time',
      value: '4.2 days',
      change: '-0.8 days',
      trend: 'down',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average Loan Amount',
      value: '$187,500',
      change: '+$12,300',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'New Applicants',
      value: '142',
      change: '+18',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const loanTypeDistribution = [
    { type: 'Mortgage', count: 65, percentage: 45.8, color: 'bg-blue-500' },
    { type: 'Personal', count: 42, percentage: 29.6, color: 'bg-green-500' },
    { type: 'Business', count: 28, percentage: 19.7, color: 'bg-purple-500' },
    { type: 'Auto', count: 7, percentage: 4.9, color: 'bg-orange-500' },
  ]

  const statusBreakdown = [
    { status: 'Approved', count: 89, percentage: 62.7, color: 'bg-green-500' },
    { status: 'Under Review', count: 23, percentage: 16.2, color: 'bg-yellow-500' },
    { status: 'Pending', count: 18, percentage: 12.7, color: 'bg-blue-500' },
    { status: 'Rejected', count: 12, percentage: 8.4, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">Comprehensive insights into your loan origination process</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon size={24} className={metric.color} />
                </div>
                {metric.trend === 'up' ? (
                  <TrendingUp size={20} className="text-green-500" />
                ) : (
                  <TrendingDown size={20} className="text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
              <p className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last month
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Type Distribution</h3>
          <div className="space-y-4">
            {loanTypeDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${item.color} h-2.5 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Breakdown</h3>
          <div className="space-y-4">
            {statusBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${item.color} h-2.5 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Applications</p>
            <p className="text-2xl font-bold text-gray-900">142</p>
            <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Approvals</p>
            <p className="text-2xl font-bold text-gray-900">89</p>
            <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">$12.5M</p>
            <p className="text-sm text-green-600 mt-2">↑ 15% from last month</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
