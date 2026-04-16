import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center p-4">
            <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
            <h4 className="mt-3">Something went wrong</h4>
            <p className="text-secondary">We're sorry, an error occurred.</p>
            <button className="btn btn-primary mt-3" onClick={this.handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
