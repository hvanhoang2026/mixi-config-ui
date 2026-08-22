import type { ReactNode } from "react";
import { AntdButton as Button } from "@w-iris/react";
import { PlusOutlined } from "@ant-design/icons";

type Props = {
  onAdd: () => void;
  actions?: ReactNode;
};

export function CrudHeader({ onAdd, actions }: Props) {
  return (
    <div data-testid="auto-crud-header-1-div" className="crud-header">
      <div
        data-testid="auto-crud-header-2-div"
        className="crud-header__actions"
      >
        {actions}
      </div>
      <Button
        data-testid="add-new-button"
        label="Add new"
        icon={<PlusOutlined />}
        onClick={onAdd}
        className="crud-header__add"
      />
    </div>
  );
}
