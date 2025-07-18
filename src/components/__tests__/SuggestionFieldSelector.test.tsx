import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SuggestionFieldSelector from '../SuggestionFieldSelector';
import { Store } from '@/types';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockStore: Store = {
  id: 'store-1',
  name: 'テストゲームセンター',
  address: '東京都渋谷区1-1-1',
  location: {
    type: 'Point',
    coordinates: [139.7, 35.7]
  },
  businessHours: {
    monday: { open: '10:00', close: '22:00' },
    tuesday: { open: '10:00', close: '22:00' },
    wednesday: { open: '10:00', close: '22:00' },
    thursday: { open: '10:00', close: '22:00' },
    friday: { open: '10:00', close: '22:00' },
    saturday: { open: '10:00', close: '24:00' },
    sunday: { open: '10:00', close: '24:00' },
  },
  chunithmInfo: {
    cabinets: 4,
    versions: ['CHUNITHM SUN PLUS'],
    facilities: ['PASELI', 'AIME']
  },
  lastUpdated: new Date(),
  photos: []
};

describe('SuggestionFieldSelector', () => {
  const defaultProps = {
    store: mockStore,
    selectedField: '',
    onFieldChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );
  });

  it('should display category chips', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    expect(getByText('基本情報')).toBeTruthy();
    expect(getByText('CHUNITHM情報')).toBeTruthy();
    expect(getByText('営業時間')).toBeTruthy();
  });

  it('should show field options for selected category', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    // Default category should be 'basic'
    expect(getByText('店舗名')).toBeTruthy();
    expect(getByText('住所')).toBeTruthy();
    expect(getByText('特別お知らせ')).toBeTruthy();
  });

  it('should switch categories when chip is pressed', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.press(getByText('CHUNITHM情報'));
    
    expect(getByText('筐体数')).toBeTruthy();
    expect(getByText('対応バージョン')).toBeTruthy();
    expect(getByText('設備・機能')).toBeTruthy();
  });

  it('should call onFieldChange when field is selected', () => {
    const onFieldChange = jest.fn();
    const { getByText, getByDisplayValue } = render(
      <TestWrapper>
        <SuggestionFieldSelector 
          {...defaultProps}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );

    // Find and press the radio button for store name
    const storeNameOption = getByText('店舗名');
    fireEvent.press(storeNameOption);

    expect(onFieldChange).toHaveBeenCalledWith('name', expect.objectContaining({
      label: '店舗名',
      type: 'text',
      currentValue: mockStore.name,
    }));
  });

  it('should display current value for fields', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    expect(getByText(`現在: ${mockStore.name}`)).toBeTruthy();
    expect(getByText(`現在: ${mockStore.address}`)).toBeTruthy();
  });

  it('should show selected field indicator', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector 
          {...defaultProps}
          selectedField="name"
        />
      </TestWrapper>
    );

    expect(getByText('「店舗名」を選択中')).toBeTruthy();
  });

  it('should handle business hours category', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.press(getByText('営業時間'));
    
    expect(getByText('月曜日の営業時間')).toBeTruthy();
    expect(getByText('火曜日の営業時間')).toBeTruthy();
  });

  it('should display business hours current values', () => {
    const { getByText } = render(
      <TestWrapper>
        <SuggestionFieldSelector {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.press(getByText('営業時間'));
    
    expect(getByText('現在: 10:00 - 22:00')).toBeTruthy();
    expect(getByText('現在: 10:00 - 24:00')).toBeTruthy(); // Weekend hours
  });
});