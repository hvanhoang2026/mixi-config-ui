import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';

type Props = {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onHide: () => void;
  onImport: () => Promise<void>;
};

export function ImportEnvDialog({ visible, value, onChange, onHide, onImport }: Props) {
  return (
    <Dialog visible={visible} onHide={onHide} header="Import ENV" style={{ width: 'min(760px, 95vw)' }}>
      <InputTextarea value={value} onChange={(event) => onChange(event.target.value)} rows={16} className="w-full" />
      <div className="mt-3 flex justify-content-end gap-2">
        <Button label="Close" severity="secondary" onClick={onHide} />
        <Button label="Import" onClick={onImport} />
      </div>
    </Dialog>
  );
}
