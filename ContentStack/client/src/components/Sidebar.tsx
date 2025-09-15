import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiGlobe, 
  FiMessageSquare, 
  FiSettings, 
  FiBarChart,
  FiFileText,
  FiUsers
} from 'react-icons/fi';

const SidebarContainer = styled.aside`
  width: 16rem;
  background: ${props => props.theme.colors.white};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SidebarTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const SidebarSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavList = styled.ul`
  list-style: none;
`;

const NavItem = styled.li`
  margin-bottom: 0.25rem;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  background: ${props => props.$isActive ? props.theme.colors.primary + '10' : 'transparent'};
  border-right: ${props => props.$isActive ? `3px solid ${props.theme.colors.primary}` : '3px solid transparent'};
  transition: ${props => props.theme.transitions.fast};
  font-weight: ${props => props.$isActive ? props.theme.typography.fontWeight.medium : props.theme.typography.fontWeight.normal};
  
  &:hover {
    background: ${props => props.$isActive ? props.theme.colors.primary + '10' : props.theme.colors.backgroundSecondary};
    color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
  }
`;

const NavIcon = styled.div`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FooterText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textTertiary};
  text-align: center;
`;

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Dashboard',
      description: 'Overview and analytics'
    },
    {
      path: '/variants',
      icon: FiGlobe,
      label: 'Variant Manager',
      description: 'Manage locale variants'
    },
    {
      path: '/translations',
      icon: FiMessageSquare,
      label: 'Translation Manager',
      description: 'AI-powered translations'
    },
    {
      path: '/entry-sidebar',
      icon: FiFileText,
      label: 'Entry Sidebar',
      description: 'Entry-level variant management'
    },
    {
      path: '/analytics',
      icon: FiBarChart,
      label: 'Analytics',
      description: 'Usage and performance'
    },
    {
      path: '/team',
      icon: FiUsers,
      label: 'Team Management',
      description: 'User roles and permissions'
    },
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Settings',
      description: 'App configuration'
    },
  ];

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>Locale Variants</SidebarTitle>
        <SidebarSubtitle>Contentstack Marketplace App</SidebarSubtitle>
      </SidebarHeader>
      
      <Navigation>
        <NavList>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem key={item.path}>
                <NavLink to={item.path} $isActive={isActive}>
                  <NavIcon>
                    <Icon />
                  </NavIcon>
                  <NavText>{item.label}</NavText>
                </NavLink>
              </NavItem>
            );
          })}
        </NavList>
      </Navigation>
      
      <SidebarFooter>
        <FooterText>
          Version 1.0.0<br />
          Built for Contentstack
        </FooterText>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
