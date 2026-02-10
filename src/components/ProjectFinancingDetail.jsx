import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default function ProjectFinancingDetail({ applicationId, onBack }) {
  const [application, setApplication] = useState(null)
  const [drawdowns, setDrawdowns] = useState([])
  const [permits, setPermits] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetail()
    }
  }, [applicationId])

  const loadApplicationDetail = async () => {
    try {
      setLoading(true)

      // Load main application data
      const { data: appData, error: appError } = await supabase
        .from('project_financing_data')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (appError) throw appError

      // Load related data
      const [drawdownsRes, permitsRes, risksRes] = await Promise.all([
        supabase
          .from('drawdown_schedules')
          .select('*')
          .eq('project_financing_data_id', applicationId)
          .order('sequence_number', { ascending: true }),
        supabase
          .from('permits_and_approvals')
          .select('*')
          .eq('project_financing_data_id', applicationId),
        supabase
          .from('contractual_terms_and_risks')
          .select('*')
          .eq('project_financing_data_id', applicationId)
      ])

      setApplication(appData)
      setDrawdowns(drawdownsRes.data || [])
      setPermits(permitsRes.data || [])
      setRisks(risksRes.data || [])
    } catch (error) {
      console.error('Error loading application detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskScore = (project) => {
    if (!project) return 0
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
    if (score >= 7) return { label: 'High Risk', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-500' }
    if (score >= 4) return { label: 'Medium Risk', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-500' }
    return { label: 'Low Risk', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-500' }
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

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to list
        </button>
      </div>
    )
  }

  const riskScore = calculateRiskScore(application)
  const riskLevel = getRiskLevel(riskScore)
  const loanAmount = application.as_is_valuation_of_project && application.loan_to_value_ratio
    ? application.as_is_valuation_of_project * application.loan_to_value_ratio
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {application.id}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg border-2 ${riskLevel.borderColor} ${riskLevel.bgColor}`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${riskLevel.textColor}`} />
            <span className={`font-bold ${riskLevel.textColor}`}>
              Risk Score: {riskScore.toFixed(1)} / 10
            </span>
            <span className={`font-medium ${riskLevel.textColor}`}>
              ({riskLevel.label})
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Loan Amount</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(loanAmount)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Loan-to-Value</span>
            <Percent className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {application.loan_to_value_ratio ? (application.loan_to_value_ratio * 100).toFixed(1) + '%' : 'N/A'}
            </p>
            {application.loan_to_value_ratio && (
              application.loan_to_value_ratio > 0.7 ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Loan-to-Cost</span>
            <Percent className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {application.loan_to_cost_ratio ? (application.loan_to_cost_ratio * 100).toFixed(1) + '%' : 'N/A'}
            </p>
            {application.loan_to_cost_ratio && (
              application.loan_to_cost_ratio > 0.8 ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Contingency</span>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(application.contingency_sum)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {application.contingency_sum_percentage_of_project_cost?.toFixed(1) || 0}% of project cost
          </p>
        </div>
      </div>

      {/* Valuation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Valuations</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">As-Is Valuation</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(application.as_is_valuation_of_project)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">As-If-Complete Valuation</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(application.as_if_complete_valuation_of_project)}
              </p>
            </div>
            {application.as_is_valuation_of_project && application.as_if_complete_valuation_of_project && (
              <div>
                <p className="text-sm text-gray-600">Value Appreciation Potential</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(application.as_if_complete_valuation_of_project - application.as_is_valuation_of_project)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(((application.as_if_complete_valuation_of_project - application.as_is_valuation_of_project) / application.as_is_valuation_of_project) * 100).toFixed(1)}% increase
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Expected Presales</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(application.expected_presales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application Created</p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(application.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(application.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drawdown Schedule */}
      {drawdowns.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drawdown Schedule</h3>
          <div className="space-y-3">
            {drawdowns.map((drawdown, index) => (
              <div key={drawdown.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {drawdown.sequence_number || index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{drawdown.construction_milestone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {(drawdown.drawdown_sum_for_milestone * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(loanAmount * drawdown.drawdown_sum_for_milestone)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permits and Approvals */}
      {permits.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permits & Approvals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permits.map((permit) => (
              <div key={permit.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{permit.permit_or_approval_document_name}</p>
                  {permit.document_id && (
                    <p className="text-sm text-gray-500 mt-1">ID: {permit.document_id}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessments */}
      {risks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Contractual Terms & Risk Assessments
          </h3>
          <div className="space-y-4">
            {risks.map((risk) => (
              <div key={risk.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="mb-3">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Risk Assessment</p>
                  <p className="text-sm text-gray-700">{risk.risk_assessment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Contractual Clause</p>
                  <p className="text-sm text-gray-700">{risk.contractual_clause}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
