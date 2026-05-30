const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const AITaskService = require('../services/aiTaskService');

async function run() {
  console.log('AI_PROVIDER:', process.env.AI_PROVIDER || 'openai');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

  const sampleTitle = 'Launch marketing campaign for new product';
  const sampleDesc = 'Coordinate assets, set timeline, create social posts, and run analytics for a successful launch.';

  console.log('\n== Testing breakDownTask ==');
  try {
    const subtasks = await AITaskService.breakDownTask(sampleTitle, sampleDesc);
    console.log('breakDownTask result:', JSON.stringify(subtasks, null, 2));
  } catch (err) {
    console.error('breakDownTask error:', err);
  }

  console.log('\n== Testing suggestPriority ==');
  try {
    const priority = await AITaskService.suggestPriority(sampleTitle, sampleDesc);
    console.log('suggestPriority result:', priority);
  } catch (err) {
    console.error('suggestPriority error:', err);
  }

  console.log('\n== Testing estimateTime ==');
  try {
    const hours = await AITaskService.estimateTime(sampleTitle, sampleDesc);
    console.log('estimateTime result (hours):', hours);
  } catch (err) {
    console.error('estimateTime error:', err);
  }

  console.log('\n== Testing parseNaturalLanguage ==');
  try {
    const parsed = await AITaskService.parseNaturalLanguage('Plan the Q3 product launch: create milestones, assign tasks, and prepare marketing materials.');
    console.log('parseNaturalLanguage result:', JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error('parseNaturalLanguage error:', err);
  }
}

run().then(() => console.log('\nDone')).catch((e) => { console.error(e); process.exit(1); });
