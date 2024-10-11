"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message, Row, Col } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import Loading from "@/app/components/loading";
import { throttle } from "lodash";

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
  const [saveStatus, setSaveStatus] = useState<
    "success" | "failed" | "pending"
  >("pending");
  const [form] = Form.useForm();

  const saveData = async (formValue: any) => {
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
        setSaveStatus("success"); // 保存成功，设为绿色
      } else {
        setSaveStatus("failed"); // 保存失败，设为灰色
      }
    } catch (error: any) {
      setSaveStatus("failed");
      message.error("自动保存失败");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSaveData = useCallback(throttle(saveData, 2000), [customName]);

  // 修改 onValuesChange 使用节流后的函数
  const onValuesChange = (changedValues: any, allValues: any) => {
    setSaveStatus("pending"); // 设为等待保存状态
    throttledSaveData(allValues); // 使用节流后的保存函数
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
        console.log(result);

        setFlowerDateOption(
          result.map((i: any) => ({
            key: `${i.id}_${i.Name}_${i.Name_En}_${i.BotanicalName}_${i.Packing}${i.Packing_Unit}`,
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

  // 显示保存状态的提示灯颜色
  const getSaveStatusColor = () => {
    if (saveStatus === "success") {
      return "green"; // 保存成功，绿色
    } else if (saveStatus === "failed") {
      return "gray"; // 保存失败，灰色
    }
    return "orange"; // 正在保存，橙色
  };

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
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              {/* 显示保存状态提示灯 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>保存状态：</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: getSaveStatusColor(),
                    marginLeft: "8px",
                  }}
                ></div>
              </div>
            </Col>
          </Row>
          <Form
            name="dynamic_form_nest_item"
            onValuesChange={onValuesChange} // 监听表单变化
            autoComplete="off"
            layout="vertical"
            onFinish={saveData}
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
                      onClick={() => {
                        add();
                        add();
                        add();
                        add();
                        add();
                        add();
                        add();
                        add();
                        add();
                        add();
                      }}
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
              <Button
                onClick={() => window.location.reload()}
                htmlType="submit"
              >
                清空表单
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default SetOrderPage;
