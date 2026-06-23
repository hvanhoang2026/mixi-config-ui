import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';

type Props = {
  visible: boolean;
  value: string;
  projectName?: string;
  serviceName?: string;
  environmentName?: string;
  onChange: (value: string) => void;
  onHide: () => void;
  onImport: () => Promise<void>;
};

export function ImportEnvDialog({
  visible,
  value,
  projectName,
  serviceName,
  environmentName,
  onChange,
  onHide,
  onImport,
}: Props) {
  return (
    <Dialog visible={visible} onHide={onHide} header="Import Service ENV" style={{ width: 'min(760px, 95vw)' }}>
      <div className="mb-3">
        <div className="text-900 font-semibold">Target scope</div>
        <div className="text-600 text-sm mt-1">
          {serviceName ? `${serviceName} / ${environmentName ?? 'No environment'}` : 'No service selected'}
          {projectName ? ` / ${projectName}` : ''}
        </div>
      </div>
      <InputTextarea value={value} onChange={(event) => onChange(event.target.value)} rows={16} className="w-full" />
      <div className="mt-3 flex justify-content-end gap-2">
        <Button label="Close" severity="secondary" onClick={onHide} />
        <Button label="Import" onClick={onImport} />
      </div>
    </Dialog>
  );
}
