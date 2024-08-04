"use client";
import React, { useEffect, useState } from "react";
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
          style={{ width: "4rem", marginRight: "0", borderRight: "0" }}
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

interface OrderFieldProps {
  field: any;
  restField: any;
  flowerDate: any;
  species: any[];
  remove: (name: number) => void;
}

const OrderField: React.FC<OrderFieldProps> = ({
  field,
  restField,
  flowerDate,
  species,
  remove,
}) => {
  const [kind, setKind] = useState<string | undefined>();
  const [inprice, setInPrice] = useState<number | null>();
  const [price, setPrice] = useState<number | null>();
  const [quantity, setQuantity] = useState<number | null>();
  const [total, setTotal] = useState<number | null>();

  useEffect(() => {
    setTotal(price && quantity && price * quantity);
  }, [price, quantity]);

  return (
    <Space
      key={field.key}
      style={{ display: "flex", marginBottom: 8 }}
      align="baseline"
    >
      <Form.Item
        {...restField}
        name={[field.name, "species"]}
        rules={[{ required: true, message: "缺少花的种类" }]}
      >
        <Select placeholder="选择花的种类" onChange={(i) => setKind(i)}>
          {species?.map((i) => (
            <Option key={i} value={i}>
              {i}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "mingcheng"]}
        rules={[{ required: true, message: "缺少花的名称" }]}
      >
        <Select placeholder="选择花的名称">
          {flowerDate &&
            flowerDate[kind] &&
            Object.values(flowerDate[kind]) &&
            (Object.values(flowerDate[kind]) as any[]).map(
              (i: any) =>
                i.Name && (
                  <Option key={i.Name} value={i.Name}>
                    {i?.Name}
                  </Option>
                )
            )}
        </Select>
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "guige"]}
        rules={[{ required: true, message: "缺少花的规格" }]}
      >
        <PriceInput />
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "jinjia"]}
        rules={[{ required: true, message: "缺少花的进价" }]}
        initialValue={0}
        label="进价"
      >
        <Input
          placeholder="进价"
          type="text"
          style={{ width: "4rem" }}
          onChange={(e) => setInPrice(parseFloat(e.target.value))}
        />
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "danjia"]}
        rules={[{ required: true, message: "缺少花的单价" }]}
        initialValue={0}
        label="单价"
      >
        <Input
          placeholder="单价"
          type="text"
          style={{ width: "4rem" }}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "shuliang"]}
        rules={[{ required: true, message: "缺少花的数量" }]}
        initialValue={1}
        label="数量"
      >
        <Input
          type="text"
          placeholder="数量"
          style={{ width: "4rem" }}
          onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))}
        />
      </Form.Item>
      <Form.Item {...restField}>总价：{total}</Form.Item>
      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Space>
  );
};

type SetOrderComponetProps = {
  flowerDate: any;
  species: any;
};
const SerOrderComponet: React.FC<SetOrderComponetProps> = (props) => {
  const { flowerDate, species } = props;

  return (
    <div
      style={{
        border: "1px dashed black",
        padding: "1rem",
        borderRadius: "1rem",
        marginBottom: "1rem",
      }}
    >
      <Text fw={700} size="xl">
        Paking
      </Text>
      <br />
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{ maxWidth: 900 }}
        autoComplete="off"
      >
        <Form.List name="pack1">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <OrderField
                  key={field.key}
                  field={field}
                  restField={field}
                  flowerDate={flowerDate}
                  species={species}
                  remove={remove}
                />
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
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Space.Compact style={{ width: "21rem" }}>
              <Input style={{ width: "30%" }} defaultValue="总重：" />
              <Input style={{ width: "80%" }} defaultValue="26888888" />
            </Space.Compact>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SerOrderComponet;
