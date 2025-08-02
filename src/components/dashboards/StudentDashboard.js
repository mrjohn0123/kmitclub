import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.header`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  flex: 1;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserDetails = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const UserRole = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const Content = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const ProfileSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
`;

const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
`;

const ProfileName = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const ProfileDetail = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 3px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get initials for profile image
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'S';
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Student Dashboard</Title>
        <UserInfo>
          <UserDetails>
            <UserName>{user?.name || 'Student'}</UserName>
            <UserRole>Student</UserRole>
          </UserDetails>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      </Header>

      <Content>
        <ProfileSection>
          <ProfileCard>
            <ProfileImage>
              {getInitials(user?.name)}
            </ProfileImage>
            <ProfileName>{user?.name || 'Student Name'}</ProfileName>
            <ProfileDetail>Roll No: {user?.rollNo || 'N/A'}</ProfileDetail>
            <ProfileDetail>Year: {user?.year ? `${user.year}${user.year === '1' ? 'st' : user.year === '2' ? 'nd' : user.year === '3' ? 'rd' : 'th'} Year` : 'N/A'}</ProfileDetail>
            <ProfileDetail>Gender: {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}</ProfileDetail>
            <ProfileDetail>{user?.email || 'email@example.com'}</ProfileDetail>
          </ProfileCard>

          <div>
            <SectionTitle>Academic Overview</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatNumber>3</StatNumber>
                <StatLabel>Clubs Joined</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>7</StatNumber>
                <StatLabel>Events Attended</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>5</StatNumber>
                <StatLabel>Certificates</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>2</StatNumber>
                <StatLabel>Projects</StatLabel>
              </StatCard>
            </StatsGrid>
          </div>
        </ProfileSection>

        <Section>
          <SectionTitle>Student Activities</SectionTitle>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Welcome to your Student Dashboard! Here you can:
          </p>
          <ul style={{ marginTop: '15px', color: '#666', lineHeight: '1.8' }}>
            <li>View and update your profile information</li>
            <li>Join clubs and participate in activities</li>
            <li>Register for events and workshops</li>
            <li>Track your academic progress and achievements</li>
            <li>Connect with fellow students and coordinators</li>
            <li>Access resources and announcements</li>
          </ul>
        </Section>
      </Content>
    </DashboardContainer>
  );
};

export default StudentDashboard;