import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "monospace",
            color: "#0f172a",
            background: "#f4f6fb",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ color: "#dc2626", fontSize: 20, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.1)",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                overflow: "auto",
              }}
            >
              {String(this.state.error && this.state.error.stack || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
