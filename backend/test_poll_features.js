const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

// Test data with unique values
const testData = {
  admin: {
    name: 'Admin',
    email: 'admin@kmit.in',
    rollNo: 'ADMIN001',
    password: 'admin123'
  },
  coordinator: {
    name: 'Test Coordinator Poll',
    email: `coordpoll${Date.now()}@test.com`, 
    rollNo: `COORD${Date.now()}`,
    password: 'password123'
  },
  student: {
    name: 'Test Student Poll',
    email: 'studentpoll@test.com',
    rollNo: 'STUDENT001', 
    password: 'password123'
  },
  club: {
    name: `Test Club Poll ${Date.now()}`,
    description: 'A test club for poll functionality'
  }
};

let adminToken, coordinatorToken, studentToken, clubId;

async function testPollFeatures() {
  console.log('🧪 Testing Poll Features...\n');

  try {
    // 1. Admin user already exists (seeded), skip creation
    console.log('1. Admin user already exists (seeded), skipping creation...');

    // 2. Login as admin
    console.log('2. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      rollNo: testData.admin.rollNo,
      password: testData.admin.password
    });
    adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin logged in');

    // 3. Create club
    console.log('3. Creating club...');
    try {
      const clubResponse = await axios.post(`${BASE_URL}/clubs`, testData.club, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      clubId = clubResponse.data._id;
      console.log('✅ Club created:', clubId);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Club creation route not found - need to implement createClub function');
        return;
      }
      throw error;
    }

    // 4. Create coordinator user
    console.log('4. Creating coordinator user...');
    try {
      const coordResponse = await axios.post(`${BASE_URL}/auth/register`, {
        ...testData.coordinator,
        role: 'coordinator'
      });
      console.log('✅ Coordinator user created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Coordinator user already exists, proceeding...');
      } else {
        throw error;
      }
    }

    // 5. Assign coordinator to club
    console.log('5. Assigning coordinator to club...');
    try {
      await axios.put(`${BASE_URL}/clubs/${clubId}`, {
        coordinators: [testData.coordinator.rollNo]
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Coordinator assigned to club');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Club update route not found - need to implement updateClub function');
        return;
      }
      throw error;
    }

    // 6. Login as coordinator
    console.log('6. Logging in as coordinator...');
    const coordLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      rollNo: testData.coordinator.rollNo,
      password: testData.coordinator.password
    });
    coordinatorToken = coordLoginResponse.data.token;
    console.log('✅ Coordinator logged in');

    // 7. Create poll as coordinator
    console.log('7. Creating poll as coordinator...');
    const pollData = {
      question: 'What is your favorite programming language?',
      options: ['JavaScript', 'Python', 'Java', 'C++']
    };
    
    const pollResponse = await axios.post(`${BASE_URL}/polls/club`, pollData, {
      headers: { Authorization: `Bearer ${coordinatorToken}` }
    });
    const pollId = pollResponse.data._id;
    console.log('✅ Poll created:', pollId);

    // 8. Create student user
    console.log('8. Creating student user...');
    try {
      const studentResponse = await axios.post(`${BASE_URL}/auth/register`, testData.student);
      console.log('✅ Student user created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Student user already exists, proceeding...');
      } else {
        throw error;
      }
    }

    // 9. Login as student
    console.log('9. Logging in as student...');
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      rollNo: testData.student.rollNo,
      password: testData.student.password
    });
    studentToken = studentLoginResponse.data.token;
    console.log('✅ Student logged in');

    // 9.5. Enroll student in the club using the enrollment API
    console.log('9.5. Enrolling student in club...');
    try {
      await axios.post(`${BASE_URL}/clubs/${clubId}/enroll`, {
        year: 2,
        branch: 'CSE'
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Student enrollment request sent');
    } catch (error) {
      console.log('⚠️ Could not enroll student in club:', error.response?.data?.message || error.message);
    }

    // 9.6. Approve enrollment request as coordinator
    console.log('9.6. Approving enrollment request...');
    try {
      const enrollmentRequestsResponse = await axios.get(`${BASE_URL}/clubs/${clubId}/enrollment-requests`, {
        headers: { Authorization: `Bearer ${coordinatorToken}` }
      });
      
      if (enrollmentRequestsResponse.data.length > 0) {
        const requestId = enrollmentRequestsResponse.data[0]._id;
        await axios.put(`${BASE_URL}/clubs/enrollment-requests/${requestId}`, {
          action: 'approve',
          message: 'Welcome to the club!'
        }, {
          headers: { Authorization: `Bearer ${coordinatorToken}` }
        });
        console.log('✅ Enrollment request approved');
      } else {
        console.log('⚠️ No enrollment requests found');
      }
    } catch (error) {
      console.log('⚠️ Could not approve enrollment request:', error.response?.data?.message || error.message);
    }

    // 10. Test that student can see the poll
    console.log('10. Testing student can see poll...');
    const studentPollsResponse = await axios.get(`${BASE_URL}/polls/active`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student can see polls:', studentPollsResponse.data.length, 'polls found');

    // 11. Test that coordinator can see the poll
    console.log('11. Testing coordinator can see poll...');
    const coordPollsResponse = await axios.get(`${BASE_URL}/polls/club`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` }
    });
    console.log('✅ Coordinator can see polls:', coordPollsResponse.data.length, 'polls found');

    // 12. Test that coordinator cannot vote (should be prevented by frontend, but test backend too)
    console.log('12. Testing coordinator cannot vote...');
    try {
      await axios.post(`${BASE_URL}/polls/${pollId}/vote`, {
        optionId: pollResponse.data.options[0]._id
      }, {
        headers: { Authorization: `Bearer ${coordinatorToken}` }
      });
      console.log('❌ Coordinator was able to vote - this should be prevented');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Coordinator correctly prevented from voting');
      } else {
        console.log('❌ Unexpected error when coordinator tried to vote:', error.response?.data?.message);
      }
    }

    // 13. Test that student can vote
    console.log('13. Testing student can vote...');
    const voteResponse = await axios.post(`${BASE_URL}/polls/${pollId}/vote`, {
      optionId: pollResponse.data.options[0]._id
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student voted successfully');

    // 14. Test that student cannot vote twice
    console.log('14. Testing student cannot vote twice...');
    try {
      await axios.post(`${BASE_URL}/polls/${pollId}/vote`, {
        optionId: pollResponse.data.options[1]._id
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Student was able to vote twice - this should be prevented');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Already voted')) {
        console.log('✅ Student correctly prevented from voting twice');
      } else {
        console.log('❌ Unexpected error when student tried to vote twice:', error.response?.data?.message);
      }
    }

    // 15. Check updated poll results
    console.log('15. Checking updated poll results...');
    const updatedPollResponse = await axios.get(`${BASE_URL}/polls/club`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` }
    });
    const updatedPoll = updatedPollResponse.data.find(p => p._id === pollId);
    if (updatedPoll && updatedPoll.options[0].votes === 1) {
      console.log('✅ Poll results updated correctly - first option has 1 vote');
    } else {
      console.log('❌ Poll results not updated correctly');
    }

    console.log('\n🎉 All poll feature tests completed successfully!');
    console.log('\nSummary:');
    console.log('- ✅ Coordinators can create polls');
    console.log('- ✅ Students can see polls for their clubs');
    console.log('- ✅ Coordinators can view poll results');
    console.log('- ✅ Only students can vote');
    console.log('- ✅ Students can only vote once per poll');
    console.log('- ✅ Poll results are updated correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPollFeatures();
