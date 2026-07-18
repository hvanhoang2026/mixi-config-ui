import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import type { Config, Environment, HistoryItem, Service } from '../../types';

type Props = {
  apiBaseUrl: string;
  selectedService?: Service;
  selectedEnvironment?: Environment;
  configs: Config[];
  runtimeText: string;
  history: HistoryItem[];
  loading?: boolean;
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
  loading = false,
  onLoadRuntime,
  onLoadHistory,
}: Props) {
  const serviceCode = selectedService?.code || ':serviceCode';
  const environmentCode = selectedEnvironment?.code || ':environmentCode';
  const endpoint = `${apiBaseUrl}/runtime-config/${serviceCode}/${environmentCode}`;
  const requiresToken = selectedService?.type !== 'frontend';
  const authLine = requiresToken
    ? 'Authorization: Bearer {MIXI_CONFIG_TOKEN}'
    : 'No token required for frontend service type';
  const curlSnippet = requiresToken
    ? `curl -H "Authorization: Bearer $MIXI_CONFIG_TOKEN" \\\n  "${endpoint}"`
    : `curl "${endpoint}"`;
  const nodeSnippet = requiresToken
    ? `const response = await fetch("${endpoint}", {\n  headers: { Authorization: \`Bearer \${process.env.MIXI_CONFIG_TOKEN}\` },\n});\n\nconst config = await response.json();`
    : `const response = await fetch("${endpoint}");\nconst config = await response.json();`;
  const envSnippet = [
    `MIXI_CONFIG_API_URL=${apiBaseUrl}`,
    requiresToken ? 'MIXI_CONFIG_TOKEN=<server-side-runtime-token>' : undefined,
    `MIXI_SERVICE_CODE=${serviceCode}`,
    `MIXI_ENVIRONMENT_CODE=${environmentCode}`,
  ].filter(Boolean).join('\n');
  const runtimeOutput =
    runtimeText ||
    (requiresToken
      ? 'Runtime values are protected by MIXI_CONFIG_TOKEN and should be fetched from a server-side service.'
      : 'Frontend service runtime values can be fetched without MIXI_CONFIG_TOKEN.');
  const configKeyList = configs.length
    ? configs.map((config) => `- \`${config.key}\`${config.description ? `: ${config.description}` : ''}`).join('\n')
    : '- No config keys are currently loaded for this scope.';
  const markdownGuide = `# Mixi Config API Integration Guide

Use this file as implementation context for an engineer or AI agent integrating another service with Mixi Config.

## Selected Scope

- Service: ${selectedService?.name ?? 'Not selected'}
- Service code: \`${serviceCode}\`
- Service type: \`${selectedService?.type ?? 'unknown'}\`
- Environment: ${selectedEnvironment?.name ?? 'Not selected'}
- Environment code: \`${environmentCode}\`
- Config keys loaded: ${configs.length}

## Runtime Endpoint

\`\`\`text
GET ${endpoint}
${authLine}
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
- Frontend service type can fetch runtime config without \`MIXI_CONFIG_TOKEN\`.
- Non-frontend service types must store \`MIXI_CONFIG_TOKEN\` only in the target service secret manager or deployment environment.
- Do not expose \`MIXI_CONFIG_TOKEN\` in browser code or public frontend environment variables.
- Load config during service startup, then refresh when the service needs updated values.
- Treat the response as a key-value object.
- Do not log secret config values.
`;
  const downloadFileName = `mixi-config-${serviceCode}-${environmentCode}-integration.md`
    .replace(/[^a-zA-Z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const markdownDownloadHref = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdownGuide)}`;

  return (
    <div className="api-guide" data-testid="runtime-history-panel">
      <div data-testid="auto-runtime-history-panel-1-div" className="api-guide__header">
        <div data-testid="auto-runtime-history-panel-2-div">
          <span data-testid="auto-runtime-history-panel-3-span" className="api-guide__eyebrow">Runtime integration</span>
          <h2 data-testid="auto-runtime-history-panel-4-h2">Service config API guide</h2>
          <p data-testid="auto-runtime-history-panel-5-p">
            Connect another service to the selected configuration scope and read runtime-safe
            values from Mixi Config.
          </p>
        </div>
        <div data-testid="auto-runtime-history-panel-6-div" className="api-guide__header-actions">
          <a
            data-testid="download-integration-guide"
            className="api-guide__download p-button p-component"
            href={markdownDownloadHref}
            download={downloadFileName || 'mixi-config-integration.md'}
          >
            <span data-testid="auto-runtime-history-panel-7-span" className="p-button-icon p-c pi pi-download" aria-hidden="true" />
            <span data-testid="auto-runtime-history-panel-8-span" className="p-button-label">Download guide</span>
          </a>
        </div>
      </div>

      <div data-testid="auto-runtime-history-panel-9-div" className="api-guide__grid">
        <section data-testid="auto-runtime-history-panel-10-section" className="api-guide__panel">
          <h3 data-testid="auto-runtime-history-panel-11-h3">Selected scope</h3>
          <dl data-testid="auto-runtime-history-panel-12-dl" className="api-guide__facts">
            <div data-testid="auto-runtime-history-panel-13-div">
              <dt data-testid="auto-runtime-history-panel-14-dt">Service</dt>
              <dd data-testid="auto-runtime-history-panel-15-dd">{loading ? <Skeleton width="10rem" height="1rem" /> : selectedService?.name ?? 'Select a service'}</dd>
            </div>
            <div data-testid="auto-runtime-history-panel-16-div">
              <dt data-testid="auto-runtime-history-panel-17-dt">Type</dt>
              <dd data-testid="auto-runtime-history-panel-18-dd">{loading ? <Skeleton width="6rem" height="1rem" /> : selectedService?.type ?? '-'}</dd>
            </div>
            <div data-testid="auto-runtime-history-panel-19-div">
              <dt data-testid="auto-runtime-history-panel-20-dt">Environment</dt>
              <dd data-testid="auto-runtime-history-panel-21-dd">{loading ? <Skeleton width="9rem" height="1rem" /> : selectedEnvironment?.name ?? 'Select an environment'}</dd>
            </div>
            <div data-testid="auto-runtime-history-panel-22-div">
              <dt data-testid="auto-runtime-history-panel-23-dt">Endpoint</dt>
              <dd data-testid="auto-runtime-history-panel-24-dd" className="api-guide__mono">{loading ? <Skeleton width="100%" height="1rem" /> : endpoint}</dd>
            </div>
            <div data-testid="auto-runtime-history-panel-25-div">
              <dt data-testid="auto-runtime-history-panel-26-dt">Auth</dt>
              <dd data-testid="auto-runtime-history-panel-27-dd">{loading ? <Skeleton width="14rem" height="1rem" /> : requiresToken ? 'Authorization: Bearer $MIXI_CONFIG_TOKEN' : 'No token required for frontend'}</dd>
            </div>
            <div data-testid="auto-runtime-history-panel-28-div">
              <dt data-testid="auto-runtime-history-panel-29-dt">Config keys</dt>
              <dd data-testid="auto-runtime-history-panel-30-dd">{loading ? <Skeleton width="2rem" height="1rem" /> : configs.length}</dd>
            </div>
          </dl>
        </section>

        <section data-testid="auto-runtime-history-panel-31-section" className="api-guide__panel">
          <h3 data-testid="auto-runtime-history-panel-32-h3">Service ENV</h3>
          {loading ? <RuntimeCodeSkeleton /> : <pre data-testid="auto-runtime-history-panel-33-pre" className="api-guide__code">{envSnippet}</pre>}
        </section>

        <section data-testid="auto-runtime-history-panel-34-section" className="api-guide__panel api-guide__panel--wide">
          <h3 data-testid="auto-runtime-history-panel-35-h3">Request examples</h3>
          <div data-testid="auto-runtime-history-panel-36-div" className="api-guide__code-grid">
            <div data-testid="auto-runtime-history-panel-37-div">
              <span data-testid="auto-runtime-history-panel-38-span">cURL</span>
              {loading ? <RuntimeCodeSkeleton /> : <pre data-testid="auto-runtime-history-panel-39-pre" className="api-guide__code">{curlSnippet}</pre>}
            </div>
            <div data-testid="auto-runtime-history-panel-40-div">
              <span data-testid="auto-runtime-history-panel-41-span">Node.js</span>
              {loading ? <RuntimeCodeSkeleton /> : <pre data-testid="auto-runtime-history-panel-42-pre" className="api-guide__code">{nodeSnippet}</pre>}
            </div>
          </div>
        </section>

        <section data-testid="auto-runtime-history-panel-43-section" className="api-guide__panel">
          <h3 data-testid="auto-runtime-history-panel-44-h3">Runtime response</h3>
          {loading ? <RuntimeCodeSkeleton response /> : <pre className="api-guide__code api-guide__code--response" data-testid="runtime-response">{runtimeOutput}</pre>}
        </section>

        <section data-testid="auto-runtime-history-panel-45-section" className="api-guide__panel">
          <div data-testid="auto-runtime-history-panel-46-div" className="api-guide__panel-title">
            <h3 data-testid="auto-runtime-history-panel-47-h3">Config history</h3>
            <Button data-testid="load-history-button" icon="pi pi-history" label="Load history" size="small" text onClick={onLoadHistory} />
          </div>
          {loading ? (
            <div data-testid="auto-runtime-history-panel-48-div" className="api-guide__history">
              {Array.from({ length: 3 }).map((_, index) => (
                <article data-testid="auto-runtime-history-panel-49-article" key={index} className="api-guide__history-item">
                  <Skeleton width="7rem" height="1rem" />
                  <Skeleton width="9rem" height="0.9rem" />
                  <Skeleton width="100%" height="0.95rem" />
                </article>
              ))}
            </div>
          ) : history.length ? (
            <div data-testid="auto-runtime-history-panel-50-div" className="api-guide__history">
              {history.slice(0, 5).map((item) => (
                <article data-testid="auto-runtime-history-panel-51-article" key={item.id} className="api-guide__history-item">
                  <strong data-testid="auto-runtime-history-panel-52-strong">{item.changedBy}</strong>
                  <span data-testid="auto-runtime-history-panel-53-span">{new Date(item.createdAt).toLocaleString()}</span>
                  <code data-testid="auto-runtime-history-panel-54-code">{item.oldValue} {'->'} {item.newValue}</code>
                </article>
              ))}
            </div>
          ) : (
            <p data-testid="auto-runtime-history-panel-55-p" className="api-guide__empty">No config changes recorded for the selected key.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function RuntimeCodeSkeleton({ response = false }: { response?: boolean }) {
  return (
    <div data-testid="auto-runtime-history-panel-56-div" className={`api-guide__code api-guide__code--skeleton${response ? ' api-guide__code--response' : ''}`}>
      {Array.from({ length: response ? 6 : 4 }).map((_, index) => (
        <Skeleton key={index} width={index === 0 ? '70%' : index === 3 ? '55%' : '100%'} height="0.9rem" />
      ))}
    </div>
  );
}
