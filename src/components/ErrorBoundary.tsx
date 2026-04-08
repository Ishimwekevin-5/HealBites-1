import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './UI';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again.";
      
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('permissions')) {
            errorMessage = "You don't have permission to perform this action. Please check your account settings.";
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-8">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Oops! An error occurred</h2>
            <p className="text-gray-500 font-sans mb-8">{errorMessage}</p>
            <Button onClick={this.handleReset} className="w-full gap-2">
              <RefreshCcw className="w-4 h-4" /> Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
