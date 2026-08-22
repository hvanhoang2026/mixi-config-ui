import { useState } from "react";
import {
  AntdButton as Button,
  AntdModal as Dialog,
  AntdTextArea as InputTextarea,
} from "@w-iris/react";
import { UploadOutlined } from "@ant-design/icons";

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
  const [importing, setImporting] = useState(false);

  const submitImport = async () => {
    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      data-testid="import-env-dialog"
      visible={visible}
      footer={null}
      onHide={() => !importing && onHide()}
      header="Import Service ENV"
      style={{ width: "min(760px, 95vw)" }}
    >
      <div
        data-testid="auto-import-env-dialog-1-div"
        className="import-env__scope"
      >
        <div
          data-testid="auto-import-env-dialog-2-div"
          className="import-env__scope-title"
        >
          Target scope
        </div>
        <div
          data-testid="auto-import-env-dialog-3-div"
          className="import-env__scope-copy"
        >
          {serviceName
            ? `${serviceName} / ${environmentName ?? "No environment"}`
            : "No service selected"}
          {projectName ? ` / ${projectName}` : ""}
        </div>
      </div>
      <InputTextarea
        data-testid="import-env-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={16}
        className="ui-full-width"
      />
      <div
        data-testid="auto-import-env-dialog-4-div"
        className="import-env__actions"
      >
        <Button
          type="default"
          htmlType="button"
          data-testid="import-env-close-button"
          onClick={onHide}
          disabled={importing}
        >
          Close
        </Button>
        <Button
          type="primary"
          htmlType="button"
          data-testid="import-env-submit-button"
          loading={importing}
          icon={importing ? undefined : <UploadOutlined />}
          disabled={importing}
          onClick={submitImport}
        >
          {importing ? "Importing..." : "Import"}
        </Button>
      </div>
    </Dialog>
  );
}
