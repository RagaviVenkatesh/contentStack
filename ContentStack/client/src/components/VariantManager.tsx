import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiEdit, FiTrash2, FiGlobe, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiService from '@/services/api';
import { VariantGroup, Locale } from '@/types';

const VariantManagerContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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

const VariantGroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const VariantGroupCard = styled.div`
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  width: 2rem;
  height: 2rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.white};
  color: ${props => props.$variant === 'delete' ? props.theme.colors.error : props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.$variant === 'delete' ? props.theme.colors.error + '10' : props.theme.colors.backgroundSecondary};
    color: ${props => props.$variant === 'delete' ? props.theme.colors.error : props.theme.colors.text};
  }
`;

const CardDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const LocalesList = styled.div`
  margin-top: 1rem;
`;

const LocaleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 0.5rem;
`;

const DragHandle = styled.div`
  color: ${props => props.theme.colors.textTertiary};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const LocaleIcon = styled.div`
  color: ${props => props.theme.colors.primary};
`;

const LocaleInfo = styled.div`
  flex: 1;
`;

const LocaleCode = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const LocaleName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 0.5rem;
`;

const FallbackChain = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textTertiary};
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.textTertiary};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: 1.5rem;
`;

const VariantManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: variantGroups, isLoading, error } = useQuery(
    'variantGroups',
    () => apiService.getVariantGroups(),
    { retry: 1 }
  );

  const deleteMutation = useMutation(
    (id: string) => apiService.deleteVariantGroup(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('variantGroups');
        toast.success('Variant group deleted successfully');
      },
      onError: (error: any) => {
        toast.error('Failed to delete variant group: ' + error.message);
      },
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this variant group?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // TODO: Implement drag and drop reordering
    console.log('Drag ended:', result);
  };

  if (isLoading) {
    return (
      <VariantManagerContainer>
        <div>Loading variant groups...</div>
      </VariantManagerContainer>
    );
  }

  if (error) {
    return (
      <VariantManagerContainer>
        <div>Error loading variant groups: {(error as any).message}</div>
      </VariantManagerContainer>
    );
  }

  return (
    <VariantManagerContainer>
      <Header>
        <Title>Variant Groups</Title>
        <CreateButton onClick={() => setIsCreating(true)}>
          <FiPlus />
          Create Group
        </CreateButton>
      </Header>

      {Array.isArray(variantGroups) && variantGroups.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <VariantGroupsGrid>
            {variantGroups.map((group: VariantGroup) => (
              <VariantGroupCard key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardActions>
                    <ActionButton $variant="edit" title="Edit group">
                      <FiEdit />
                    </ActionButton>
                    <ActionButton $variant="delete" title="Delete group" onClick={() => handleDelete(group.id)}>
                      <FiTrash2 />
                    </ActionButton>
                  </CardActions>
                </CardHeader>
                
                {group.description && (
                  <CardDescription>{group.description}</CardDescription>
                )}

                <LocalesList>
                  <Droppable droppableId={group.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {group.locales.map((locale: Locale, index: number) => (
                          <Draggable key={locale.code} draggableId={locale.code} index={index}>
                            {(provided, snapshot) => (
                              <LocaleItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: snapshot.isDragging 
                                    ? '#f3f4f6' 
                                    : undefined,
                                }}
                              >
                                <DragHandle {...provided.dragHandleProps}>
                                  <FiMenu />
                                </DragHandle>
                                <LocaleIcon>
                                  <FiGlobe />
                                </LocaleIcon>
                                <LocaleInfo>
                                  <LocaleCode>{locale.code}</LocaleCode>
                                  <LocaleName>{locale.name}</LocaleName>
                                  {locale.fallback && locale.fallback.length > 0 && (
                                    <FallbackChain>
                                      Fallback: {locale.fallback.join(' → ')}
                                    </FallbackChain>
                                  )}
                                </LocaleInfo>
                              </LocaleItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </LocalesList>
              </VariantGroupCard>
            ))}
          </VariantGroupsGrid>
        </DragDropContext>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <FiGlobe />
          </EmptyIcon>
          <EmptyTitle>No Variant Groups</EmptyTitle>
          <EmptyDescription>
            Create your first variant group to start managing multilingual content
          </EmptyDescription>
          <CreateButton onClick={() => setIsCreating(true)}>
            <FiPlus />
            Create Your First Group
          </CreateButton>
        </EmptyState>
      )}
    </VariantManagerContainer>
  );
};

export default VariantManager;
