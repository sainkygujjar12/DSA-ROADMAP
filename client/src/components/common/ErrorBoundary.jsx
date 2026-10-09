import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="recovery-page"><span className="page-kicker">LET’S TRY THAT AGAIN</span><h1>Something didn’t load.</h1><p>Your saved progress is still there. Reload the page to continue.</p><button className="settings-primary" onClick={() => window.location.reload()}>Reload page</button><a href="/">Back to home</a></main>;
    return this.props.children;
  }
}
