import React, { useEffect, useState } from "react";
import { Button, Empty, Form, Input, Modal, Spin, Switch, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import CatCard from "../../components/cards/CatCard";
import { createCat, getCats } from "../../services/catService";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import type { CatSummary } from "../../types/api";

const CatList: React.FC = () => {
  const [cats, setCats] = useState<CatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useI18n();
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCats();
        setCats(data);
      } catch {
        setCats([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    const data = await getCats();
    setCats(data);
  };

  const filtered = cats.filter((cat) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return (
      cat.code.toLowerCase().includes(keyword) ||
      cat.alias.toLowerCase().includes(keyword) ||
      cat.description.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("cats.title")}
        </Typography.Title>
        <Typography.Paragraph>
          {t("cats.subtitle")}
        </Typography.Paragraph>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Input.Search
          placeholder={t("cats.searchPlaceholder")}
          allowClear
          onSearch={setQuery}
          onChange={(event) => setQuery(event.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Button onClick={() => setQuery("")}>{t("common.reset")}</Button>
        {hasPermission("cats.write") ? (
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            {t("cats.new")}
          </Button>
        ) : null}
      </div>
      <Spin spinning={loading}>
        {filtered.length === 0 ? (
          <Empty description={t("cats.empty")} />
        ) : (
          <div className="card-grid">
            {filtered.map((cat) => (
              <CatCard key={cat.id} cat={cat} onClick={() => navigate(`/cats/${cat.id}`)} />
            ))}
          </div>
        )}
      </Spin>

      <Modal
        title={t("cats.new")}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values: { code: string; alias?: string; description?: string; isActive: boolean }) => {
            setCreating(true);
            try {
              await createCat({
                code: values.code,
                alias: values.alias,
                description: values.description,
                isActive: values.isActive,
                firstSeenAtUtc: null,
                lastSeenAtUtc: null,
                primaryImageId: null
              });
              await reload();
              form.resetFields();
              setCreateOpen(false);
            } finally {
              setCreating(false);
            }
          }}
          initialValues={{ isActive: true }}
        >
          <Form.Item label={t("cats.idLabel")} name="code" rules={[{ required: true, message: t("cats.idLabel") }]}>
            <Input placeholder={t("cats.codePlaceholder")} />
          </Form.Item>
          <Form.Item label={t("cats.aliasLabel")} name="alias">
            <Input placeholder={t("cats.aliasLabel")} />
          </Form.Item>
          <Form.Item label={t("cats.descriptionLabel")} name="description">
            <Input.TextArea rows={3} placeholder={t("cats.descriptionLabel")} />
          </Form.Item>
          <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CatList;
