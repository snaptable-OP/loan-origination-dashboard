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
    const snaptableRequestStart = Date.now();
    
    console.log('Sending data to Snaptable API...');
    console.log(`⏱️  Snaptable request started at: ${new Date().toISOString()}`);
    
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

    // Handle both JSON and text responses from Snaptable
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      // Snaptable returns JSON directly
      result = await response.json();
    } else {
      // Snaptable returns text (try to parse as JSON)
      const textResponse = await response.text();
      try {
        result = JSON.parse(textResponse);
      } catch (parseError) {
        // If it's not valid JSON, return as-is (might be structured text)
        console.warn('Snaptable returned non-JSON text, using as-is');
        result = textResponse;
      }
    }
    
    console.log('Snaptable API response received:', result);
    
    // Ensure result is an object (not string) for processing
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
      } catch (e) {
        throw new Error('Snaptable returned text that could not be parsed as JSON');
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error calling Snaptable API:', error);
    throw error;
  }
}

// Helper function to process project financing data
export async function processProjectFinancingData(webhookData, loanApplicationId = null) {
  // Log the data structure to see what we're receiving
  console.log('Processing project financing data. Data structure:', JSON.stringify(webhookData, null, 2));
  console.log('Data keys:', webhookData ? Object.keys(webhookData) : 'null');
  
  // Try to extract values with multiple possible field name variations
  // (handles both original format and Snaptable transformed format)
  const projectFinancingData = {
    loan_application_id: loanApplicationId,
    loan_to_value_ratio: webhookData.loan_to_value_ratio || webhookData.loanToValueRatio || webhookData['loan-to-value-ratio'] ? parseFloat(webhookData.loan_to_value_ratio || webhookData.loanToValueRatio || webhookData['loan-to-value-ratio']) : null,
    loan_to_cost_ratio: webhookData.loan_to_cost_ratio || webhookData.loanToCostRatio || webhookData['loan-to-cost-ratio'] ? parseFloat(webhookData.loan_to_cost_ratio || webhookData.loanToCostRatio || webhookData['loan-to-cost-ratio']) : null,
    as_is_valuation_of_project: webhookData.as_is_valuation_of_project || webhookData.asIsValuationOfProject || webhookData['as-is-valuation-of-project'] ? parseFloat(webhookData.as_is_valuation_of_project || webhookData.asIsValuationOfProject || webhookData['as-is-valuation-of-project']) : null,
    as_if_complete_valuation_of_project: webhookData.as_if_complete_valuation_of_project || webhookData.asIfCompleteValuationOfProject || webhookData['as-if-complete-valuation-of-project'] ? parseFloat(webhookData.as_if_complete_valuation_of_project || webhookData.asIfCompleteValuationOfProject || webhookData['as-if-complete-valuation-of-project']) : null,
    expected_presales: webhookData.expected_presales || webhookData.expectedPresales ? parseFloat(webhookData.expected_presales || webhookData.expectedPresales) : null,
    contingency_sum: (webhookData.contingency_sum?.contingency_sum || webhookData.contingencySum?.contingencySum || webhookData.contingency_sum || webhookData.contingencySum) ? parseFloat(webhookData.contingency_sum?.contingency_sum || webhookData.contingencySum?.contingencySum || webhookData.contingency_sum || webhookData.contingencySum) : null,
    contingency_sum_percentage_of_project_cost: (webhookData.contingency_sum?.percentage_of_project_cost || webhookData.contingencySum?.percentageOfProjectCost || webhookData.contingency_sum_percentage_of_project_cost) ? parseFloat(webhookData.contingency_sum?.percentage_of_project_cost || webhookData.contingencySum?.percentageOfProjectCost || webhookData.contingency_sum_percentage_of_project_cost) : null,
  };
  
  console.log('Extracted project financing data:', JSON.stringify(projectFinancingData, null, 2));

  const supabaseInsertStart = Date.now();
  console.log('Attempting to save to Supabase...');
  console.log(`⏱️  Supabase insert started at: ${new Date().toISOString()}`);
  console.log('Data being saved:', JSON.stringify(projectFinancingData, null, 2));
  
  const { data: financingData, error: financingError } = await supabase
    .from('project_financing_data')
    .insert([projectFinancingData])
    .select()
    .single();

  if (financingError) {
    console.error('❌ Supabase insert error:', financingError);
    console.error('Error code:', financingError.code);
    console.error('Error message:', financingError.message);
    console.error('Error details:', financingError.details);
    console.error('Error hint:', financingError.hint);
    throw new Error(`Error saving project financing data: ${financingError.message} (Code: ${financingError.code})`);
  }
  
  const supabaseInsertEnd = Date.now();
  const supabaseInsertDuration = supabaseInsertEnd - supabaseInsertStart;
  console.log(`⏱️  Supabase main table insert: ${supabaseInsertDuration}ms`);
  const supabaseInsertEnd = Date.now();
  const supabaseInsertDuration = supabaseInsertEnd - supabaseInsertStart;
  console.log(`⏱️  Supabase main table insert: ${supabaseInsertDuration}ms`);
  console.log('✅ Successfully inserted into project_financing_data:', financingData.id);

  const projectFinancingId = financingData.id;
  const relatedDataStart = Date.now();

  // Process drawdown schedules
  // Handle both original format and Snaptable transformed format
  const drawdownSchedule = webhookData.drawdown_schedule || webhookData.drawdownSchedule || webhookData['drawdown-schedule'] || [];
  if (drawdownSchedule && Array.isArray(drawdownSchedule)) {
    console.log('Processing drawdown schedule with', drawdownSchedule.length, 'items');
    const drawdowns = drawdownSchedule.map((item, index) => ({
      project_financing_data_id: projectFinancingId,
      construction_milestone: item.construction_milestone || item.constructionMilestone || item['construction-milestone'] || null,
      drawdown_sum_for_milestone: (item.drawdown_sum_for_milestone || item.drawdownSumForMilestone || item['drawdown-sum-for-milestone']) ? parseFloat(item.drawdown_sum_for_milestone || item.drawdownSumForMilestone || item['drawdown-sum-for-milestone']) : null,
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
  const permitsAndApprovals = webhookData.existing_permits_and_approvals || webhookData.existingPermitsAndApprovals || webhookData['existing-permits-and-approvals'] || [];
  if (permitsAndApprovals && Array.isArray(permitsAndApprovals)) {
    console.log('Processing permits and approvals with', permitsAndApprovals.length, 'items');
    const permits = permitsAndApprovals.map(item => ({
      project_financing_data_id: projectFinancingId,
      document_id: item.document_id || item.documentId || item['document-id'] || null,
      permit_or_approval_document_name: item.permit_or_approval_document_name || item.permitOrApprovalDocumentName || item['permit-or-approval-document-name'] || null,
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
  const contractualTerms = webhookData.contractual_term_and_risk_assessment || webhookData.contractualTermAndRiskAssessment || webhookData['contractual-term-and-risk-assessment'] || [];
  if (contractualTerms && Array.isArray(contractualTerms)) {
    console.log('Processing contractual terms with', contractualTerms.length, 'items');
    const terms = contractualTerms.map(item => ({
      project_financing_data_id: projectFinancingId,
      risk_assessment: item.risk_assessment || item.riskAssessment || item['risk-assessment'] || null,
      contractual_clause: item.contractual_clause || item.contractualClause || item['contractual-clause'] || null,
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

  const relatedDataEnd = Date.now();
  const relatedDataDuration = relatedDataEnd - relatedDataStart;
  console.log(`⏱️  Supabase related tables (drawdowns, permits, terms): ${relatedDataDuration}ms`);
  
  const totalSupabaseTime = Date.now() - supabaseInsertStart;
  console.log(`⏱️  Total Supabase operation time: ${totalSupabaseTime}ms`);
  
  return financingData;
}
