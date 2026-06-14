import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

type Props = {
  runtimeText: string;
  history: unknown[];
  onLoadRuntime: () => Promise<void>;
  onLoadHistory: () => void;
};

export function RuntimeHistoryPanel({ runtimeText, history, onLoadRuntime, onLoadHistory }: Props) {
  return (
    <div className="grid">
      <div className="col-12 md:col-6">
        <Card title="Runtime Preview">
          <Button label="Load runtime" onClick={onLoadRuntime} />
          <pre style={{ whiteSpace: 'pre-wrap' }}>{runtimeText}</pre>
        </Card>
      </div>
      <div className="col-12 md:col-6">
        <Card title="History">
          <Button label="Load history" onClick={onLoadHistory} />
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(history, null, 2)}</pre>
        </Card>
      </div>
    </div>
  );
}
