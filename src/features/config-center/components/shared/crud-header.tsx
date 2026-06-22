import type { ReactNode } from 'react';
import { Button } from 'primereact/button';

type Props = {
  onAdd: () => void;
  actions?: ReactNode;
};

export function CrudHeader({ onAdd, actions }: Props) {
  return (
    <div className="crud-header">
      <div className="crud-header__actions">
        {actions}
      </div>
      <Button label="Add new" icon="pi pi-plus" onClick={onAdd} className="crud-header__add" />
    </div>
  );
}
