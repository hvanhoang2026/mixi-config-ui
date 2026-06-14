import { Button } from 'primereact/button';

export function CrudHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mb-3 flex justify-content-end">
      <Button label="Add new" icon="pi pi-plus" onClick={onAdd} />
    </div>
  );
}
