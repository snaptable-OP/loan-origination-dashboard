import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Eye
} from 'lucide-react'

export default function ProjectFinancingList({ onViewDetail }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('project_financing_data')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const appsWithRisk = data.map(app => ({
        ...app,
        riskScore: calculateRiskScore(app),
        riskLevel: getRiskLevel(calculateRiskScore(app))
      }))

      setApplications(appsWithRisk)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskScore = (project) => {
    let score = 0

    if (project.loan_to_value_ratio) {
      if (project.loan_to_value_ratio > 0.8) score += 3
      else if (project.loan_to_value_ratio > 0.7) score += 2
      else if (project.loan_to_value_ratio > 0.6) score += 1
    }

    if (project.loan_to_cost_ratio) {
      if (project.loan_to_cost_ratio > 0.85) score += 2
      else if (project.loan_to_cost_ratio > 0.75) score += 1
    }

    if (project.as_is_valuation_of_project && project.as_if_complete_valuation_of_project) {
      const gap = (project.as_if_complete_valuation_of_project - project.as_is_valuation_of_project) / project.as_is_valuation_of_project
      if (gap > 2) score += 2
      else if (gap > 1.5) score += 1
    }

    if (project.contingency_sum_percentage_of_project_cost) {
      if (project.contingency_sum_percentage_of_project_cost < 1) score += 1
    }

    return Math.min(score, 10)
  }

  const getRiskLevel = (score) => {
    if (score >= 7) return { label: 'High Risk', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    if (score >= 4) return { label: 'Medium Risk', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
    return { label: 'Low Risk', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' }
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

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      app.id.toLowerCase().includes(searchLower) ||
      (app.project_name && app.project_name.toLowerCase().includes(searchLower))
    const matchesRisk = riskFilter === 'all' || 
      (riskFilter === 'high' && app.riskScore >= 7) ||
      (riskFilter === 'medium' && app.riskScore >= 4 && app.riskScore < 7) ||
      (riskFilter === 'low' && app.riskScore < 4)
    
    return matchesSearch && matchesRisk
  })

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
        <h1 className="text-3xl font-bold text-gray-900">Project Financing Applications</h1>
        <p className="mt-2 text-gray-600">View and manage all development loan applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by project name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRiskFilter('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'high' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setRiskFilter('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'medium' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medium Risk
            </button>
            <button
              onClick={() => setRiskFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'low' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Risk
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan-to-Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan-to-Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  As-Is Valuation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  As-If-Complete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.project_name || 'Unnamed Project'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {app.id.substring(0, 8)}...
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
                      <div className="text-sm text-gray-900">
                        {formatCurrency(app.as_if_complete_valuation_of_project)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.riskLevel.bgColor} ${app.riskLevel.textColor}`}>
                        {app.riskScore.toFixed(1)} - {app.riskLevel.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetail && onViewDetail(app.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
