import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  DollarSign,
  Percent,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download
} from 'lucide-react'

export default function ProjectDashboard({ projectId }) {
  const [project, setProject] = useState(null)
  const [drawdowns, setDrawdowns] = useState([])
  const [permits, setPermits] = useState([])
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)

      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }

      // First, get the project to find its project_name
      const { data: selectedProject, error: projectError } = await supabase
        .from('project_financing_data')
        .select('id, project_name')
        .eq('id', projectId)
        .single()

      if (projectError) {
        console.error('Error loading project:', projectError)
        setLoading(false)
        return
      }

      const projectName = selectedProject.project_name || 'Unnamed Project'

      // Load the LATEST project data for this project name
      // This ensures we always show the most recent data even if there are duplicates
      const { data: projectDataArray, error: latestError } = await supabase
        .from('project_financing_data')
        .select('*')
        .eq('project_name', projectName)
        .order('created_at', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(1)

      if (latestError) {
        console.error('Error loading latest project data:', latestError)
        setLoading(false)
        return
      }

      if (!projectDataArray || projectDataArray.length === 0) {
        console.error('No project data found')
        setLoading(false)
        return
      }

      const projectData = projectDataArray[0]

      // Use the latest project's ID for related data
      const latestProjectId = projectData.id

      // Load related data using the latest project ID
      const [drawdownsRes, permitsRes, risksRes] = await Promise.all([
        supabase
          .from('drawdown_schedules')
          .select('*')
          .eq('project_financing_data_id', latestProjectId)
          .order('sequence_number', { ascending: true }),
        supabase
          .from('permits_and_approvals')
          .select('*')
          .eq('project_financing_data_id', latestProjectId),
        supabase
          .from('contractual_terms_and_risks')
          .select('*')
          .eq('project_financing_data_id', latestProjectId)
      ])

      setProject(projectData)
      setDrawdowns(drawdownsRes.data || [])
      setPermits(permitsRes.data || [])
      setRisks(risksRes.data || [])
      
      // Debug: Log the loan_amount value to help troubleshoot
      console.log('📊 Project data loaded:', {
        id: projectData.id,
        project_name: projectData.project_name,
        loan_amount: projectData.loan_amount,
        loan_amount_type: typeof projectData.loan_amount,
        as_is_valuation: projectData.as_is_valuation_of_project,
        loan_to_value_ratio: projectData.loan_to_value_ratio,
        calculated_amount: projectData.as_is_valuation_of_project && projectData.loan_to_value_ratio 
          ? projectData.as_is_valuation_of_project * projectData.loan_to_value_ratio 
          : null
      })
    } catch (error) {
      console.error('Error loading project data:', error)
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <p className="text-sm text-gray-400 mt-2">Select a project from the sidebar</p>
      </div>
    )
  }

  const riskScore = calculateRiskScore(project)
  const riskLevel = getRiskLevel(riskScore)
  // Use loan_amount directly if available (check for null/undefined, not just falsy)
  // Otherwise calculate from LTV
  const loanAmount = (project.loan_amount != null && project.loan_amount !== undefined) 
    ? project.loan_amount
    : (project.as_is_valuation_of_project && project.loan_to_value_ratio
      ? project.as_is_valuation_of_project * project.loan_to_value_ratio
      : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {project.project_name || 'Unnamed Project'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Project Dashboard • Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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
          <div className="flex gap-2">
            <button
              onClick={() => {
                const report = generateLPReport(project)
                downloadDocument(report, `${project.project_name || 'Project'}_LP_Report.txt`)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Download size={18} />
              LP Report
            </button>
            <button
              onClick={() => {
                const letter = generateLetterOfOffer(project)
                downloadDocument(letter, `${project.project_name || 'Project'}_Letter_of_Offer.txt`)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              <Download size={18} />
              Letter of Offer
            </button>
            <button
              onClick={() => {
                const proposal = generateLoanProposal(project)
                downloadDocument(proposal, `${project.project_name || 'Project'}_Loan_Proposal.txt`)
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
            >
              <Download size={18} />
              Loan Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
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
              {project.loan_to_value_ratio ? (project.loan_to_value_ratio * 100).toFixed(1) + '%' : 'N/A'}
            </p>
            {project.loan_to_value_ratio && (
              project.loan_to_value_ratio > 0.7 ? (
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
              {project.loan_to_cost_ratio ? (project.loan_to_cost_ratio * 100).toFixed(1) + '%' : 'N/A'}
            </p>
            {project.loan_to_cost_ratio && (
              project.loan_to_cost_ratio > 0.8 ? (
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
            {formatCurrency(project.contingency_sum)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {project.contingency_sum_percentage_of_project_cost?.toFixed(1) || 0}% of project cost
          </p>
        </div>
      </div>

      {/* Property Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {project.total_units || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bedrooms per Unit</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {project.bedrooms_per_unit || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Area per Unit</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {project.area_per_unit_sqm ? `${project.area_per_unit_sqm} sqm` : 'N/A'}
              </p>
            </div>
            {project.total_units && project.area_per_unit_sqm && (
              <div>
                <p className="text-sm text-gray-600">Total Development Area</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {(project.total_units * project.area_per_unit_sqm).toLocaleString()} sqm
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Valuations</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">As-Is Valuation</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(project.as_is_valuation_of_project)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">As-If-Complete Valuation</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(project.as_if_complete_valuation_of_project)}
              </p>
            </div>
            {project.as_is_valuation_of_project && project.as_if_complete_valuation_of_project && (
              <div>
                <p className="text-sm text-gray-600">Value Appreciation Potential</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(project.as_if_complete_valuation_of_project - project.as_is_valuation_of_project)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(((project.as_if_complete_valuation_of_project - project.as_is_valuation_of_project) / project.as_is_valuation_of_project) * 100).toFixed(1)}% increase
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Expected Presales</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(project.expected_presales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application Created</p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(project.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(project.updated_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application ID</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {project.id}
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

      {/* Empty States */}
      {drawdowns.length === 0 && permits.length === 0 && risks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No additional project details available</p>
        </div>
      )}
    </div>
  )
}
