const axios = require('axios');

async function runTests() {
  const baseURL = process.env.BASE_URL || 'http://localhost:5000/api';
  
  try {
    console.log('--- Testing Create ---');
    const problemData = {
      questionNumber: 1,
      questionName: 'Two Sum',
      approach: 'Use a hash map to store the complements.'
    };
    const problemRes = await axios.post(`${baseURL}/problems`, problemData);
    
    console.log('Problem logged successfully:');
    console.log(JSON.stringify(problemRes.data, null, 2));

    console.log('\n--- Testing Read All ---');
    const listRes = await axios.get(`${baseURL}/problems`);
    console.log(`Fetched ${listRes.data.length} log(s)`);

    console.log('\n--- Testing Read One ---');
    const singleRes = await axios.get(`${baseURL}/problems/${problemRes.data.id}`);
    console.log(`Fetched log ${singleRes.data.id} for ${singleRes.data.questionName}`);

    console.log('\n--- Testing Update ---');
    const updateRes = await axios.put(`${baseURL}/problems/${problemRes.data.id}`, {
      questionNumber: 1,
      questionName: 'Two Sum',
      approach: 'Updated approach text'
    });
    console.log(`Updated log ${updateRes.data.id}`);

    console.log('\n--- Testing Delete ---');
    await axios.delete(`${baseURL}/problems/${problemRes.data.id}`);
    console.log('Delete successful');

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
