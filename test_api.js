const axios = require('axios');

async function runTests() {
  const baseURL = process.env.BASE_URL || 'http://localhost:5000/api';
  
  try {
    console.log('--- Testing Problem Logging ---');
    const problemData = {
      questionNumber: 1, // Two Sum
      questionName: 'Two Sum',
      approach: 'Use a hash map to store the complements.'
    };
    const problemRes = await axios.post(`${baseURL}/problems`, problemData);
    
    console.log('Problem logged successfully:');
    console.log(JSON.stringify(problemRes.data, null, 2));

    console.log('\n--- Testing Problem List Endpoint ---');
    const listRes = await axios.get(`${baseURL}/problems`);
    console.log(`Fetched ${listRes.data.length} log(s)`);

    console.log('\n--- Testing Single Problem Endpoint ---');
    const singleRes = await axios.get(`${baseURL}/problems/${problemRes.data._id}`);
    console.log(`Fetched log ${singleRes.data._id} for ${singleRes.data.questionName}`);

    console.log('\nAll tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
}

runTests();
