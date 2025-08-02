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
  justify-content: between;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        <UserInfo>
          <UserDetails>
            <UserName>{user?.name || 'Admin User'}</UserName>
            <UserRole>Administrator</UserRole>
          </UserDetails>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      </Header>

      <Content>
        <Section>
          <SectionTitle>System Overview</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatNumber>156</StatNumber>
              <StatLabel>Total Students</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>12</StatNumber>
              <StatLabel>Club Coordinators</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>8</StatNumber>
              <StatLabel>Active Clubs</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>24</StatNumber>
              <StatLabel>Pending Requests</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>

        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Welcome to the Admin Dashboard! Here you can manage the entire system:
          </p>
          <ul style={{ marginTop: '15px', color: '#666', lineHeight: '1.8' }}>
            <li>Manage student registrations and profiles</li>
            <li>Oversee club coordinator activities</li>
            <li>Monitor system-wide activities and reports</li>
            <li>Configure system settings and permissions</li>
            <li>Generate reports and analytics</li>
          </ul>
        </Section>
      </Content>
    </DashboardContainer>
  );
};

export default AdminDashboard;