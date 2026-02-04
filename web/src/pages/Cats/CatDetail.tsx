import React, { useEffect, useMemo, useState } from "react";
import { App, Button, Card, Descriptions, Empty, Form, Input, InputNumber, Popconfirm, Spin, Switch, Table, Tag, Typography } from "antd";
import { useParams } from "react-router-dom";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { deleteCat, getCat, updateCat } from "../../services/catService";
import { getFeedLogs } from "../../services/feedLogService";
import { getFeedRules, upsertCatRule } from "../../services/feedRuleService";
import { getMediaUrl } from "../../services/mediaService";
import type { CatSummary, FeedLogItem } from "../../types/api";
import { RuleScope } from "../../types/api";
import { formatUtc } from "../../utils/date";
import { decisionLabel, feedResultLabel } from "../../utils/status";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";

const CatDetail: React.FC = () => {
  const { id } = useParams();
  const [cat, setCat] = useState<CatSummary | null>(null);
  const [logs, setLogs] = useState<FeedLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const { hasPermission } = useAuth();
  const { message } = App.useApp();
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [catData, logData, ruleData] = await Promise.all([
          getCat(id),
          getFeedLogs(),
          getFeedRules()
        ]);
        setCat(catData);
        setLogs(logData.filter((log) => log.catId === id));
        form.setFieldsValue({
          code: catData.code,
          alias: catData.alias,
          description: catData.description,
          isActive: catData.isActive
        });
        const catRule = ruleData.find(
          (rule) => rule.scopeType === RuleScope.Cat && rule.scopeId === id
        );
        const globalRule = ruleData.find((rule) => rule.scopeType === RuleScope.Global);
        const fallback = catRule || globalRule;
        ruleForm.setFieldsValue({
          name: catRule?.name || catData.alias || catData.code || t("cats.ruleTitle"),
          dailyLimitCount: fallback?.dailyLimitCount ?? 10,
          cooldownSeconds: fallback?.cooldownSeconds ?? 900,
          isActive: catRule?.isActive ?? true
        });
      } catch {
        setCat(null);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, form, ruleForm, t]);

  const handleSave = async (values: { code: string; alias?: string; description?: string; isActive: boolean }) => {
    if (!id || !cat) return;
    setSaving(true);
    try {
      await updateCat(id, {
        code: values.code,
        alias: values.alias,
        description: values.description,
        isActive: values.isActive,
        firstSeenAtUtc: cat.firstSeenAtUtc ?? null,
        lastSeenAtUtc: cat.lastSeenAtUtc ?? null,
        primaryImageId: cat.primaryImageId ?? null
      });
      setCat({
        ...cat,
        code: values.code,
        alias: values.alias ?? "",
        description: values.description ?? "",
        isActive: values.isActive
      });
      message.success(t("common.saved"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await deleteCat(id);
      message.success(t("common.deleted"));
      window.location.href = "/cats";
    } finally {
      setSaving(false);
    }
  };

  const handleRuleSave = async (values: { name: string; dailyLimitCount: number; cooldownSeconds: number; isActive: boolean }) => {
    if (!id) return;
    setSaving(true);
    try {
      await upsertCatRule(id, {
        scopeType: RuleScope.Cat,
        scopeId: id,
        name: values.name,
        dailyLimitCount: values.dailyLimitCount,
        cooldownSeconds: values.cooldownSeconds,
        isActive: values.isActive
      });
      message.success(t("cats.ruleSaved"));
    } finally {
      setSaving(false);
    }
  };

  const images = useMemo(() => {
    const list = logs
      .map((log) => getMediaUrl(log.snapshotImageId))
      .filter((src): src is string => Boolean(src));
    const primary = cat?.primaryImageId ? getMediaUrl(cat.primaryImageId) : null;
    return [primary, ...list].filter((src): src is string => Boolean(src)).slice(0, 8);
  }, [logs, cat]);

  if (!id) {
    return <Empty description={t("common.notFound")} />;
  }

  return (
    <Spin spinning={loading}>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("cats.detailTitle")}
        </Typography.Title>
        <Typography.Paragraph>{t("cats.detailSubtitle")}</Typography.Paragraph>
      </div>
      {cat ? (
        <div style={{ display: "grid", gap: 20 }}>
          <Card className="section-card">
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "240px 1fr" }}>
              <div style={{ borderRadius: 16, overflow: "hidden" }}>
                <ImageWithFallback
                  src={getMediaUrl(cat.primaryImageId) || undefined}
                  alt={cat.alias || cat.code}
                  style={{ width: "100%", height: "240px", objectFit: "cover" }}
                />
              </div>
              <Descriptions title={t("cats.basicInfo")} column={2} layout="vertical">
                <Descriptions.Item label={t("cats.idLabel")}>{cat.code || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("cats.aliasLabel")}>{cat.alias || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("cats.firstSeen")}>{formatUtc(cat.firstSeenAtUtc)}</Descriptions.Item>
                <Descriptions.Item label={t("cats.lastSeen")}>{formatUtc(cat.lastSeenAtUtc)}</Descriptions.Item>
                <Descriptions.Item label={t("cats.status")}>
                  <Tag color={cat.isActive ? "green" : "red"}>
                    {cat.isActive ? t("cats.active") : t("common.inactive")}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("cats.descriptionLabel")}>{cat.description || "-"}</Descriptions.Item>
              </Descriptions>
            </div>
          </Card>

          <Card className="section-card" title={t("cats.editProfile")}>
            <Form layout="vertical" form={form} onFinish={handleSave} disabled={!hasPermission("cats.write")}>
              <Form.Item label={t("cats.idLabel")} name="code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t("cats.aliasLabel")} name="alias">
                <Input />
              </Form.Item>
              <Form.Item label={t("cats.descriptionLabel")} name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Button type="primary" htmlType="submit" loading={saving} disabled={!hasPermission("cats.write")}>
                  {t("common.save")}
                </Button>
                {hasPermission("cats.write") ? (
                  <Popconfirm
                    title={t("cats.deleteConfirmTitle")}
                    description={t("cats.deleteConfirmHint")}
                    onConfirm={handleDelete}
                  >
                    <Button danger loading={saving}>
                      {t("common.delete")}
                    </Button>
                  </Popconfirm>
                ) : null}
                {!hasPermission("cats.write") ? (
                  <Typography.Text type="secondary">{t("access.noPermission")}</Typography.Text>
                ) : null}
              </div>
            </Form>
          </Card>

          <Card className="section-card" title={t("cats.ruleTitle")}>
            <Form layout="vertical" form={ruleForm} onFinish={handleRuleSave} disabled={!hasPermission("feedrules.write")}>
              <Form.Item label={t("cats.ruleName")} name="name">
                <Input placeholder={t("cats.ruleTitle")} />
              </Form.Item>
              <Form.Item label={t("cats.ruleLimit")} name="dailyLimitCount" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label={t("cats.ruleCooldown")} name="cooldownSeconds" rules={[{ required: true }]}>
                <InputNumber min={60} step={60} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} disabled={!hasPermission("feedrules.write")}>
                {t("common.save")}
              </Button>
              {!hasPermission("feedrules.write") ? (
                <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                  {t("access.noPermission")}
                </Typography.Text>
              ) : null}
            </Form>
          </Card>

          <Card className="section-card" title={t("cats.photos")}>
            {images.length === 0 ? (
              <Empty description={t("cats.noPhotos")} />
            ) : (
              <div className="image-grid">
                {images.map((src) => (
                  <ImageWithFallback key={src} src={src} alt="cat" />
                ))}
              </div>
            )}
          </Card>

          <Card className="section-card" title={t("cats.history")}>
            <Table
              rowKey="id"
              dataSource={logs}
              pagination={{ pageSize: 6 }}
              columns={[
                {
                  title: t("feedLogs.requested"),
                  dataIndex: "requestedAtUtc",
                  render: (value: string) => formatUtc(value)
                },
                {
                  title: t("feedLogs.decision"),
                  dataIndex: "decision",
                  render: (value: number) => decisionLabel(value, t)
                },
                {
                  title: t("feedLogs.result"),
                  dataIndex: "result",
                  render: (value: number) => feedResultLabel(value, t)
                },
                {
                  title: t("common.portionGrams"),
                  dataIndex: "portionGrams",
                  render: (value: number | null) => value ?? "-"
                }
              ]}
            />
          </Card>
        </div>
      ) : (
        <Empty description={t("common.notFound")} />
      )}
    </Spin>
  );
};

export default CatDetail;
