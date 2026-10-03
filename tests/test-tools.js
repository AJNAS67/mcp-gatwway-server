import { handleStudentData } from '../src/tools/studentTool.js';
import { handleJobList } from '../src/tools/jobTool.js';

async function runTests() {
  console.log('====================================================');
  console.log('🔍 RUNNING MCP GATEWAY SERVER INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Student Tool - Stats Overview
  try {
    console.log('Test 1: studentTool -> stats overview');
    const result = await handleStudentData({ getStats: true });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.data && parsed.data.totalCandidates > 0) {
      console.log(`✅ Success: Total candidates recorded = ${parsed.data.totalCandidates}`);
      passed++;
    } else {
      throw new Error(`Unexpected response: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 1 Failed: ${err.message}`);
    failed++;
  }

  // Test 2: Student Tool - Search & Filter
  try {
    console.log('\nTest 2: studentTool -> search candidates (category: "Cyber Security", limit: 2)');
    const result = await handleStudentData({ category: 'Cyber Security', limit: 2 });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.candidates && parsed.candidates.length > 0) {
      console.log(`✅ Success: Found ${parsed.candidates.length} candidates. First: ${parsed.candidates[0].name} (${parsed.candidates[0].role})`);
      passed++;
    } else {
      throw new Error(`Unexpected candidates count: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 2 Failed: ${err.message}`);
    failed++;
  }

  // Test 3: Student Tool - Single Candidate by ID
  try {
    console.log('\nTest 3: studentTool -> fetch candidate by ID (id: "CAND-001")');
    const result = await handleStudentData({ id: 'CAND-001' });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.candidate && parsed.candidate.id === 'CAND-001') {
      console.log(`✅ Success: Loaded ${parsed.candidate.name}, College: ${parsed.candidate.college}`);
      passed++;
    } else {
      throw new Error(`Candidate not found: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 3 Failed: ${err.message}`);
    failed++;
  }

  // Test 4: Job Tool - Stats Overview
  try {
    console.log('\nTest 4: jobTool -> stats overview');
    const result = await handleJobList({ getStats: true });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.data && parsed.data.totalJobs > 0) {
      console.log(`✅ Success: Total jobs recorded = ${parsed.data.totalJobs}, Total vacancies = ${parsed.data.totalVacancies}`);
      passed++;
    } else {
      throw new Error(`Unexpected response: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 4 Failed: ${err.message}`);
    failed++;
  }

  // Test 5: Job Tool - Search & Filter
  try {
    console.log('\nTest 5: jobTool -> search jobs (category: "MERN Stack", limit: 2)');
    const result = await handleJobList({ category: 'MERN Stack', limit: 2 });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.jobs && parsed.jobs.length > 0) {
      console.log(`✅ Success: Found ${parsed.jobs.length} jobs. First: "${parsed.jobs[0].title}" at ${parsed.jobs[0].company.name}`);
      passed++;
    } else {
      throw new Error(`Unexpected jobs count: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 5 Failed: ${err.message}`);
    failed++;
  }

  // Test 6: Job Tool - Single Job by ID
  try {
    console.log('\nTest 6: jobTool -> fetch job by ID (id: "JOB-001")');
    const result = await handleJobList({ id: 'JOB-001' });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.job && parsed.job.id === 'JOB-001') {
      console.log(`✅ Success: Loaded "${parsed.job.title}", HR: ${parsed.job.contactDetails.hrName}`);
      passed++;
    } else {
      throw new Error(`Job not found: ${result.content[0].text}`);
    }
  } catch (err) {
    console.error(`❌ Test 6 Failed: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
