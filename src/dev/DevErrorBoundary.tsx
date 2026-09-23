import { Component, type ErrorInfo, type ReactNode } from 'react'
import './DevErrorBoundary.css'

type Props = { children: ReactNode; enabled: boolean; scenarioLabel: string; onResetScenario: () => void; onReturnToDev: () => void }
type State = { error?: Error; componentStack?: string }

export class DevErrorBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? undefined })
    console.error('[DEV RENDER ERROR]', { scenario: this.props.scenarioLabel, error, componentStack: info.componentStack })
  }

  render() {
    if (!this.state.error) return this.props.children
    if (!this.props.enabled) throw this.state.error
    return <main className="dev-error-screen"><section><span>DEV RENDER ERROR</span><h1>{this.props.scenarioLabel}</h1><pre>{this.state.error.stack ?? this.state.error.message}{this.state.componentStack}</pre><div><button type="button" onClick={this.props.onResetScenario}>REINICIAR ESCENARIO</button><button type="button" onClick={this.props.onReturnToDev}>VOLVER A ESCENARIOS DEV</button></div></section></main>
  }
}
