import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiGlobe, FiMessageSquare, FiPlus, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiService from '@/services/api';
import { EntryVariant, VariantGroup } from '@/types';

const SidebarContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SectionIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.25rem;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
`;

const VariantList = styled.div`
  space-y: 0.75rem;
`;

const VariantItem = styled.div<{ $status: 'complete' | 'incomplete' | 'missing' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${props => 
    props.$status === 'complete' ? props.theme.colors.success :
    props.$status === 'incomplete' ? props.theme.colors.warning :
    props.theme.colors.error
  };
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => 
    props.$status === 'complete' ? props.theme.colors.success + '05' :
    props.$status === 'incomplete' ? props.theme.colors.warning + '05' :
    props.theme.colors.error + '05'
  };
`;

const StatusIcon = styled.div<{ $status: 'complete' | 'incomplete' | 'missing' }>`
  color: ${props => 
    props.$status === 'complete' ? props.theme.colors.success :
    props.$status === 'incomplete' ? props.theme.colors.warning :
    props.theme.colors.error
  };
  font-size: 1.25rem;
`;

const VariantInfo = styled.div`
  flex: 1;
`;

const VariantLocale = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const VariantStatus = styled.div<{ $status: 'complete' | 'incomplete' | 'missing' }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => 
    props.$status === 'complete' ? props.theme.colors.success :
    props.$status === 'incomplete' ? props.theme.colors.warning :
    props.theme.colors.error
  };
`;

const VariantActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => 
    props.$variant === 'primary' ? props.theme.colors.primary :
    props.$variant === 'danger' ? props.theme.colors.error :
    props.theme.colors.border
  };
  background: ${props => 
    props.$variant === 'primary' ? props.theme.colors.primary :
    props.$variant === 'danger' ? props.theme.colors.error :
    props.theme.colors.white
  };
  color: ${props => 
    props.$variant === 'primary' || props.$variant === 'danger' ? 
    props.theme.colors.white : props.theme.colors.text
  };
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const MissingFields = styled.div`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const BulkActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const BulkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const EntrySidebar: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<string>('sample-entry-uid');
  const [selectedContentType, setSelectedContentType] = useState<string>('sample-content-type');
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockVariants: EntryVariant[] = [
    {
      locale: 'en',
      variantParam: 'en',
      content: { title: 'Sample Title', description: 'Sample description' },
      isComplete: true,
      missingFields: [],
      fallbackUsed: [],
      lastModified: '2024-01-15T10:30:00Z',
    },
    {
      locale: 'hi',
      variantParam: 'hi_en',
      content: { title: 'नमूना शीर्षक', description: 'नमूना विवरण' },
      isComplete: true,
      missingFields: [],
      fallbackUsed: [],
      lastModified: '2024-01-15T10:30:00Z',
    },
    {
      locale: 'mr',
      variantParam: 'mr_hi_en',
      content: { title: 'नमुना शीर्षक', description: '' },
      isComplete: false,
      missingFields: ['description'],
      fallbackUsed: ['hi'],
      lastModified: '2024-01-15T10:30:00Z',
    },
  ];

  const { data: variantGroups } = useQuery(
    'variantGroups',
    () => apiService.getVariantGroups(),
    { retry: 1 }
  );

  const translateMutation = useMutation(
    ({ locale, content }: { locale: string; content: any }) =>
      apiService.translateContent({
        sourceLocale: 'en',
        targetLocale: locale,
        content,
        contentTypeUid: selectedContentType,
        useAI: true,
        aiProvider: 'openai',
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('variantConfigs');
        toast.success('Translation completed successfully');
      },
      onError: (error: any) => {
        toast.error('Translation failed: ' + error.message);
      },
    }
  );

  const handleTranslate = (locale: string, content: any) => {
    translateMutation.mutate({ locale, content });
  };

  const handleBulkTranslate = () => {
    // TODO: Implement bulk translation
    toast.success('Bulk translation initiated');
  };

  const getVariantStatus = (variant: EntryVariant): 'complete' | 'incomplete' | 'missing' => {
    if (variant.isComplete) return 'complete';
    if (variant.missingFields.length > 0) return 'incomplete';
    return 'missing';
  };

  const getStatusIcon = (status: 'complete' | 'incomplete' | 'missing') => {
    switch (status) {
      case 'complete':
        return <FiCheck />;
      case 'incomplete':
        return <FiAlertCircle />;
      case 'missing':
        return <FiX />;
    }
  };

  return (
    <SidebarContainer>
      <Header>
        <Title>Entry Variant Management</Title>
        <Subtitle>
          Manage locale variants for individual entries and generate AI translations
        </Subtitle>
      </Header>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionIcon $color="#3b82f6">
              <FiGlobe />
            </SectionIcon>
            <SectionTitle>Current Variants</SectionTitle>
          </SectionHeader>

          <VariantList>
            {mockVariants.map((variant, index) => {
              const status = getVariantStatus(variant);
              return (
                <VariantItem key={index} $status={status}>
                  <StatusIcon $status={status}>
                    {getStatusIcon(status)}
                  </StatusIcon>
                  <VariantInfo>
                    <VariantLocale>{variant.locale.toUpperCase()}</VariantLocale>
                    <VariantStatus $status={status}>
                      {status === 'complete' && 'Complete'}
                      {status === 'incomplete' && 'Incomplete'}
                      {status === 'missing' && 'Missing'}
                    </VariantStatus>
                    {variant.missingFields.length > 0 && (
                      <MissingFields>
                        Missing: {variant.missingFields.join(', ')}
                      </MissingFields>
                    )}
                    {variant.fallbackUsed.length > 0 && (
                      <MissingFields>
                        Using fallback: {variant.fallbackUsed.join(' → ')}
                      </MissingFields>
                    )}
                  </VariantInfo>
                  <VariantActions>
                    {status !== 'complete' && (
                      <ActionButton 
                        $variant="primary" 
                        onClick={() => handleTranslate(variant.locale, variant.content)}
                      >
                        <FiMessageSquare />
                      </ActionButton>
                    )}
                    <ActionButton $variant="secondary">
                      <FiPlus />
                    </ActionButton>
                  </VariantActions>
                </VariantItem>
              );
            })}
          </VariantList>

          <BulkActions>
            <BulkButton onClick={handleBulkTranslate}>
              <FiMessageSquare />
              Translate All Missing
            </BulkButton>
            <BulkButton>
              <FiPlus />
              Create Missing Variants
            </BulkButton>
          </BulkActions>
        </Section>

        <Section>
          <SectionHeader>
            <SectionIcon $color="#10b981">
              <FiMessageSquare />
            </SectionIcon>
            <SectionTitle>Translation Settings</SectionTitle>
          </SectionHeader>

          <div>
            <p>Configure AI translation settings and manage translation providers.</p>
            {/* TODO: Add translation settings form */}
          </div>
        </Section>
      </ContentGrid>
    </SidebarContainer>
  );
};

export default EntrySidebar;
