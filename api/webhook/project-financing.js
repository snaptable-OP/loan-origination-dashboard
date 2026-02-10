// Dedicated endpoint for project financing data
import { transformDataWithSnaptable, processProjectFinancingData } from '../shared.js';

// Wrap in try-catch to handle import errors
export default async function handler(req, res) {
  // Early error handling for missing environment variables
  if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
    console.error('❌ Missing Supabase environment variables');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Missing Supabase credentials',
      message: 'Please check Vercel environment variables'
    });
  }
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
    const startTime = Date.now();
    const webhookData = req.body;
    const timestamp = new Date().toISOString();
    
    // Enhanced logging for Vercel
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', timestamp);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const receiveTime = Date.now();
    const timeToReceive = receiveTime - startTime;
    console.log(`⏱️  Time to receive: ${timeToReceive}ms`);
    
    // Step 1: Send JSON data to Snaptable data transformer API
    const snaptableStartTime = Date.now();
    let transformedData;
    let snaptableDuration = 0;
    try {
      transformedData = await transformDataWithSnaptable(webhookData);
      const snaptableEndTime = Date.now();
      snaptableDuration = snaptableEndTime - snaptableStartTime;
      console.log(`⏱️  Snaptable transformation: ${snaptableDuration}ms`);
      console.log('Data transformed by Snaptable:', transformedData);
    } catch (snaptableError) {
      const snaptableEndTime = Date.now();
      snaptableDuration = snaptableEndTime - snaptableStartTime;
      console.error(`⏱️  Snaptable failed after: ${snaptableDuration}ms`);
      console.error('Snaptable transformation failed, proceeding with original data:', snaptableError);
    }
    
    const dataToProcess = transformedData || webhookData;
    
    // Step 2: Save to Supabase
    const supabaseStartTime = Date.now();
    console.log('Processing data to save to Supabase...');
    
    const financingData = await processProjectFinancingData(dataToProcess);
    
    const supabaseEndTime = Date.now();
    const supabaseDuration = supabaseEndTime - supabaseStartTime;
    console.log(`⏱️  Supabase save: ${supabaseDuration}ms`);
    console.log('✅ Successfully saved to Supabase:', financingData.id);
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  TOTAL PROCESSING TIME: ${totalTime}ms`);
    console.log(`   - Receive: ${timeToReceive}ms`);
    console.log(`   - Snaptable: ${snaptableDuration}ms`);
    console.log(`   - Supabase: ${supabaseDuration}ms`);
    
    return res.status(200).json({
      success: true,
      message: 'Project financing data received, transformed, and saved successfully',
      timestamp: new Date().toISOString(),
      project_financing_data: financingData,
      snaptable_transformed: !!transformedData,
      performance: {
        total_time_ms: totalTime,
        receive_time_ms: timeToReceive,
        snaptable_time_ms: snaptableDuration,
        supabase_time_ms: supabaseDuration
      }
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
