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
            color: "#f1f5f9",
            background: "#0b0c10",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ color: "#fb7aaa", fontSize: 20, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(225,29,106,0.3)",
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
