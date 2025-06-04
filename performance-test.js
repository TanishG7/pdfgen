const axios = require('axios');

// Performance testing configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  concurrentRequests: 10,
  totalRequests: 100,
  timeoutMs: 10000
};

// Sample test data
const testData = {
  projectName: "Performance Test Project",
  projectId: "PERF-TEST-001",
  approvalDate: new Date().toLocaleDateString(),
  budget: "$100,000",
  projectDescription: "This is a performance test for PDF generation optimization. The system should generate PDFs in under 1 second consistently.",
  planningStart: "2025-06-01",
  planningEnd: "2025-06-15",
  devStart: "2025-06-16",
  devEnd: "2025-07-30",
  testStart: "2025-08-01",
  testEnd: "2025-08-15",
  generatedDate: new Date().toLocaleString()
};

async function generatePDF(testId) {
  const startTime = Date.now();

  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/generate-pdf`, {
      data: { ...testData, testId }
    }, {
      timeout: TEST_CONFIG.timeoutMs,
      responseType: 'arraybuffer'  // expecting PDF binary data
    });

    const duration = Date.now() - startTime;
    const sizeKB = Math.round(response.data.length / 1024);

    return {
      testId,
      success: true,
      duration,
      sizeKB,
      statusCode: response.status
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      testId,
      success: false,
      duration,
      error: error.message,
      statusCode: error.response?.status || 'TIMEOUT'
    };
  }
}

async function runPerformanceTest() {
  console.log('🚀 Starting PDF Generation Performance Test');
  console.log(`📊 Configuration:
    - Base URL: ${TEST_CONFIG.baseURL}
    - Total Requests: ${TEST_CONFIG.totalRequests}
    - Concurrent Requests: ${TEST_CONFIG.concurrentRequests}
    - Timeout: ${TEST_CONFIG.timeoutMs}ms
  `);

  const results = [];
  const totalBatches = Math.ceil(TEST_CONFIG.totalRequests / TEST_CONFIG.concurrentRequests);

  for (let batch = 0; batch < totalBatches; batch++) {
    const promises = [];
    for (let i = 0; i < TEST_CONFIG.concurrentRequests; i++) {
      const testId = batch * TEST_CONFIG.concurrentRequests + i + 1;
      if (testId > TEST_CONFIG.totalRequests) break;
      promises.push(generatePDF(testId));
    }
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Optionally log progress after each batch
    console.log(`Batch ${batch + 1}/${totalBatches} completed.`);
  }

  // Summarize results
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / results.length;

  console.log('\n📈 Performance Test Summary:');
  console.log(`Total Requests: ${results.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failures: ${failureCount}`);
  console.log(`Average Duration: ${avgDuration.toFixed(2)} ms`);

  // Optionally print detailed results for failed requests
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log('\nFailed Requests Details:');
    failedResults.forEach(r => {
      console.log(`Test ID: ${r.testId}, Error: ${r.error}, Duration: ${r.duration} ms, StatusCode: ${r.statusCode}`);
    });
  }
}

runPerformanceTest();
