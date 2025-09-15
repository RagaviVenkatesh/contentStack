import React from 'react';
import styled from 'styled-components';
import { FiGlobe, FiSettings, FiBell, FiUser } from 'react-icons/fi';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
`;

const LogoIcon = styled(FiGlobe)`
  font-size: 1.5rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
    color: ${props => props.theme.colors.text};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const UserName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon />
        <Title>Locale Variants Manager</Title>
      </Logo>
      
      <Actions>
        <ActionButton title="Notifications">
          <FiBell />
        </ActionButton>
        
        <ActionButton title="Settings">
          <FiSettings />
        </ActionButton>
        
        <UserInfo>
          <UserAvatar>
            <FiUser />
          </UserAvatar>
          <UserName>Content Manager</UserName>
        </UserInfo>
      </Actions>
    </HeaderContainer>
  );
};

export default Header;
