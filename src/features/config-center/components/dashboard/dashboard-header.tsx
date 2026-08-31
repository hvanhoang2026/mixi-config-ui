"use client";

import { Card, Col, Input, Row, Select, Skeleton, Space, Statistic, Typography } from "antd";
import { AppstoreOutlined, CloudServerOutlined, DeploymentUnitOutlined, SearchOutlined } from "@ant-design/icons";

type Dashboard = {
  totalProjects?: number;
  totalServices?: number;
  totalEnvironments?: number;
  totalConfigs?: number;
};

type Option = {
  id: string;
  name: string;
};

type Props = {
  dashboard?: Dashboard;
  loading?: boolean;
  projectName?: string;
  services: Option[];
  environments: Option[];
  selectedServiceId: string;
  selectedEnvironmentId: string;
  search: string;
  actions?: React.ReactNode;
  onServiceChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function DashboardHeader({
  dashboard,
  loading = false,
  projectName,
  services,
  environments,
  selectedServiceId,
  selectedEnvironmentId,
  search,
  actions,
  onServiceChange,
  onEnvironmentChange,
  onSearchChange,
}: Props) {
  return (
    <Card
      data-testid="dashboard-header"
      style={{ borderRadius: 12 }}
      styles={{ body: { padding: 24 } }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Typography.Text type="secondary" style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
            Platform configuration ledger
          </Typography.Text>
          <Typography.Title level={3} style={{ margin: "8px 0 8px", fontSize: 28 }}>
            Configuration control
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Select an operational scope, review governed values, and publish changes without losing service context.
          </Typography.Paragraph>
          {loading ? (
            <Skeleton.Input active size="small" style={{ width: 160 }} />
          ) : projectName ? (
            <Typography.Text type="secondary">
              Current project: <Typography.Text strong>{projectName}</Typography.Text>
            </Typography.Text>
          ) : null}
        </Col>

        <Col xs={24} lg={14}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text strong style={{ fontSize: 12 }}>
                  Service
                </Typography.Text>
                {loading ? (
                  <Skeleton.Input active block style={{ height: 32, marginTop: 4 }} />
                ) : (
                  <Select
                    placeholder="Select service"
                    value={selectedServiceId || undefined}
                    onChange={onServiceChange}
                    options={services.map((s) => ({ label: s.name, value: s.id }))}
                    style={{ width: "100%", marginTop: 4 }}
                    suffixIcon={<CloudServerOutlined />}
                    data-testid="service-selector"
                  />
                )}
              </Col>
              <Col span={12}>
                <Typography.Text strong style={{ fontSize: 12 }}>
                  Environment
                </Typography.Text>
                {loading ? (
                  <Skeleton.Input active block style={{ height: 32, marginTop: 4 }} />
                ) : (
                  <Select
                    placeholder="Select environment"
                    value={selectedEnvironmentId || undefined}
                    onChange={onEnvironmentChange}
                    options={environments.map((e) => ({ label: e.name, value: e.id }))}
                    style={{ width: "100%", marginTop: 4 }}
                    suffixIcon={<DeploymentUnitOutlined />}
                    data-testid="environment-selector"
                  />
                )}
              </Col>
            </Row>

            {loading ? (
              <Skeleton.Input active block style={{ height: 32 }} />
            ) : (
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search service config keys"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                allowClear
                data-testid="config-search-input"
                aria-label="Search configuration keys"
              />
            )}

            {loading ? (
              <Space>
                <Skeleton.Button active />
                <Skeleton.Button active />
                <Skeleton.Button active />
              </Space>
            ) : actions ? (
              <Space wrap>{actions}</Space>
            ) : null}
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {[
          { title: "Services", value: dashboard?.totalServices, suffix: "Registered workloads", icon: <CloudServerOutlined /> },
          { title: "Environments", value: dashboard?.totalEnvironments, suffix: "Deployment scopes", icon: <DeploymentUnitOutlined /> },
          { title: "Config keys", value: dashboard?.totalConfigs, suffix: "Governed values", icon: <AppstoreOutlined /> },
        ].map((stat) =>
          loading ? (
            <Col key={stat.title} xs={24} sm={8}>
              <Card size="small">
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ) : (
            <Col key={stat.title} xs={24} sm={8}>
              <Card size="small" hoverable>
                <Statistic
                  title={stat.title}
                  value={stat.value ?? 0}
                  prefix={stat.icon}
                  suffix={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{stat.suffix}</Typography.Text>}
                  valueStyle={{ fontSize: 28 }}
                />
              </Card>
            </Col>
          ),
        )}
      </Row>
    </Card>
  );
}
