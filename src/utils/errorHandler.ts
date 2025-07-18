import { Alert } from 'react-native';

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
}

class ErrorHandler {
  handleError(error: any, context?: string): AppError {
    const timestamp = new Date();
    
    // Network errors
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'ネットワークエラーが発生しました。接続を確認してください。',
        details: error.message,
        timestamp,
      };
    }

    // HTTP errors
    if (error.message?.includes('HTTP error!')) {
      const status = error.message.match(/status: (\d+)/)?.[1];
      
      switch (status) {
        case '401':
          return {
            type: ErrorType.AUTHENTICATION,
            message: '認証が必要です。ログインしてください。',
            code: status,
            timestamp,
          };
        case '403':
          return {
            type: ErrorType.PERMISSION,
            message: 'この操作を実行する権限がありません。',
            code: status,
            timestamp,
          };
        case '404':
          return {
            type: ErrorType.NOT_FOUND,
            message: '要求されたデータが見つかりません。',
            code: status,
            timestamp,
          };
        case '500':
        case '502':
        case '503':
          return {
            type: ErrorType.SERVER,
            message: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
            code: status,
            timestamp,
          };
        default:
          return {
            type: ErrorType.SERVER,
            message: 'サーバーでエラーが発生しました。',
            code: status,
            timestamp,
          };
      }
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return {
        type: ErrorType.VALIDATION,
        message: `入力データに問題があります: ${error.message}`,
        details: error.field,
        timestamp,
      };
    }

    // Location errors
    if (error.message?.includes('Location permission denied')) {
      return {
        type: ErrorType.PERMISSION,
        message: '位置情報の許可が必要です。設定で許可してください。',
        timestamp,
      };
    }

    // Default error
    return {
      type: ErrorType.UNKNOWN,
      message: '予期しないエラーが発生しました。',
      details: error.message || JSON.stringify(error),
      timestamp,
    };
  }

  showErrorAlert(error: AppError, onRetry?: () => void): void {
    const buttons: any[] = [
      { text: 'OK', style: 'default' }
    ];

    if (onRetry && (error.type === ErrorType.NETWORK || error.type === ErrorType.SERVER)) {
      buttons.unshift({ text: '再試行', onPress: onRetry });
    }

    Alert.alert(
      this.getErrorTitle(error.type),
      error.message,
      buttons
    );
  }

  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'ネットワークエラー';
      case ErrorType.VALIDATION:
        return '入力エラー';
      case ErrorType.AUTHENTICATION:
        return '認証エラー';
      case ErrorType.PERMISSION:
        return '権限エラー';
      case ErrorType.NOT_FOUND:
        return 'データが見つかりません';
      case ErrorType.SERVER:
        return 'サーバーエラー';
      default:
        return 'エラー';
    }
  }

  logError(error: AppError, context?: string): void {
    console.error(`[${error.type}] ${context || 'Unknown context'}:`, {
      message: error.message,
      details: error.details,
      code: error.code,
      timestamp: error.timestamp.toISOString(),
    });
  }

  isRetryableError(error: AppError): boolean {
    return error.type === ErrorType.NETWORK || 
           error.type === ErrorType.SERVER;
  }

  getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'インターネット接続を確認してください。オフラインモードで利用できます。';
      case ErrorType.AUTHENTICATION:
        return 'ログインが必要です。';
      case ErrorType.PERMISSION:
        return '必要な権限が許可されていません。設定を確認してください。';
      case ErrorType.NOT_FOUND:
        return 'データが見つかりませんでした。';
      case ErrorType.SERVER:
        return 'サーバーに問題があります。しばらく待ってから再試行してください。';
      case ErrorType.VALIDATION:
        return '入力内容を確認してください。';
      default:
        return 'エラーが発生しました。';
    }
  }
}

export const errorHandler = new ErrorHandler();

// Hook for using error handler in components
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string, onRetry?: () => void) => {
    const appError = errorHandler.handleError(error, context);
    errorHandler.logError(appError, context);
    errorHandler.showErrorAlert(appError, onRetry);
    return appError;
  };

  return { handleError, errorHandler };
};