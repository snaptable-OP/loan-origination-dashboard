// Dedicated endpoint for project financing data
import { transformDataWithSnaptable, processProjectFinancingData } from '../shared.js';

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
    const timestamp = new Date().toISOString();
    
    // Enhanced logging for Vercel
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', timestamp);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body received:', JSON.stringify(webhookData, null, 2));
    console.log('Body type:', typeof webhookData);
    console.log('Body keys:', webhookData ? Object.keys(webhookData) : 'null');
    
    // Step 1: Send JSON data to Snaptable data transformer API
    let transformedData;
    try {
      transformedData = await transformDataWithSnaptable(webhookData);
      console.log('Data transformed by Snaptable:', transformedData);
    } catch (snaptableError) {
      console.error('Snaptable transformation failed, proceeding with original data:', snaptableError);
    }
    
    const dataToProcess = transformedData || webhookData;
    
    console.log('Processing data to save to Supabase...');
    console.log('Data to process:', JSON.stringify(dataToProcess, null, 2));
    
    const financingData = await processProjectFinancingData(dataToProcess);
    
    console.log('✅ Successfully saved to Supabase:', financingData.id);
    
    return res.status(200).json({
      success: true,
      message: 'Project financing data received, transformed, and saved successfully',
      timestamp: new Date().toISOString(),
      project_financing_data: financingData,
      snaptable_transformed: !!transformedData
    });
  } catch (error) {
    console.error('❌ ERROR processing project financing webhook:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    
    return res.status(500).json({
      success: false,
      message: 'Error processing project financing webhook',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
