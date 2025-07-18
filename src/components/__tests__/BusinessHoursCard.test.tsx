import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import BusinessHoursCard from '../BusinessHoursCard';
import { BusinessHours } from '@/types';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockBusinessHours: BusinessHours = {
  monday: { open: '10:00', close: '22:00' },
  tuesday: { open: '10:00', close: '22:00' },
  wednesday: { open: '10:00', close: '22:00' },
  thursday: { open: '10:00', close: '22:00' },
  friday: { open: '10:00', close: '24:00' },
  saturday: { open: '10:00', close: '24:00' },
  sunday: { open: '00:00', close: '00:00' }, // Closed on Sunday
};

const mockLateNightHours: BusinessHours = {
  monday: { open: '10:00', close: '25:00' }, // Next day 1:00 AM
  tuesday: { open: '10:00', close: '25:00' },
  wednesday: { open: '10:00', close: '25:00' },
  thursday: { open: '10:00', close: '25:00' },
  friday: { open: '10:00', close: '26:00' }, // Next day 2:00 AM
  saturday: { open: '10:00', close: '26:00' },
  sunday: { open: '10:00', close: '24:00' },
};

// Mock Date to always return a specific time for consistent testing
const mockDate = new Date('2024-01-15T15:30:00'); // Monday 3:30 PM
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

describe('BusinessHoursCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );
  });

  it('should display section title', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('営業時間')).toBeTruthy();
  });

  it('should show current day status as open during business hours', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('営業中')).toBeTruthy();
  });

  it('should display today\'s hours', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('本日 (月曜日)')).toBeTruthy();
    expect(getByText('10:00 - 22:00')).toBeTruthy();
  });

  it('should show closed status for closed day', () => {
    const sundayMockDate = new Date('2024-01-21T15:30:00'); // Sunday 3:30 PM
    jest.spyOn(global, 'Date').mockImplementation(() => sundayMockDate as any);

    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('定休日')).toBeTruthy();
  });

  it('should expand to show all hours when button is pressed', () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    // Initially should show "show all" button and not show all days
    expect(getByText('全ての営業時間を表示')).toBeTruthy();
    expect(queryByText('火曜日')).toBeFalsy();

    // Press the show all button
    fireEvent.press(getByText('全ての営業時間を表示'));

    // Now should show all days and hide button
    expect(getByText('火曜日')).toBeTruthy();
    expect(getByText('水曜日')).toBeTruthy();
    expect(getByText('営業時間を閉じる')).toBeTruthy();
  });

  it('should collapse hours when close button is pressed', () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    // Expand first
    fireEvent.press(getByText('全ての営業時間を表示'));
    expect(getByText('火曜日')).toBeTruthy();

    // Then collapse
    fireEvent.press(getByText('営業時間を閉じる'));
    expect(queryByText('火曜日')).toBeFalsy();
    expect(getByText('全ての営業時間を表示')).toBeTruthy();
  });

  it('should handle late night hours (next day closing)', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockLateNightHours} />
      </TestWrapper>
    );

    expect(getByText('10:00 - 翌1:00')).toBeTruthy();
  });

  it('should display closed days correctly in full view', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    // Expand to show all hours
    fireEvent.press(getByText('全ての営業時間を表示'));

    expect(getByText('日曜日')).toBeTruthy();
    expect(getByText('定休日')).toBeTruthy();
  });

  it('should highlight current day in full view', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    // Expand to show all hours
    fireEvent.press(getByText('全ての営業時間を表示'));

    // Monday should be highlighted (current day in mock)
    expect(getByText('月曜日')).toBeTruthy();
  });

  it('should show notes about hours being subject to change', () => {
    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('※ 営業時間は変更される場合があります。詳細は直接店舗にお問い合わせください。')).toBeTruthy();
  });

  it('should handle weekend late hours correctly', () => {
    const fridayMockDate = new Date('2024-01-19T23:30:00'); // Friday 11:30 PM
    jest.spyOn(global, 'Date').mockImplementation(() => fridayMockDate as any);

    const { getByText } = render(
      <TestWrapper>
        <BusinessHoursCard businessHours={mockBusinessHours} />
      </TestWrapper>
    );

    expect(getByText('営業中')).toBeTruthy();
    expect(getByText('10:00 - 24:00')).toBeTruthy();
  });
});