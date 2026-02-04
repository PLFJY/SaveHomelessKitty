import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import { useAuth } from "../context/AuthContext";
import { getPermissions } from "../services/permissionService";
import { createRole, deleteRole, getRoles, updateRole } from "../services/roleService";
import { createUser, deleteUser, getUsers, updateUser } from "../services/userService";
import { useI18n } from "../context/I18nContext";
import type {
  PermissionDefinition,
  RoleInfo,
  RoleUpsertRequest,
  UserCreateRequest,
  UserInfo,
  UserUpdateRequest
} from "../types/admin";

const AccessControl: React.FC = () => {
  const { hasPermission } = useAuth();
  const { message } = App.useApp();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const canManageUsers = hasPermission("users.manage");
  const canManageRoles = hasPermission("roles.manage");

  const load = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, permissionData] = await Promise.all([
        canManageUsers ? getUsers() : Promise.resolve([]),
        canManageUsers || canManageRoles ? getRoles() : Promise.resolve([]),
        getPermissions()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const roleOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.id })),
    [roles]
  );

  const permissionOptions = useMemo(
    () => permissions.map((permission) => ({
      label: `${permission.label} (${permission.key})`,
      value: permission.key
    })),
    [permissions]
  );

  const openUserModal = (user?: UserInfo) => {
    setEditingUser(user ?? null);
    setUserModalOpen(true);
    userForm.setFieldsValue({
      username: user?.username,
      displayName: user?.displayName,
      isActive: user?.isActive ?? true,
      roleIds: user?.roles.map((role) => role.id) ?? []
    });
  };

  const openRoleModal = (role?: RoleInfo) => {
    setEditingRole(role ?? null);
    setRoleModalOpen(true);
    roleForm.setFieldsValue({
      name: role?.name,
      description: role?.description,
      permissions: role?.permissions ?? []
    });
  };

  const handleUserSubmit = async (values: UserCreateRequest & UserUpdateRequest) => {
    if (!canManageUsers) return;
    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          displayName: values.displayName,
          password: values.password,
          isActive: values.isActive,
          roleIds: values.roleIds
        });
        message.success(t("common.saved"));
      } else {
        await createUser({
          username: values.username,
          displayName: values.displayName,
          password: values.password,
          isActive: values.isActive,
          roleIds: values.roleIds
        });
        message.success(t("common.created"));
      }
      setUserModalOpen(false);
      setEditingUser(null);
      userForm.resetFields();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSubmit = async (values: RoleUpsertRequest) => {
    if (!canManageRoles) return;
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success(t("common.saved"));
      } else {
        await createRole(values);
        message.success(t("common.created"));
      }
      setRoleModalOpen(false);
      setEditingRole(null);
      roleForm.resetFields();
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (!canManageUsers && !canManageRoles) {
    return (
      <Card className="section-card">
        <Empty description={t("access.noPermission")} />
      </Card>
    );
  }

  return (
    <div>
      <div className="page-title">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("access.title")}
        </Typography.Title>
        <Typography.Paragraph>{t("access.subtitle")}</Typography.Paragraph>
      </div>

      <Tabs
        items={[
          {
            key: "users",
            label: t("access.users"),
            children: (
              <Card className="section-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <Typography.Text type="secondary">{t("access.userHint")}</Typography.Text>
                  {canManageUsers ? (
                    <Button type="primary" onClick={() => openUserModal()}>
                      {t("access.newUser")}
                    </Button>
                  ) : null}
                </div>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={users}
                  pagination={{ pageSize: 8 }}
                  columns={[
                    { title: t("access.username"), dataIndex: "username" },
                    { title: t("access.displayName"), dataIndex: "displayName" },
                    {
                      title: t("access.rolesLabel"),
                      dataIndex: "roles",
                      render: (value: UserInfo["roles"]) =>
                        value?.length
                          ? value.map((role) => (
                              <Tag key={role.id} color="blue">
                                {role.name}
                              </Tag>
                            ))
                          : "-"
                    },
                    {
                      title: t("common.status"),
                      dataIndex: "isActive",
                      render: (value: boolean) => (value ? t("access.active") : t("access.disabled"))
                    },
                    {
                      title: t("access.actions"),
                      render: (_, record) => (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button size="small" onClick={() => openUserModal(record)}>
                            {t("common.edit")}
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={async () => {
                              await deleteUser(record.id);
                              message.success(t("common.deleted"));
                              await load();
                            }}
                          >
                            {t("common.delete")}
                          </Button>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            )
          },
          ...(canManageRoles
            ? [
                {
                  key: "roles",
                  label: t("access.roles"),
                  children: (
                    <Card className="section-card">
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <Typography.Text type="secondary">{t("access.roleHint")}</Typography.Text>
                        <Button type="primary" onClick={() => openRoleModal()}>
                          {t("access.newRole")}
                        </Button>
                      </div>
                      <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={roles}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          { title: t("access.roleName"), dataIndex: "name" },
                          { title: t("access.roleDescription"), dataIndex: "description" },
                          {
                            title: t("access.permissions"),
                            dataIndex: "permissions",
                            render: (value: string[]) => value?.length ?? 0
                          },
                          {
                            title: t("access.actions"),
                            render: (_, record) => (
                              <div style={{ display: "flex", gap: 8 }}>
                                <Button size="small" onClick={() => openRoleModal(record)}>
                                  {t("common.edit")}
                                </Button>
                                <Button
                                  size="small"
                                  danger
                                  onClick={async () => {
                                    await deleteRole(record.id);
                                    message.success(t("common.deleted"));
                                    await load();
                                  }}
                                >
                                  {t("common.delete")}
                                </Button>
                              </div>
                            )
                          }
                        ]}
                      />
                    </Card>
                  )
                }
              ]
            : [])
        ]}
      />

      <Modal
        title={editingUser ? t("access.editUser") : t("access.createUser")}
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        onOk={() => userForm.submit()}
        confirmLoading={saving}
        okButtonProps={{ disabled: !canManageUsers }}
      >
        <Form
          layout="vertical"
          form={userForm}
          onFinish={handleUserSubmit}
          initialValues={{ isActive: true, roleIds: [] }}
        >
          <Form.Item label={t("access.username")} name="username" rules={[{ required: true }]}>
            <Input disabled={Boolean(editingUser)} />
          </Form.Item>
          <Form.Item label={t("access.displayName")} name="displayName">
            <Input />
          </Form.Item>
          <Form.Item
            label={t("access.password")}
            name="password"
            rules={editingUser ? [] : [{ required: true, message: t("access.password") }]}
          >
            <Input.Password placeholder={editingUser ? t("access.passwordHint") : t("access.passwordSet")} />
          </Form.Item>
          <Form.Item label={t("access.rolesLabel")} name="roleIds">
            <Select mode="multiple" options={roleOptions} placeholder={t("access.rolesLabel")} />
          </Form.Item>
          <Form.Item label={t("common.active")} name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRole ? t("access.editRole") : t("access.createRole")}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={() => roleForm.submit()}
        confirmLoading={saving}
        okButtonProps={{ disabled: !canManageRoles }}
      >
        <Form layout="vertical" form={roleForm} onFinish={handleRoleSubmit}>
          <Form.Item label={t("access.roleName")} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t("access.roleDescription")} name="description">
            <Input />
          </Form.Item>
          <Form.Item label={t("access.permissions")} name="permissions">
            <Select
              mode="multiple"
              options={permissionOptions}
              placeholder={t("access.permissions")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccessControl;
