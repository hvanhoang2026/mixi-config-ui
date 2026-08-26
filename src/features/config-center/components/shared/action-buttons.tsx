import { AntdButton as Button } from "@w-iris/react";
import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { EntityItem, EntityType } from "../../form-types";

type Props = {
  type: EntityType;
  row: EntityItem;
  onEdit: (type: EntityType, item: EntityItem) => void;
  onDelete: (type: EntityType, id: string) => Promise<void>;
  onHistory?: (configId: string) => void;
};

export function ActionButtons({
  type,
  row,
  onEdit,
  onDelete,
  onHistory,
}: Props) {
  return (
    <div data-testid="auto-action-buttons-1-div" className="config-row-actions">
      <Button
        data-testid={`edit-${type}-${row.id}`}
        size="small"
        icon={<EditOutlined />}
        text
        onClick={() => onEdit(type, row)}
      />
      {type === "config" && onHistory && (
        <Button
          data-testid={`history-config-${row.id}`}
          size="small"
          icon={<HistoryOutlined />}
          text
          onClick={() => onHistory(row.id)}
        />
      )}
      <Button
        size="small"
        data-testid={`delete-${type}-${row.id}`}
        icon={<DeleteOutlined />}
        text
        severity="danger"
        onClick={() => onDelete(type, row.id)}
      />
    </div>
  );
}
