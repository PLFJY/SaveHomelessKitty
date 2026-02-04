import React from "react";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

const NotFound: React.FC = () => {
  const { t } = useI18n();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t("common.notFound")}
      extra={
        <Button type="primary">
          <Link to="/">{t("nav.dashboard")}</Link>
        </Button>
      }
    />
  );
};

export default NotFound;
