import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Percent,
  Building2,
  FileText,
  Shield
} from 'lucide-react'

export default function ProjectFinancingDashboard() {
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    totalLoanValue: 0,
    avgLTV: 0,
    avgLTC: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentApplications, setRecentApplications] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all project financing data
      const { data: projects, error } = await supabase
        .from('project_financing_data')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate metrics
      const total = projects.length
      const totalLoanValue = projects.reduce((sum, p) => {
        const loanAmount = p.as_is_valuation_of_project && p.loan_to_value_ratio
          ? p.as_is_valuation_of_project * p.loan_to_value_ratio
          : 0
        return sum + loanAmount
      }, 0)

      const avgLTV = projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.loan_to_value_ratio || 0), 0) / projects.length
        : 0

      const avgLTC = projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.loan_to_cost_ratio || 0), 0) / projects.length
        : 0

      // Calculate risk distribution
      const riskCounts = projects.reduce((acc, p) => {
        const risk = calculateRiskScore(p)
        if (risk >= 7) acc.high++
        else if (risk >= 4) acc.medium++
        else acc.low++
        return acc
      }, { high: 0, medium: 0, low: 0 })

      setMetrics({
        totalApplications: total,
        totalLoanValue,
        avgLTV: avgLTV * 100,
        avgLTC: avgLTC * 100,
        highRiskCount: riskCounts.high,
        mediumRiskCount: riskCounts.medium,
        lowRiskCount: riskCounts.low
      })

      // Get recent applications with risk scores
      const recent = projects.slice(0, 5).map(p => ({
        ...p,
        riskScore: calculateRiskScore(p),
        riskLevel: getRiskLevel(calculateRiskScore(p))
      }))
      setRecentApplications(recent)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskScore = (project) => {
    let score = 0

    // LTV Risk (0-3 points)
    if (project.loan_to_value_ratio) {
      if (project.loan_to_value_ratio > 0.8) score += 3
      else if (project.loan_to_value_ratio > 0.7) score += 2
      else if (project.loan_to_value_ratio > 0.6) score += 1
    }

    // LTC Risk (0-2 points)
    if (project.loan_to_cost_ratio) {
      if (project.loan_to_cost_ratio > 0.85) score += 2
      else if (project.loan_to_cost_ratio > 0.75) score += 1
    }

    // Valuation Gap Risk (0-2 points)
    if (project.as_is_valuation_of_project && project.as_if_complete_valuation_of_project) {
      const gap = (project.as_if_complete_valuation_of_project - project.as_is_valuation_of_project) / project.as_is_valuation_of_project
      if (gap > 2) score += 2
      else if (gap > 1.5) score += 1
    }

    // Contingency Risk (0-1 point)
    if (project.contingency_sum_percentage_of_project_cost) {
      if (project.contingency_sum_percentage_of_project_cost < 1) score += 1
    }

    return Math.min(score, 10) // Cap at 10
  }

  const getRiskLevel = (score) => {
    if (score >= 7) return { label: 'High Risk', color: 'red' }
    if (score >= 4) return { label: 'Medium Risk', color: 'yellow' }
    return { label: 'Low Risk', color: 'green' }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Financing Risk Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor and analyze development loan application risks</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Loan Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Loan Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.totalLoanValue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average LTV */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Loan-to-Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.avgLTV.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                {metrics.avgLTV > 70 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-xs ml-1 ${metrics.avgLTV > 70 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.avgLTV > 70 ? 'High' : 'Normal'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average LTC */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Loan-to-Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.avgLTC.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                {metrics.avgLTC > 80 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-xs ml-1 ${metrics.avgLTC > 80 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.avgLTC > 80 ? 'High' : 'Normal'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">High Risk</span>
              </div>
              <span className="text-lg font-bold text-red-600">{metrics.highRiskCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Medium Risk</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{metrics.mediumRiskCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Low Risk</span>
              </div>
              <span className="text-lg font-bold text-green-600">{metrics.lowRiskCount}</span>
            </div>
          </div>
        </div>

        {/* Risk Breakdown Chart */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
          <div className="flex items-end space-x-2 h-32">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const count = recentApplications.filter(a => Math.floor(a.riskScore) === score).length
              const height = recentApplications.length > 0 
                ? (count / recentApplications.length) * 100 
                : 0
              const color = score >= 7 ? 'bg-red-500' : score >= 4 ? 'bg-yellow-500' : 'bg-green-500'
              
              return (
                <div key={score} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${color} rounded-t transition-all`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">{score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTC Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valuation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentApplications.map((app) => {
                const risk = getRiskLevel(app.riskScore)
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.project_name || 'Unnamed Project'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {app.loan_to_value_ratio ? (app.loan_to_value_ratio * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {app.loan_to_cost_ratio ? (app.loan_to_cost_ratio * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(app.as_is_valuation_of_project)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${risk.color === 'red' ? 'bg-red-100 text-red-800' : 
                          risk.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {app.riskScore.toFixed(1)} - {risk.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
