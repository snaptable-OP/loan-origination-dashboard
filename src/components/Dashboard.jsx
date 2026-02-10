import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  ArrowRight
} from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    totalLoanAmount: 0,
    totalCollateralValue: 0,
    totalLTV: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }

      // Fetch all project financing data, ordered by most recent
      const { data: allProjects, error } = await supabase
        .from('project_financing_data')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        setLoading(false)
        return
      }

      // Group by project_name and get the latest for each
      const projectsByName = new Map()
      
      allProjects.forEach(project => {
        const name = project.project_name || 'Unnamed Project'
        const existing = projectsByName.get(name)
        
        if (!existing) {
          projectsByName.set(name, project)
        } else {
          const existingTime = new Date(existing.updated_at || existing.created_at).getTime()
          const currentTime = new Date(project.updated_at || project.created_at).getTime()
          
          if (currentTime > existingTime) {
            projectsByName.set(name, project)
          }
        }
      })

      const uniqueProjects = Array.from(projectsByName.values())
        .sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at).getTime()
          const timeB = new Date(b.updated_at || b.created_at).getTime()
          return timeB - timeA
        })

      setProjects(uniqueProjects)

      // Calculate metrics
      const totalProjects = uniqueProjects.length
      
      const totalLoanAmount = uniqueProjects.reduce((sum, p) => {
        const loanAmount = (p.loan_amount != null && p.loan_amount !== undefined)
          ? p.loan_amount
          : (p.as_is_valuation_of_project && p.loan_to_value_ratio
            ? p.as_is_valuation_of_project * p.loan_to_value_ratio
            : 0)
        return sum + (loanAmount || 0)
      }, 0)

      const totalCollateralValue = uniqueProjects.reduce((sum, p) => {
        return sum + (p.as_is_valuation_of_project || 0)
      }, 0)

      const totalLTV = totalCollateralValue > 0
        ? (totalLoanAmount / totalCollateralValue) * 100
        : 0

      setMetrics({
        totalProjects,
        totalLoanAmount,
        totalCollateralValue,
        totalLTV
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getLoanAmount = (project) => {
    return (project.loan_amount != null && project.loan_amount !== undefined)
      ? project.loan_amount
      : (project.as_is_valuation_of_project && project.loan_to_value_ratio
        ? project.as_is_valuation_of_project * project.loan_to_value_ratio
        : 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all projects</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Number of Projects</span>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalProjects}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Loan Amounts</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalLoanAmount)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Collateral Value</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalCollateralValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Sum of as-is valuations</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Loan to Value (LTV)</span>
            <Percent className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalLTV.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Total loan / Total collateral</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  As-Is Valuation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const loanAmount = getLoanAmount(project)
                  const ltv = project.as_is_valuation_of_project && project.as_is_valuation_of_project > 0
                    ? (loanAmount / project.as_is_valuation_of_project) * 100
                    : null

                  return (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {project.project_name || 'Unnamed Project'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(loanAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">
                          {formatCurrency(project.as_is_valuation_of_project)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {ltv !== null ? (
                          <span className="text-sm font-medium text-gray-900">
                            {ltv.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {project.loan_to_cost_ratio ? (
                          <span className="text-sm font-medium text-gray-900">
                            {(project.loan_to_cost_ratio * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
