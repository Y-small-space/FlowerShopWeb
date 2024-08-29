"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import SerOrderComponet from "../../components/setOrderPage";
import { UserOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import Loading from "@/app/components/loading";
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1; // 月份从0开始，所以要加1
const day = now.getDate();
const { Option } = Select;

const SetOrderPage: React.FC = () => {
  const [flowerDate, setFlowerDate] = useState();
  const [species, setSpecies] = useState<any[]>();
  const [kind, setKind] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [paking, setPaking] = useState();
  const [paking_unit, setPakingUnit] = useState();
  const [weight, setWeight] = useState();
  const [customName, setCustomName] = useState("");
  const [date, setDate] = useState("");
  const onFinish = async (formValue: any) => {
    if (!customName) {
      message.error("客户姓名为必填！！！");
      return;
    }
    console.log("Received values of form:", formValue);
    setLoading(true);
    try {
      // 将数据保存到对象中
      const orderData = {
        customerName: customName,
        date: date || String(`${year}-${month}-${day}`),
        contents: formValue,
      };
      console.log("Order Data:", orderData);

      const response = await fetch("/api/uploadOrderExcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customName, year, month, day, formValue }),
      });

      if (response.ok) {
        message.success("保存成功！！！");
      }
      console.log(response);

      const data = await response.json();

      console.log(data.message);
      // 清空表单数据
      setLoading(false);
    } catch (error: any) {
      message.error(error);
      console.error("Error saving order:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
        console.log("flawerDate:", data);
        if (data) {
          setSpecies(Object.keys(data));
          setFlowerDate(data);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFlowerDate();
  }, []);

  useEffect(() => {
    if (!kind) return;
    if (!flowerDate) return;
    console.log("1", flowerDate[kind][0]);
    const paking_key = Object.keys(flowerDate[kind][0]).filter(
      (i) => i.includes("Packing") && !i.includes("Unit")
    );
    const paking_unit_key = Object.keys(flowerDate[kind][0]).filter((i) =>
      i.includes("Packing_Unit")
    );
    const weight_key = Object.keys(flowerDate[kind][0]).filter((i) =>
      i.includes("weight")
    );
    const paking = paking_key.map((i) => flowerDate[kind][0][i]);
    const paking_unit = paking_unit_key.map((i) => flowerDate[kind][0][i]);
    const weight = weight_key.map((i) => flowerDate[kind][0][i]);

    setPaking(paking);
    setPakingUnit(paking_unit[0]);
    setWeight(weight);
  }, [kind]);

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Input
              size="large"
              placeholder="客户姓名"
              prefix={<UserOutlined />}
              style={{ width: "20%" }}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Input
              size="large"
              value={date || String(`${year}-${month}-${day}`)}
              style={{ width: "20%", marginRight: "23%" }}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <br />
          <Form
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            style={{ maxWidth: 900 }}
            autoComplete="off"
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
                      <Form.Item
                        {...restField}
                        name={[name, "PackageID"]}
                        rules={[{ required: true, message: "PackageID为必填" }]}
                      >
                        <Input
                          style={{ width: "8rem" }}
                          placeholder="PackageID"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerSpecies"]}
                        rules={[{ required: true, message: "花的种类为必填" }]}
                      >
                        <Select
                          placeholder="选择花的种类"
                          onChange={(i) => setKind(i)}
                        >
                          {species?.map((i) => (
                            <Option key={`${i}`} value={i}>
                              {i}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerName"]}
                        rules={[{ required: true, message: "花的名称为必填" }]}
                      >
                        <Select placeholder="选择花的名称">
                          {flowerDate &&
                            kind &&
                            flowerDate[kind] &&
                            Object.values(flowerDate[kind]) &&
                            (Object.values(flowerDate[kind]) as any[]).map(
                              (i: any) =>
                                i.Name && (
                                  <Option key={`${i.Name}`} value={i.Name}>
                                    {i?.Name}
                                  </Option>
                                )
                            )}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerPacking"]}
                        rules={[{ required: true, message: "花的规格为必填" }]}
                      >
                        <Select placeholder="选择花的规格">
                          {paking &&
                            (paking as any)?.map((i: any) => (
                              <Option key={i} value={i}>
                                {i}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerWeight"]}
                        rules={[{ required: true, message: "花的单重为必填" }]}
                      >
                        <Select placeholder="选择花的单重">
                          {weight &&
                            (weight as any)?.map((i: any) => (
                              <Option key={i} value={i}>
                                {i + "weight/kg"}
                              </Option>
                            ))}
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
