// Shared functions for Vercel serverless functions
import { supabase } from '../lib/supabase.js';

// Snaptable API configuration
const SNAPTABLE_API_URL = process.env.SNAPTABLE_API_URL || 'https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f';
const SNAPTABLE_API_TOKEN = process.env.SNAPTABLE_API_TOKEN || 'st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj';

// Helper function to generate application ID
export function generateApplicationId() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `LO-${year}-${timestamp}`;
}

// Helper function to map webhook data to database schema
export function mapWebhookDataToApplication(webhookData) {
  const applicationId = webhookData.application_id || webhookData.applicationId || generateApplicationId();
  
  return {
    application_id: applicationId,
    applicant_name: webhookData.applicant_name || webhookData.applicantName || webhookData.name || '',
    email: webhookData.email || '',
    phone: webhookData.phone || webhookData.phoneNumber || null,
    loan_type: (webhookData.loan_type || webhookData.loanType || '').toLowerCase(),
    amount: parseFloat(webhookData.amount || webhookData.loanAmount || 0),
    purpose: webhookData.purpose || webhookData.loanPurpose || null,
    employment_status: (webhookData.employment_status || webhookData.employmentStatus || '').toLowerCase() || null,
    annual_income: webhookData.annual_income || webhookData.annualIncome ? parseFloat(webhookData.annual_income || webhookData.annualIncome) : null,
    credit_score: webhookData.credit_score || webhookData.creditScore ? parseInt(webhookData.credit_score || webhookData.creditScore) : null,
    status: (webhookData.status || 'pending').toLowerCase().replace(' ', '_'),
  };
}

// Helper function to call Snaptable data transformer API
export async function transformDataWithSnaptable(jsonData) {
  try {
    const textInput = JSON.stringify(jsonData, null, 2);
    
    console.log('Sending data to Snaptable API...');
    
    const response = await fetch(SNAPTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SNAPTABLE_API_TOKEN}`
      },
      body: JSON.stringify({ text: textInput })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Snaptable API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Snaptable API response received:', result);
    
    return result;
  } catch (error) {
    console.error('Error calling Snaptable API:', error);
    throw error;
  }
}

// Helper function to process project financing data
export async function processProjectFinancingData(webhookData, loanApplicationId = null) {
  const projectFinancingData = {
    loan_application_id: loanApplicationId,
    loan_to_value_ratio: webhookData.loan_to_value_ratio ? parseFloat(webhookData.loan_to_value_ratio) : null,
    loan_to_cost_ratio: webhookData.loan_to_cost_ratio ? parseFloat(webhookData.loan_to_cost_ratio) : null,
    as_is_valuation_of_project: webhookData.as_is_valuation_of_project ? parseFloat(webhookData.as_is_valuation_of_project) : null,
    as_if_complete_valuation_of_project: webhookData.as_if_complete_valuation_of_project ? parseFloat(webhookData.as_if_complete_valuation_of_project) : null,
    expected_presales: webhookData.expected_presales ? parseFloat(webhookData.expected_presales) : null,
    contingency_sum: webhookData.contingency_sum?.contingency_sum ? parseFloat(webhookData.contingency_sum.contingency_sum) : null,
    contingency_sum_percentage_of_project_cost: webhookData.contingency_sum?.percentage_of_project_cost ? parseFloat(webhookData.contingency_sum.percentage_of_project_cost) : null,
  };

  const { data: financingData, error: financingError } = await supabase
    .from('project_financing_data')
    .insert([projectFinancingData])
    .select()
    .single();

  if (financingError) {
    throw new Error(`Error saving project financing data: ${financingError.message}`);
  }

  const projectFinancingId = financingData.id;

  // Process drawdown schedules
  if (webhookData.drawdown_schedule && Array.isArray(webhookData.drawdown_schedule)) {
    const drawdowns = webhookData.drawdown_schedule.map((item, index) => ({
      project_financing_data_id: projectFinancingId,
      construction_milestone: item.construction_milestone || null,
      drawdown_sum_for_milestone: item.drawdown_sum_for_milestone ? parseFloat(item.drawdown_sum_for_milestone) : null,
      sequence_number: index + 1,
    }));

    if (drawdowns.length > 0) {
      const { error: drawdownError } = await supabase
        .from('drawdown_schedules')
        .insert(drawdowns);

      if (drawdownError) {
        console.error('Error saving drawdown schedules:', drawdownError);
      }
    }
  }

  // Process permits and approvals
  if (webhookData.existing_permits_and_approvals && Array.isArray(webhookData.existing_permits_and_approvals)) {
    const permits = webhookData.existing_permits_and_approvals.map(item => ({
      project_financing_data_id: projectFinancingId,
      document_id: item.document_id || null,
      permit_or_approval_document_name: item.permit_or_approval_document_name || null,
    }));

    if (permits.length > 0) {
      const { error: permitError } = await supabase
        .from('permits_and_approvals')
        .insert(permits);

      if (permitError) {
        console.error('Error saving permits and approvals:', permitError);
      }
    }
  }

  // Process contractual terms and risks
  if (webhookData.contractual_term_and_risk_assessment && Array.isArray(webhookData.contractual_term_and_risk_assessment)) {
    const terms = webhookData.contractual_term_and_risk_assessment.map(item => ({
      project_financing_data_id: projectFinancingId,
      risk_assessment: item.risk_assessment || null,
      contractual_clause: item.contractual_clause || null,
    }));

    if (terms.length > 0) {
      const { error: termError } = await supabase
        .from('contractual_terms_and_risks')
        .insert(terms);

      if (termError) {
        console.error('Error saving contractual terms and risks:', termError);
      }
    }
  }

  return financingData;
}
