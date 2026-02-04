import React, { useEffect, useState } from "react";
import { Button, Empty, Input, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import CatCard from "../../components/cards/CatCard";
import { getCats } from "../../services/catService";
import type { CatSummary } from "../../types/api";

const CatList: React.FC = () => {
  const [cats, setCats] = useState<CatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
          Cats
        </Typography.Title>
        <Typography.Paragraph>
          Track cat profiles, last seen times, and associated images.
        </Typography.Paragraph>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Search by code, alias, description"
          allowClear
          onSearch={setQuery}
          onChange={(event) => setQuery(event.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Button onClick={() => setQuery("")}>Reset</Button>
      </div>
      <Spin spinning={loading}>
        {filtered.length === 0 ? (
          <Empty description="No cats found" />
        ) : (
          <div className="card-grid">
            {filtered.map((cat) => (
              <CatCard key={cat.id} cat={cat} onClick={() => navigate(`/cats/${cat.id}`)} />
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default CatList;
