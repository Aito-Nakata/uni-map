import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import OfflineIndicator from '../OfflineIndicator';

// Mock NetInfo
const mockNetInfo = {
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(),
};

jest.mock('@react-native-community/netinfo', () => mockNetInfo);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

describe('OfflineIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    render(
      <TestWrapper>
        <OfflineIndicator />
      </TestWrapper>
    );
  });

  it('should call onNetworkChange when network status changes', async () => {
    const onNetworkChange = jest.fn();
    let networkListener: (state: any) => void;

    mockNetInfo.addEventListener.mockImplementation((listener) => {
      networkListener = listener;
      return jest.fn();
    });

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    render(
      <TestWrapper>
        <OfflineIndicator onNetworkChange={onNetworkChange} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
    });

    // Simulate network change to offline
    networkListener!({
      isConnected: false,
      isInternetReachable: false,
    });

    await waitFor(() => {
      expect(onNetworkChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle initial network state', async () => {
    const onNetworkChange = jest.fn();

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });

    render(
      <TestWrapper>
        <OfflineIndicator onNetworkChange={onNetworkChange} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(onNetworkChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show offline indicator when network is unavailable', async () => {
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const { getByText } = render(
      <TestWrapper>
        <OfflineIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('オフライン中 - 一部機能が制限されます')).toBeTruthy();
    });
  });

  it('should cleanup listeners on unmount', () => {
    const unsubscribe = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    const { unmount } = render(
      <TestWrapper>
        <OfflineIndicator />
      </TestWrapper>
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});