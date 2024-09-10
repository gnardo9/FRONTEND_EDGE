import React, { Component, ErrorInfo } from "react";
import { toast } from "react-toastify";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    toast.error("Ocorreu um erro. Por favor, tente novamente mais tarde.");
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado. Por favor, recarregue a página.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;