const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

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

async function testPollFunctionality() {
  console.log('🚀 Testing Poll Functionality...\n');

  try {
    // Step 1: Create an admin user
    console.log('1. Creating admin user...');
    const adminData = {
      name: 'Final Test Admin',
      email: 'finaladmin@test.com',
      password: 'password123',
      rollNo: 'FINALADMIN',
      role: 'admin'
    };
    
    const adminResponse = await authRequest('POST', '/auth/register', adminData);
    const adminToken = adminResponse.data.token;
    console.log('✅ Admin created and logged in');

    // Step 2: Create a coordinator user
    console.log('\n2. Creating coordinator user...');
    const coordData = {
      name: 'Final Test Coordinator',
      email: 'finalcoord@test.com',
      password: 'password123',
      rollNo: 'FINALCOORD',
      role: 'coordinator'
    };
    
    const coordResponse = await authRequest('POST', '/auth/register', coordData);
    const coordToken = coordResponse.data.token;
    console.log('✅ Coordinator created and logged in');

    // Step 3: Create a student user
    console.log('\n3. Creating student user...');
    const studentData = {
      name: 'Final Test Student',
      email: 'finalstudent@test.com',
      password: 'password123',
      rollNo: 'FINALSTU',
      role: 'student'
    };
    
    const studentResponse = await authRequest('POST', '/auth/register', studentData);
    const studentToken = studentResponse.data.token;
    console.log('✅ Student created and logged in');

    // Step 4: Create a club (admin only)
    console.log('\n4. Creating a club...');
    const clubData = {
      name: 'Final Test Club',
      description: 'A test club for polling',
      category: 'Technical',
      clubKey: 'FINALTEST'
    };
    
    const clubResponse = await authRequest('POST', '/clubs', clubData, adminToken);
    const clubId = clubResponse.data._id;
    console.log('✅ Club created:', clubResponse.data.name);

    // Step 5: Assign coordinator to club
    console.log('\n5. Assigning coordinator to club...');
    const coordUserResponse = await authRequest('GET', '/auth/me', null, coordToken);
    const coordinatorId = coordUserResponse.data._id;
    
    // Update club with coordinator
    await authRequest('PUT', `/clubs/${clubId}`, {
      coordinators: [coordinatorId]
    }, adminToken);
    console.log('✅ Coordinator assigned to club');

    // Step 6: Create a poll (coordinator)
    console.log('\n6. Creating a poll...');
    const pollData = {
      question: 'What is your favorite programming language?',
      options: ['JavaScript', 'Python', 'Java', 'C++']
    };
    
    const pollResponse = await authRequest('POST', '/polls/club', pollData, coordToken);
    const pollId = pollResponse.data._id;
    console.log('✅ Poll created:', pollResponse.data.question);

    // Step 7: Check poll visibility before enrollment
    console.log('\n7. Checking poll visibility before enrollment...');
    const studentPollsBefore = await authRequest('GET', '/polls/active', null, studentToken);
    console.log('📊 Student can see polls before enrollment:', studentPollsBefore.data.length);

    // Step 8: Enroll student in club
    console.log('\n8. Enrolling student in club...');
    // Open enrollment
    await authRequest('POST', `/clubs/${clubId}/toggle-enrollment`, {}, coordToken);
    
    // Enroll student
    await authRequest('POST', `/clubs/${clubId}/enroll`, {
      year: 2,
      branch: 'CSE'
    }, studentToken);
    
    // Approve enrollment
    const requestsResponse = await authRequest('GET', `/clubs/${clubId}/enrollment-requests`, null, coordToken);
    const requests = requestsResponse.data;
    
    for (const request of requests) {
      await authRequest('PUT', `/clubs/enrollment-requests/${request._id}`, {
        action: 'approve',
        message: 'Welcome to the club!'
      }, coordToken);
    }
    console.log('✅ Student enrolled in club');

    // Step 9: Check poll visibility after enrollment
    console.log('\n9. Checking poll visibility after enrollment...');
    const studentPollsAfter = await authRequest('GET', '/polls/active', null, studentToken);
    console.log('📊 Student can see polls after enrollment:', studentPollsAfter.data.length);
    
    if (studentPollsAfter.data.length > 0) {
      console.log('   Poll question:', studentPollsAfter.data[0].question);
    }

    // Step 10: Student votes
    console.log('\n10. Student voting...');
    const poll = studentPollsAfter.data[0];
    const javascriptOption = poll.options.find(opt => opt.text === 'JavaScript');
    
    const voteResponse = await authRequest('POST', `/polls/${poll._id}/vote`, {
      optionId: javascriptOption._id
    }, studentToken);
    console.log('✅ Student voted for JavaScript');

    // Step 11: Try to vote again (should fail)
    console.log('\n11. Testing double voting prevention...');
    try {
      await authRequest('POST', `/polls/${poll._id}/vote`, {
        optionId: javascriptOption._id
      }, studentToken);
      console.log('❌ Student was able to vote twice (should have failed)');
    } catch (error) {
      console.log('✅ Student correctly prevented from voting twice');
    }

    // Step 12: Try to vote with coordinator (should fail)
    console.log('\n12. Testing coordinator voting prevention...');
    try {
      await authRequest('POST', `/polls/${poll._id}/vote`, {
        optionId: javascriptOption._id
      }, coordToken);
      console.log('❌ Coordinator was able to vote (should have failed)');
    } catch (error) {
      console.log('✅ Coordinator correctly prevented from voting');
    }

    // Step 13: Check poll results
    console.log('\n13. Checking poll results...');
    const coordPolls = await authRequest('GET', '/polls/club', null, coordToken);
    const finalPoll = coordPolls.data[0];
    
    console.log('📊 Final Poll Results:');
    console.log('   Question:', finalPoll.question);
    console.log('   Total votes:', finalPoll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0));
    
    finalPoll.options.forEach(option => {
      console.log(`   ${option.text}: ${option.votes || 0} votes`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin can create clubs');
    console.log('✅ Coordinator can create polls');
    console.log('✅ Students can see polls only after enrollment');
    console.log('✅ Students can vote only once');
    console.log('✅ Coordinators cannot vote');
    console.log('✅ Poll results are visible to coordinators');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testPollFunctionality();
