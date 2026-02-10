import express from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Snaptable API configuration
const SNAPTABLE_API_URL = process.env.SNAPTABLE_API_URL || 'https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f';
const SNAPTABLE_API_TOKEN = process.env.SNAPTABLE_API_TOKEN || 'st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj';

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Helper function to generate application ID
function generateApplicationId() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `LO-${year}-${timestamp}`;
}

// Helper function to map webhook data to database schema
function mapWebhookDataToApplication(webhookData) {
  // Generate application ID if not provided
  const applicationId = webhookData.application_id || webhookData.applicationId || generateApplicationId();
  
  // Map the data fields (supports both snake_case and camelCase)
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
async function transformDataWithSnaptable(jsonData) {
  try {
    // Convert JSON to text (stringified JSON)
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
    
    // Return the transformed data
    // Assuming Snaptable returns structured JSON that matches our schema
    return result;
  } catch (error) {
    console.error('Error calling Snaptable API:', error);
    throw error;
  }
}

// Helper function to process project financing data
async function processProjectFinancingData(webhookData, loanApplicationId = null) {
  // Extract main project financing data
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

  // Insert project financing data
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

// Webhook endpoint to receive JSON data
app.post('/api/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Log the received data
    console.log('Webhook received at:', new Date().toISOString());
    console.log('Received data:', JSON.stringify(webhookData, null, 2));
    
    // Step 1: Send JSON data to Snaptable data transformer API
    let transformedData;
    try {
      transformedData = await transformDataWithSnaptable(webhookData);
      console.log('Data transformed by Snaptable:', transformedData);
    } catch (snaptableError) {
      console.error('Snaptable transformation failed, proceeding with original data:', snaptableError);
      // Continue with original data if Snaptable fails
    }
    
    // Use transformed data if available, otherwise use original
    const dataToProcess = transformedData || webhookData;
    
    // Check if this is project financing data (has loan_to_value_ratio)
    const isProjectFinancingData = dataToProcess.hasOwnProperty('loan_to_value_ratio') || 
                                   dataToProcess.hasOwnProperty('drawdown_schedule') ||
                                   dataToProcess.hasOwnProperty('as_is_valuation_of_project');

    if (isProjectFinancingData) {
      // Process as project financing data
      const financingData = await processProjectFinancingData(dataToProcess);
      
      return res.status(200).json({
        success: true,
        message: 'Project financing data received, transformed, and saved successfully',
        timestamp: new Date().toISOString(),
        project_financing_data: financingData,
        snaptable_transformed: !!transformedData
      });
    }

    // Otherwise, process as regular loan application
    const applicationData = mapWebhookDataToApplication(dataToProcess);
    
    // Validate required fields
    if (!applicationData.applicant_name || !applicationData.email || !applicationData.loan_type || !applicationData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: applicant_name, email, loan_type, and amount are required',
        receivedData: webhookData
      });
    }
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('loan_applications')
      .insert([applicationData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      
      // Handle duplicate application_id error
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Application with this ID already exists',
          error: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error saving to database',
        error: error.message
      });
    }
    
    console.log('Application saved successfully:', data);
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'Webhook received and saved successfully',
      timestamp: new Date().toISOString(),
      application: data
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// Dedicated endpoint for project financing data
app.post('/api/webhook/project-financing', async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('Project financing webhook received at:', new Date().toISOString());
    console.log('Received data:', JSON.stringify(webhookData, null, 2));
    
    // Step 1: Send JSON data to Snaptable data transformer API
    let transformedData;
    try {
      transformedData = await transformDataWithSnaptable(webhookData);
      console.log('Data transformed by Snaptable:', transformedData);
    } catch (snaptableError) {
      console.error('Snaptable transformation failed, proceeding with original data:', snaptableError);
    }
    
    // Use transformed data if available, otherwise use original
    const dataToProcess = transformedData || webhookData;
    
    const financingData = await processProjectFinancingData(dataToProcess);
    
    return res.status(200).json({
      success: true,
      message: 'Project financing data received, transformed, and saved successfully',
      timestamp: new Date().toISOString(),
      project_financing_data: financingData,
      snaptable_transformed: !!transformedData
    });
  } catch (error) {
    console.error('Error processing project financing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing project financing webhook',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint to verify webhook is accessible
app.get('/api/webhook/test', (req, res) => {
  res.status(200).json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    endpoints: {
      main: '/api/webhook',
      project_financing: '/api/webhook/project-financing',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
  console.log(`Project financing endpoint: http://localhost:${PORT}/api/webhook/project-financing`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/webhook/test`);
});
