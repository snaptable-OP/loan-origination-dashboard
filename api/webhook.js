// Main webhook endpoint - auto-detects data type
import { transformDataWithSnaptable, processProjectFinancingData, mapWebhookDataToApplication } from './shared.js';
import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    
    console.log('Webhook received at:', new Date().toISOString());
    console.log('Received data:', JSON.stringify(webhookData, null, 2));
    
    // Step 1: Send JSON data to Snaptable data transformer API
    let transformedData;
    try {
      transformedData = await transformDataWithSnaptable(webhookData);
      console.log('Data transformed by Snaptable:', transformedData);
    } catch (snaptableError) {
      console.error('Snaptable transformation failed, proceeding with original data:', snaptableError);
    }
    
    const dataToProcess = transformedData || webhookData;
    
    // Check if this is project financing data
    const isProjectFinancingData = dataToProcess.hasOwnProperty('loan_to_value_ratio') || 
                                   dataToProcess.hasOwnProperty('drawdown_schedule') ||
                                   dataToProcess.hasOwnProperty('as_is_valuation_of_project');

    if (isProjectFinancingData) {
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
    
    if (!applicationData.applicant_name || !applicationData.email || !applicationData.loan_type || !applicationData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: applicant_name, email, loan_type, and amount are required',
        receivedData: webhookData
      });
    }
    
    const { data, error } = await supabase
      .from('loan_applications')
      .insert([applicationData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      
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
    
    return res.status(200).json({
      success: true,
      message: 'Webhook received and saved successfully',
      timestamp: new Date().toISOString(),
      application: data
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
}
