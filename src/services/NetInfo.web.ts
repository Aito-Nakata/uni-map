// Web-compatible NetInfo implementation
interface NetInfoState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

type NetInfoChangeHandler = (state: NetInfoState) => void;

class WebNetInfo {
  private listeners: NetInfoChangeHandler[] = [];
  private currentState: NetInfoState = {
    isConnected: navigator.onLine,
    isInternetReachable: navigator.onLine,
    type: 'unknown',
  };

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.currentState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    };
    this.notifyListeners();
  };

  private handleOffline = () => {
    this.currentState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    };
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('NetInfo listener error:', error);
      }
    });
  }

  addEventListener(listener: NetInfoChangeHandler) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async fetch(): Promise<NetInfoState> {
    return this.currentState;
  }
}

const webNetInfo = new WebNetInfo();

export default webNetInfo;