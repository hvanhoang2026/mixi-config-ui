import { Button } from 'primereact/button';
import type { EntityItem, EntityType } from '../../form-types';

type Props = {
  type: EntityType;
  row: EntityItem;
  onEdit: (type: EntityType, item: EntityItem) => void;
  onDelete: (type: EntityType, id: string) => Promise<void>;
  onHistory?: (configId: string) => void;
};

export function ActionButtons({ type, row, onEdit, onDelete, onHistory }: Props) {
  return (
    <div className="flex gap-2">
      <Button size="small" icon="pi pi-pencil" text onClick={() => onEdit(type, row)} />
      {type === 'config' && onHistory && (
        <Button size="small" icon="pi pi-history" text onClick={() => onHistory(row.id)} />
      )}
      <Button
        size="small"
        icon="pi pi-trash"
        text
        severity="danger"
        onClick={() => onDelete(type, row.id)}
      />
    </div>
  );
}
