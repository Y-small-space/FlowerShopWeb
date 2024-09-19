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

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1; // 月份从0开始，所以要加1
const day = now.getDate();
const { Option } = Select;

const SetOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [date, setDate] = useState("");
  const [flowerDateOption, setFlowerDateOption] = useState<any>();

  const onFinish = async (formValue: any) => {
    console.log(formValue);

    if (!customName) {
      message.error("客户姓名为必填！！！");
      return;
    }
    setLoading(true);
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
        message.success("保存成功！！！");
      }
      setLoading(false);
    } catch (error: any) {
      message.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
        const result: any = [];
        console.log("====================================");
        console.log(Object.values(data)[0]);
        console.log("====================================");
        Object.values(data).forEach((i: any) => {
          result.push(...i);
        });
        setFlowerDateOption(
          result.map((i: any) => ({
            key: `${i.Name}`,
            value: `${i.id}_${i.Name}_${i.Name_En}_${i.BotanicalName}`,
            label: `${i.Name}_${i.Name_En}_${i.BotanicalName}`,
          }))
        );
        console.log(result);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }

    fetchFlowerDate();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <Text fw={700} size="xl">
            创建订单
          </Text>
          <br />
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                size="large"
                placeholder="客户姓名"
                prefix={<UserOutlined />}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Input
                disabled={true}
                size="large"
                value={date || `${year}-${month}-${day}`}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
          </Row>
          <Form
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.List name="Order">
              {(fields, { add, remove }) => {
                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "PackageID"]}
                          rules={[
                            { required: true, message: "PackageID为必填" },
                          ]}
                        >
                          <Input
                            style={{ minWidth: "4rem", maxWidth: "8rem" }}
                            placeholder="PackageID"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "FlowerName"]}
                          rules={[
                            { required: true, message: "花的名称为必填" },
                          ]}
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
                          >
                            {" "}
                          </Select>
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
                        onClick={() => {
                          add();
                        }}
                        block
                        icon={<PlusOutlined />}
                      >
                        增加订单
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
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
