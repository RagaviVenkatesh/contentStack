import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiMessageSquare, FiGlobe, FiSettings, FiPlay, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiService from '@/services/api';
import { TranslationProvider, Language } from '@/types';

const TranslationManagerContainer = styled.div`
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

const ProviderGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProviderCard = styled.div<{ $isActive: boolean }>`
  padding: 1rem;
  border: 1px solid ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$isActive ? props.theme.colors.primary + '05' : props.theme.colors.white};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary + '05'};
  }
`;

const ProviderName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const ProviderFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const FeatureTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const ProviderModels = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TranslationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-height: 120px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => 
    props.$variant === 'primary' ? props.theme.colors.primary : props.theme.colors.backgroundSecondary
  };
  color: ${props => 
    props.$variant === 'primary' ? props.theme.colors.white : props.theme.colors.text
  };
  border: 1px solid ${props => 
    props.$variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border
  };
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
`;

const LanguageItem = styled.div<{ $isSelected: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.$isSelected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$isSelected ? props.theme.colors.primary + '05' : props.theme.colors.white};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const LanguageCode = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const LanguageName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TranslationManager: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('hi');
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: providers, isLoading: providersLoading } = useQuery(
    'translationProviders',
    () => apiService.getTranslationProviders(),
    { retry: 1 }
  );

  const { data: languages, isLoading: languagesLoading } = useQuery(
    'supportedLanguages',
    () => apiService.getSupportedLanguages(),
    { retry: 1 }
  );

  const translateMutation = useMutation(
    ({ text, from, to, provider }: { text: string; from: string; to: string; provider: string }) =>
      apiService.translateContent({
        sourceLocale: from,
        targetLocale: to,
        content: { text },
        contentTypeUid: 'translation',
        useAI: true,
        aiProvider: provider as any,
      }),
    {
      onSuccess: (data: any) => {
        setTranslatedText(data.translatedContent.text || '');
        toast.success('Translation completed successfully');
      },
      onError: (error: any) => {
        toast.error('Translation failed: ' + error.message);
      },
    }
  );

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }
    translateMutation.mutate({
      text: inputText,
      from: sourceLanguage,
      to: targetLanguage,
      provider: selectedProvider,
    });
  };

  const handleLanguageSelect = (languageCode: string) => {
    if (sourceLanguage === targetLanguage) {
      if (sourceLanguage === languageCode) {
        setTargetLanguage(languageCode);
      } else {
        setSourceLanguage(languageCode);
      }
    } else {
      setTargetLanguage(languageCode);
    }
  };

  return (
    <TranslationManagerContainer>
      <Header>
        <Title>AI Translation Manager</Title>
        <Subtitle>
          Translate content using AI providers with support for 100+ languages
        </Subtitle>
      </Header>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionIcon $color="#3b82f6">
              <FiSettings />
            </SectionIcon>
            <SectionTitle>Translation Providers</SectionTitle>
          </SectionHeader>

          {providersLoading ? (
            <div>Loading providers...</div>
          ) : (
            <ProviderGrid>
              {Array.isArray(providers) && providers.map((provider: TranslationProvider) => (
                <ProviderCard
                  key={provider.id}
                  $isActive={selectedProvider === provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <ProviderName>{provider.name}</ProviderName>
                  <ProviderFeatures>
                    {provider.features.map((feature, index) => (
                      <FeatureTag key={index}>{feature}</FeatureTag>
                    ))}
                  </ProviderFeatures>
                  <ProviderModels>
                    Models: {provider.models.join(', ')}
                  </ProviderModels>
                </ProviderCard>
              ))}
            </ProviderGrid>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionIcon $color="#10b981">
              <FiGlobe />
            </SectionIcon>
            <SectionTitle>Supported Languages</SectionTitle>
          </SectionHeader>

          {languagesLoading ? (
            <div>Loading languages...</div>
          ) : (
            <LanguageGrid>
              {Array.isArray(languages) && languages.map((language: Language) => (
                <LanguageItem
                  key={language.code}
                  $isSelected={sourceLanguage === language.code || targetLanguage === language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  <LanguageCode>{language.code.toUpperCase()}</LanguageCode>
                  <LanguageName>{language.name}</LanguageName>
                </LanguageItem>
              ))}
            </LanguageGrid>
          )}
        </Section>

        <Section style={{ gridColumn: '1 / -1' }}>
          <SectionHeader>
            <SectionIcon $color="#f59e0b">
              <FiMessageSquare />
            </SectionIcon>
            <SectionTitle>Translation Interface</SectionTitle>
          </SectionHeader>

          <TranslationForm onSubmit={handleTranslate}>
            <FormGroup>
              <Label>Source Language</Label>
              <Select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
              >
                {Array.isArray(languages) && languages.map((language: Language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} ({language.code.toUpperCase()})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Target Language</Label>
              <Select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {Array.isArray(languages) && languages.map((language: Language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} ({language.code.toUpperCase()})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Text to Translate</Label>
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Translated Text</Label>
              <TextArea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button $variant="primary" type="submit" disabled={translateMutation.isLoading}>
                <FiPlay />
                {translateMutation.isLoading ? 'Translating...' : 'Translate'}
              </Button>
              <Button $variant="secondary" onClick={() => setTranslatedText('')}>
                <FiDownload />
                Clear
              </Button>
            </ButtonGroup>
          </TranslationForm>
        </Section>
      </ContentGrid>
    </TranslationManagerContainer>
  );
};

export default TranslationManager;
