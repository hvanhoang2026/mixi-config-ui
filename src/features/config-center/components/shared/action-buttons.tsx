import { Button, Modal, Space, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
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
  const confirmDelete = () => {
    const name =
      (row as { name?: string; code?: string; key?: string }).name ??
      (row as { code?: string }).code ??
      (row as { key?: string }).key ??
      row.id;
    Modal.confirm({
      title: `Xác nhận xóa ${type}?`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: () => onDelete(type, row.id),
    });
  };

  return (
    <Space data-testid="auto-action-buttons-1-div" size={4}>
      <Tooltip title="Edit">
        <Button
          data-testid={`edit-${type}-${row.id}`}
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(type, row)}
        />
      </Tooltip>
      {type === "config" && onHistory && (
        <Tooltip title="History">
          <Button
            data-testid={`history-config-${row.id}`}
            size="small"
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => onHistory(row.id)}
          />
        </Tooltip>
      )}
      <Tooltip title="Delete">
        <Button
          size="small"
          type="text"
          danger
          data-testid={`delete-${type}-${row.id}`}
          icon={<DeleteOutlined />}
          onClick={confirmDelete}
        />
      </Tooltip>
    </Space>
  );
}
