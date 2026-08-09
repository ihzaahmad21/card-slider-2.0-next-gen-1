import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ShinobiTCG] Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="app-fatal-error" role="alert">
        <h1>Something went wrong</h1>
        <p>The card app could not be rendered. Reload the page to try again.</p>
        <pre>{String(this.state.error.message || this.state.error)}</pre>
      </div>
    );
  }
}
