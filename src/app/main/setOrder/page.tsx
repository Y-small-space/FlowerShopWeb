"use client";
import React, { useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";
import { Text } from "@mantine/core";

const { Option } = Select;

const onFinish = (values: any) => {
  console.log("Received values of form:", values);
};

interface PriceInputProps {
  id?: string;
  value?: PriceValue;
  onChange?: (value: PriceValue) => void;
}

interface PriceValue {
  number?: number;
  currency?: Currency;
}

type Currency = "stems" | "bunch";

const PriceInput: React.FC<PriceInputProps> = (props) => {
  const { id, value = {}, onChange } = props;
  const [number, setNumber] = useState(0);
  const [currency, setCurrency] = useState<Currency>("bunch");

  const triggerChange = (changedValue: {
    number?: number;
    currency?: Currency;
  }) => {
    onChange?.({ number, currency, ...value, ...changedValue });
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(number)) {
      return;
    }
    if (!("number" in value)) {
      setNumber(newNumber);
    }
    triggerChange({ number: newNumber });
  };

  const onCurrencyChange = (newCurrency: Currency) => {
    if (!("currency" in value)) {
      setCurrency(newCurrency);
    }
    triggerChange({ currency: newCurrency });
  };

  return (
    <span id={id}>
      <Space.Compact>
        <Input
          type="text"
          value={value.number || number}
          onChange={onNumberChange}
          style={{ width: 100, marginRight: "0", borderRight: "0" }}
        />
        <Select
          value={value.currency || currency}
          style={{ width: 100, margin: "0 8px", marginLeft: "0" }}
          onChange={onCurrencyChange}
        >
          <Option value="bunch">bunch</Option>
          <Option value="stems">stems</Option>
        </Select>
      </Space.Compact>
    </span>
  );
};

const SerOrder: React.FC = () => {
  return (
    <div>
      <Text fw={700} size="xl">
        上传文件
      </Text>
      <br />
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{ maxWidth: 800 }}
        autoComplete="off"
      >
        <Form.List name="pack1">
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
                    name={[name, "zhonglei"]}
                    rules={[{ required: true, message: "缺少花的种类" }]}
                  >
                    <Select placeholder="选择花的种类">
                      <Option value="z1">种类1</Option>
                      <Option value="z2">种类1</Option>
                      <Option value="z3">种类1</Option>
                      <Option value="z4">种类1</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "mingcheng"]}
                    rules={[{ required: true, message: "缺少花的名称" }]}
                  >
                    <Select placeholder="选择花的名称">
                      <Option value="n1">名称</Option>
                      <Option value="n2">名称</Option>
                      <Option value="n3">名称</Option>
                      <Option value="n4">名称</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "guige"]}
                    rules={[{ required: true, message: "缺少花的规格" }]}
                  >
                    <PriceInput />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "danjia"]}
                    rules={[{ required: true, message: "缺少花的单价" }]}
                  >
                    <Input type="text" style={{ width: 100 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "shuliang"]}
                    rules={[{ required: true, message: "缺少花的数量" }]}
                  >
                    <Input type="text" style={{ width: 100 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "总价"]}
                    rules={[{ required: true, message: "缺少花的数量" }]}
                  >
                    总价：1
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
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SerOrder;
