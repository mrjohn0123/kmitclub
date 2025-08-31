const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUsers = {
  coordinator: {
    email: 'coordinator@test.com',
    password: 'password123',
    name: 'Test Coordinator',
    rollNo: 'COORD001',
    role: 'coordinator'
  },
  student1: {
    email: 'student1@test.com',
    password: 'password123',
    name: 'Test Student 1',
    rollNo: 'STU001',
    role: 'student'
  },
  student2: {
    email: 'student2@test.com',
    password: 'password123',
    name: 'Test Student 2',
    rollNo: 'STU002',
    role: 'student'
  }
};

let tokens = {};
let clubId = null;
let pollId = null;

// Helper function to make authenticated requests
const authRequest = (method, url, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(data && { data })
  };
  return axios(config);
};

// Test functions
async function testUserRegistration() {
  console.log('\n=== Testing User Registration ===');
  
  try {
    // Register coordinator
    const coordResponse = await authRequest('POST', '/auth/signup', testUsers.coordinator);
    console.log('✅ Coordinator registered:', coordResponse.data.message);
    
    // Register students
    const student1Response = await authRequest('POST', '/auth/signup', testUsers.student1);
    console.log('✅ Student 1 registered:', student1Response.data.message);
    
    const student2Response = await authRequest('POST', '/auth/signup', testUsers.student2);
    console.log('✅ Student 2 registered:', student2Response.data.message);
    
  } catch (error) {
    console.log('❌ Registration error:', error.response?.data?.message || error.message);
  }
}

async function testUserLogin() {
  console.log('\n=== Testing User Login ===');
  
  try {
    // Login coordinator
    const coordLogin = await authRequest('POST', '/auth/login', {
      email: testUsers.coordinator.email,
      password: testUsers.coordinator.password
    });
    tokens.coordinator = coordLogin.data.token;
    console.log('✅ Coordinator logged in');
    
    // Login students
    const student1Login = await authRequest('POST', '/auth/login', {
      email: testUsers.student1.email,
      password: testUsers.student1.password
    });
    tokens.student1 = student1Login.data.token;
    console.log('✅ Student 1 logged in');
    
    const student2Login = await authRequest('POST', '/auth/login', {
      email: testUsers.student2.email,
      password: testUsers.student2.password
    });
    tokens.student2 = student2Login.data.token;
    console.log('✅ Student 2 logged in');
    
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
  }
}

async function testClubCreation() {
  console.log('\n=== Testing Club Creation ===');
  
  try {
    // Create a test club
    const clubData = {
      name: 'Test Club',
      description: 'A test club for polling',
      category: 'Technical',
      clubKey: 'TEST123'
    };
    
    const clubResponse = await authRequest('POST', '/clubs', clubData, tokens.coordinator);
    clubId = clubResponse.data._id;
    console.log('✅ Club created:', clubResponse.data.name);
    
  } catch (error) {
    console.log('❌ Club creation error:', error.response?.data?.message || error.message);
  }
}

async function testAssignCoordinatorToClub() {
  console.log('\n=== Testing Coordinator Assignment ===');
  
  try {
    // Get coordinator user ID from token
    const coordUserResponse = await authRequest('GET', '/auth/me', null, tokens.coordinator);
    const coordinatorId = coordUserResponse.data._id;
    
    // Add coordinator to club
    const updateResponse = await authRequest('PUT', `/clubs/${clubId}`, {
      coordinators: [coordinatorId]
    }, tokens.coordinator);
    
    console.log('✅ Coordinator assigned to club');
    
  } catch (error) {
    console.log('❌ Coordinator assignment error:', error.response?.data?.message || error.message);
  }
}

async function testPollCreation() {
  console.log('\n=== Testing Poll Creation ===');
  
  try {
    const pollData = {
      question: 'What is your favorite programming language?',
      options: ['JavaScript', 'Python', 'Java', 'C++']
    };
    
    const pollResponse = await authRequest('POST', '/polls/club', pollData, tokens.coordinator);
    pollId = pollResponse.data._id;
    console.log('✅ Poll created:', pollResponse.data.question);
    console.log('   Options:', pollResponse.data.options.map(opt => opt.text));
    
  } catch (error) {
    console.log('❌ Poll creation error:', error.response?.data?.message || error.message);
  }
}

async function testPollVisibility() {
  console.log('\n=== Testing Poll Visibility ===');
  
  try {
    // Check if students can see the poll (should be empty initially as they're not club members)
    const student1Polls = await authRequest('GET', '/polls/active', null, tokens.student1);
    console.log('📊 Student 1 can see polls:', student1Polls.data.length);
    
    const student2Polls = await authRequest('GET', '/polls/active', null, tokens.student2);
    console.log('📊 Student 2 can see polls:', student2Polls.data.length);
    
    // Check if coordinator can see the poll
    const coordPolls = await authRequest('GET', '/polls/club', null, tokens.coordinator);
    console.log('📊 Coordinator can see polls:', coordPolls.data.length);
    
  } catch (error) {
    console.log('❌ Poll visibility error:', error.response?.data?.message || error.message);
  }
}

async function testEnrollStudentsInClub() {
  console.log('\n=== Testing Student Enrollment ===');
  
  try {
    // Open enrollment for the club
    await authRequest('POST', `/clubs/${clubId}/toggle-enrollment`, {}, tokens.coordinator);
    console.log('✅ Club enrollment opened');
    
    // Enroll student 1
    const enroll1Response = await authRequest('POST', `/clubs/${clubId}/enroll`, {
      year: 2,
      branch: 'CSE'
    }, tokens.student1);
    console.log('✅ Student 1 enrollment request sent');
    
    // Enroll student 2
    const enroll2Response = await authRequest('POST', `/clubs/${clubId}/enroll`, {
      year: 3,
      branch: 'IT'
    }, tokens.student2);
    console.log('✅ Student 2 enrollment request sent');
    
    // Approve enrollment requests
    const requestsResponse = await authRequest('GET', `/clubs/${clubId}/enrollment-requests`, null, tokens.coordinator);
    const requests = requestsResponse.data;
    
    for (const request of requests) {
      await authRequest('PUT', `/clubs/enrollment-requests/${request._id}`, {
        action: 'approve',
        message: 'Welcome to the club!'
      }, tokens.coordinator);
      console.log(`✅ Approved enrollment for ${request.student.name}`);
    }
    
  } catch (error) {
    console.log('❌ Enrollment error:', error.response?.data?.message || error.message);
  }
}

async function testPollVisibilityAfterEnrollment() {
  console.log('\n=== Testing Poll Visibility After Enrollment ===');
  
  try {
    // Check if students can now see the poll
    const student1Polls = await authRequest('GET', '/polls/active', null, tokens.student1);
    console.log('📊 Student 1 can now see polls:', student1Polls.data.length);
    if (student1Polls.data.length > 0) {
      console.log('   Poll question:', student1Polls.data[0].question);
    }
    
    const student2Polls = await authRequest('GET', '/polls/active', null, tokens.student2);
    console.log('📊 Student 2 can now see polls:', student2Polls.data.length);
    if (student2Polls.data.length > 0) {
      console.log('   Poll question:', student2Polls.data[0].question);
    }
    
  } catch (error) {
    console.log('❌ Poll visibility error:', error.response?.data?.message || error.message);
  }
}

async function testVoting() {
  console.log('\n=== Testing Voting ===');
  
  try {
    // Student 1 votes for JavaScript
    const student1Polls = await authRequest('GET', '/polls/active', null, tokens.student1);
    const poll = student1Polls.data[0];
    const javascriptOption = poll.options.find(opt => opt.text === 'JavaScript');
    
    const vote1Response = await authRequest('POST', `/polls/${poll._id}/vote`, {
      optionId: javascriptOption._id
    }, tokens.student1);
    console.log('✅ Student 1 voted for JavaScript');
    
    // Student 2 votes for Python
    const student2Polls = await authRequest('GET', '/polls/active', null, tokens.student2);
    const poll2 = student2Polls.data[0];
    const pythonOption = poll2.options.find(opt => opt.text === 'Python');
    
    const vote2Response = await authRequest('POST', `/polls/${poll2._id}/vote`, {
      optionId: pythonOption._id
    }, tokens.student2);
    console.log('✅ Student 2 voted for Python');
    
    // Try to vote again with student 1 (should fail)
    try {
      await authRequest('POST', `/polls/${poll._id}/vote`, {
        optionId: pythonOption._id
      }, tokens.student1);
      console.log('❌ Student 1 was able to vote twice (should have failed)');
    } catch (error) {
      console.log('✅ Student 1 correctly prevented from voting twice');
    }
    
    // Try to vote with coordinator (should fail)
    try {
      await authRequest('POST', `/polls/${poll._id}/vote`, {
        optionId: javascriptOption._id
      }, tokens.coordinator);
      console.log('❌ Coordinator was able to vote (should have failed)');
    } catch (error) {
      console.log('✅ Coordinator correctly prevented from voting');
    }
    
  } catch (error) {
    console.log('❌ Voting error:', error.response?.data?.message || error.message);
  }
}

async function testPollResults() {
  console.log('\n=== Testing Poll Results ===');
  
  try {
    // Check results from coordinator view
    const coordPolls = await authRequest('GET', '/polls/club', null, tokens.coordinator);
    const poll = coordPolls.data[0];
    
    console.log('📊 Poll Results (Coordinator View):');
    console.log('   Question:', poll.question);
    console.log('   Total votes:', poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
    
    poll.options.forEach(option => {
      console.log(`   ${option.text}: ${option.votes || 0} votes`);
    });
    
    // Check results from student view
    const student1Polls = await authRequest('GET', '/polls/active', null, tokens.student1);
    const studentPoll = student1Polls.data[0];
    
    console.log('📊 Poll Results (Student View):');
    console.log('   Question:', studentPoll.question);
    console.log('   Total votes:', studentPoll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
    
    studentPoll.options.forEach(option => {
      console.log(`   ${option.text}: ${option.votes || 0} votes`);
    });
    
  } catch (error) {
    console.log('❌ Poll results error:', error.response?.data?.message || error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Poll Functionality Tests...\n');
  
  await testUserRegistration();
  await testUserLogin();
  await testClubCreation();
  await testAssignCoordinatorToClub();
  await testPollCreation();
  await testPollVisibility();
  await testEnrollStudentsInClub();
  await testPollVisibilityAfterEnrollment();
  await testVoting();
  await testPollResults();
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests().catch(console.error);
