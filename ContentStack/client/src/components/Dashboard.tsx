import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { FiGlobe, FiMessageSquare, FiFileText, FiTrendingUp } from 'react-icons/fi';
import apiService from '@/services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const DashboardSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$color + '20'};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const QuickActions = styled.div`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const QuickActionsTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  transition: ${props => props.theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary + '05'};
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.25rem;
`;

const ActionText = styled.div`
  text-align: left;
`;

const ActionTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const ActionDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${props => props.theme.colors.error};
`;

const Dashboard: React.FC = () => {
  const { data: variantGroups, isLoading: variantGroupsLoading, error: variantGroupsError } = useQuery(
    'variantGroups',
    () => apiService.getVariantGroups(),
    { retry: 1 }
  );

  const { data: contentTypes, isLoading: contentTypesLoading, error: contentTypesError } = useQuery(
    'contentTypes',
    () => apiService.getContentTypes(),
    { retry: 1 }
  );

  const { data: locales, isLoading: localesLoading, error: localesError } = useQuery(
    'locales',
    () => apiService.getLocales(),
    { retry: 1 }
  );

  const isLoading = variantGroupsLoading || contentTypesLoading || localesLoading;
  const hasError = variantGroupsError || contentTypesError || localesError;

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingState>Loading dashboard...</LoadingState>
      </DashboardContainer>
    );
  }

  if (hasError) {
    return (
      <DashboardContainer>
        <ErrorState>Failed to load dashboard data</ErrorState>
      </DashboardContainer>
    );
  }

  const stats = [
    {
      title: 'Variant Groups',
      value: Array.isArray(variantGroups) ? variantGroups.length : 0,
      description: 'Active locale groups',
      icon: FiGlobe,
      color: '#3b82f6',
    },
    {
      title: 'Content Types',
      value: Array.isArray(contentTypes) ? contentTypes.length : 0,
      description: 'Available content types',
      icon: FiFileText,
      color: '#10b981',
    },
    {
      title: 'Locales',
      value: Array.isArray(locales) ? locales.length : 0,
      description: 'Supported languages',
      icon: FiMessageSquare,
      color: '#f59e0b',
    },
    {
      title: 'Translations',
      value: '0',
      description: 'AI translations generated',
      icon: FiTrendingUp,
      color: '#8b5cf6',
    },
  ];

  const quickActions = [
    {
      title: 'Create Variant Group',
      description: 'Set up new locale groups',
      icon: FiGlobe,
      color: '#3b82f6',
      onClick: () => {
        // Navigate to variant manager
        window.location.href = '/variants';
      },
    },
    {
      title: 'Bulk Translate',
      description: 'Translate multiple entries',
      icon: FiMessageSquare,
      color: '#10b981',
      onClick: () => {
        // Navigate to translation manager
        window.location.href = '/translations';
      },
    },
    {
      title: 'Manage Entries',
      description: 'Configure entry variants',
      icon: FiFileText,
      color: '#f59e0b',
      onClick: () => {
        // Navigate to entry sidebar
        window.location.href = '/entry-sidebar';
      },
    },
  ];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Welcome to Locale Variants Manager</DashboardTitle>
        <DashboardSubtitle>
          Manage multilingual content with variant groups and AI-powered translations
        </DashboardSubtitle>
      </DashboardHeader>

      <StatsGrid>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index}>
              <StatHeader>
                <StatIcon $color={stat.color}>
                  <Icon />
                </StatIcon>
                <StatTitle>{stat.title}</StatTitle>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatDescription>{stat.description}</StatDescription>
            </StatCard>
          );
        })}
      </StatsGrid>

      <QuickActions>
        <QuickActionsTitle>Quick Actions</QuickActionsTitle>
        <ActionsGrid>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <ActionButton key={index} onClick={action.onClick}>
                <ActionIcon $color={action.color}>
                  <Icon />
                </ActionIcon>
                <ActionText>
                  <ActionTitle>{action.title}</ActionTitle>
                  <ActionDescription>{action.description}</ActionDescription>
                </ActionText>
              </ActionButton>
            );
          })}
        </ActionsGrid>
      </QuickActions>
    </DashboardContainer>
  );
};

export default Dashboard;
