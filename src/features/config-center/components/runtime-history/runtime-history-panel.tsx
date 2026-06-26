import { Button } from 'primereact/button';
import type { Config, Environment, HistoryItem, Service } from '../../types';

type Props = {
  apiBaseUrl: string;
  selectedService?: Service;
  selectedEnvironment?: Environment;
  configs: Config[];
  runtimeText: string;
  history: HistoryItem[];
  onLoadRuntime: () => Promise<void>;
  onLoadHistory: () => void;
};

export function RuntimeHistoryPanel({
  apiBaseUrl,
  selectedService,
  selectedEnvironment,
  configs,
  runtimeText,
  history,
  onLoadRuntime,
  onLoadHistory,
}: Props) {
  const serviceCode = selectedService?.code || ':serviceCode';
  const environmentCode = selectedEnvironment?.code || ':environmentCode';
  const endpoint = `${apiBaseUrl}/runtime-config/${serviceCode}/${environmentCode}`;
  const curlSnippet = `curl -H "Authorization: Bearer $MIXI_CONFIG_TOKEN" \\\n  "${endpoint}"`;
  const nodeSnippet = `const response = await fetch("${endpoint}", {\n  headers: { Authorization: \`Bearer \${process.env.MIXI_CONFIG_TOKEN}\` },\n});\n\nconst config = await response.json();`;
  const envSnippet = `MIXI_CONFIG_API_URL=${apiBaseUrl}\nMIXI_CONFIG_TOKEN=<service-access-token>\nMIXI_SERVICE_CODE=${serviceCode}\nMIXI_ENVIRONMENT_CODE=${environmentCode}`;
  const runtimeOutput = runtimeText || '{}';
  const configKeyList = configs.length
    ? configs.map((config) => `- \`${config.key}\`${config.description ? `: ${config.description}` : ''}`).join('\n')
    : '- No config keys are currently loaded for this scope.';
  const markdownGuide = `# Mixi Config API Integration Guide

Use this file as implementation context for an engineer or AI agent integrating another service with Mixi Config.

## Selected Scope

- Service: ${selectedService?.name ?? 'Not selected'}
- Service code: \`${serviceCode}\`
- Environment: ${selectedEnvironment?.name ?? 'Not selected'}
- Environment code: \`${environmentCode}\`
- Config keys loaded: ${configs.length}

## Runtime Endpoint

\`\`\`text
GET ${endpoint}
Authorization: Bearer {MIXI_CONFIG_TOKEN}
\`\`\`

## Required Service ENV

\`\`\`env
${envSnippet}
\`\`\`

## cURL Example

\`\`\`bash
${curlSnippet}
\`\`\`

## Node.js Example

\`\`\`ts
${nodeSnippet}
\`\`\`

## Config Keys

${configKeyList}

## Current Runtime Response

\`\`\`json
${runtimeOutput}
\`\`\`

## Integration Notes For AI Agents

- Read runtime configuration from the endpoint above instead of hardcoding environment-specific values.
- Store \`MIXI_CONFIG_TOKEN\` in the target service secret manager or deployment environment.
- Load config during service startup, then refresh when the service needs updated values.
- Treat the response as a key-value object.
- Do not log secret config values.
`;
  const downloadFileName = `mixi-config-${serviceCode}-${environmentCode}-integration.md`
    .replace(/[^a-zA-Z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const markdownDownloadHref = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdownGuide)}`;

  return (
    <div className="api-guide">
      <div className="api-guide__header">
        <div>
          <span className="api-guide__eyebrow">Runtime integration</span>
          <h2>Service config API guide</h2>
          <p>
            Connect another service to the selected configuration scope and read runtime-safe
            values from Mixi Config.
          </p>
        </div>
        <div className="api-guide__header-actions">
          <a
            className="api-guide__download p-button p-component"
            href={markdownDownloadHref}
            download={downloadFileName || 'mixi-config-integration.md'}
          >
            <span className="p-button-icon p-c pi pi-download" aria-hidden="true" />
            <span className="p-button-label">Download guide</span>
          </a>
          <Button icon="pi pi-refresh" label="Refresh runtime" onClick={onLoadRuntime} />
        </div>
      </div>

      <div className="api-guide__grid">
        <section className="api-guide__panel">
          <h3>Selected scope</h3>
          <dl className="api-guide__facts">
            <div>
              <dt>Service</dt>
              <dd>{selectedService?.name ?? 'Select a service'}</dd>
            </div>
            <div>
              <dt>Environment</dt>
              <dd>{selectedEnvironment?.name ?? 'Select an environment'}</dd>
            </div>
            <div>
              <dt>Endpoint</dt>
              <dd className="api-guide__mono">{endpoint}</dd>
            </div>
            <div>
              <dt>Config keys</dt>
              <dd>{configs.length}</dd>
            </div>
          </dl>
        </section>

        <section className="api-guide__panel">
          <h3>Service ENV</h3>
          <pre className="api-guide__code">{envSnippet}</pre>
        </section>

        <section className="api-guide__panel api-guide__panel--wide">
          <h3>Request examples</h3>
          <div className="api-guide__code-grid">
            <div>
              <span>cURL</span>
              <pre className="api-guide__code">{curlSnippet}</pre>
            </div>
            <div>
              <span>Node.js</span>
              <pre className="api-guide__code">{nodeSnippet}</pre>
            </div>
          </div>
        </section>

        <section className="api-guide__panel">
          <h3>Runtime response</h3>
          <pre className="api-guide__code api-guide__code--response">{runtimeOutput}</pre>
        </section>

        <section className="api-guide__panel">
          <div className="api-guide__panel-title">
            <h3>Config history</h3>
            <Button icon="pi pi-history" label="Load history" size="small" text onClick={onLoadHistory} />
          </div>
          {history.length ? (
            <div className="api-guide__history">
              {history.slice(0, 5).map((item) => (
                <article key={item.id} className="api-guide__history-item">
                  <strong>{item.changedBy}</strong>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <code>{item.oldValue} {'->'} {item.newValue}</code>
                </article>
              ))}
            </div>
          ) : (
            <p className="api-guide__empty">No config changes recorded for the selected key.</p>
          )}
        </section>
      </div>
    </div>
  );
}
