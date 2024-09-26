"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message, Row, Col } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import Loading from "@/app/components/loading";
import { redirect, useSearchParams } from "next/navigation";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const { Option } = Select;

const SetOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [date, setDate] = useState(`${year}-${month}-${day}`);
  const [flowerDateOption, setFlowerDateOption] = useState<any>();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const item = searchParams.get("item");
  const [time, setTime] = useState("");

  const saveData = async (formValue: any) => {
    setLoading(true);
    if (!customName) {
      message.error("客户姓名为必填！！！");
      return;
    }
    try {
      const response = await fetch("/api/uploadOrderExcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customName,
          year,
          month,
          day,
          formValue,
        }),
        cache: "no-store",
      });
      if (response.ok) {
        message.success("保存成功");
      }
    } catch (error: any) {
      message.error("保存失败", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
        const result: any = [];
        Object.values(data).forEach((i: any) => {
          result.push(...i);
        });
        setFlowerDateOption(
          result.map((i: any) => ({
            key: `${i.Name}`,
            value: `${i.id}_${i.Name}_${i.Name_En}_${i.BotanicalName}_${i.Packing}${i.Packing_Unit}`,
            label: `${i.Name}_${i.Name_En}_${i.BotanicalName}`,
          }))
        );
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    localStorage.setItem("id", "1");

    fetchFlowerDate();
  }, []);

  useEffect(() => {
    async function fetchOrderData() {
      try {
        const response = await fetch(
          `/api/getOneExcel?filePath=${encodeURIComponent(item as any)}`
        );
        setCustomName(item?.split("_")[0] as any);
        setTime(item?.split("_")[1].split(".")[0] as any);
        const data = await response.json();
        console.log("====================================");
        console.log(data);
        console.log("====================================");
        form.setFieldsValue({
          Order: data.orders,
        });
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    }
    fetchOrderData();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <Text fw={700} size="xl">
            编辑订单
          </Text>
          <br />
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                placeholder="客户姓名"
                prefix={<UserOutlined />}
                onChange={(e) => setCustomName(e.target.value)}
                value={customName}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                disabled={true}
                size="large"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
          </Row>
          <Form
            name="dynamic_form_nest_item"
            onFinish={saveData}
            autoComplete="off"
            layout="vertical"
            form={form}
          >
            <Form.List name="Order">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item {...restField} name={[name, "PackageID"]}>
                        <Input
                          style={{ minWidth: "4rem", maxWidth: "8rem" }}
                          placeholder="PackageID"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerName"]}
                        rules={[{ required: true, message: "花的名称为必填" }]}
                      >
                        <Select
                          showSearch
                          filterOption={(input: any, option: any) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          placeholder="选择花的名称"
                          style={{ maxWidth: "10rem" }}
                          options={flowerDateOption}
                        ></Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "Number"]}
                        rules={[{ required: true, message: "数量为必填" }]}
                      >
                        <Input style={{ width: "4rem" }} placeholder="数量" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      增加订单
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default SetOrderPage;
