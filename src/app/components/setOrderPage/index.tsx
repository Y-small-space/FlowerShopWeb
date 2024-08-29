"use client";
import React, { use, useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";
import { Text } from "@mantine/core";
import { string } from "prop-types";

const { Option } = Select;

interface PriceInputProps {
  id?: string;
  value?: PriceValue;
  paking: any;
  paking_unit: any;
  onChange?: (value: PriceValue) => void;
}

interface PriceValue {
  number?: string;
}

const PriceInput: React.FC<PriceInputProps> = (props) => {
  const { id, value = {}, onChange, paking, paking_unit } = props;
  const [number, setNumber] = useState(paking_unit);
  const [currency, setCurrency] = useState();
  console.log(paking_unit);

  const triggerChange = (changedValue: { number?: string; currency?: any }) => {
    onChange?.({ number: paking_unit, currency, ...value, ...changedValue });
  };

  const onCurrencyChange = (newCurrency: any) => {
    if (!("currency" in value)) {
      setCurrency(newCurrency);
    }
    triggerChange({ currency: newCurrency });
  };

  useEffect(() => {
    console.log(paking_unit);
  }, []);

  return (
    <span id={id}>
      <Space.Compact>
        <Select
          value={(value as any)?.currency || currency}
          style={{
            width: 100,
            margin: "0 8px",
            marginLeft: "0",
            borderRight: "0",
            marginRight: "0",
          }}
          onChange={onCurrencyChange}
        >
          {paking &&
            paking.map((i: any) => (
              <Option key={i} value={i}>
                {i}
              </Option>
            ))}
        </Select>
        <Input
          type="text"
          value={paking_unit || value?.number || null}
          style={{ width: "6rem", borderLeft: "0" }}
        />
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
  In: any;
  key: any;
}

const OrderField: React.FC<OrderFieldProps> = ({
  field,
  restField,
  flowerDate,
  species,
  remove,
  In,
}) => {
  const [kind, setKind] = useState<string | undefined>();
  const [inprice, setInPrice] = useState<number | null>();
  const [price, setPrice] = useState<number | null>();
  const [quantity, setQuantity] = useState<number | null>();
  const [total, setTotal] = useState<number | null>();
  const [paking, setPaking] = useState();
  const [paking_unit, setPakingUnit] = useState();
  const [weight, setWeight] = useState();

  useEffect(() => {
    setTotal(price && quantity && price * quantity);
  }, [price, quantity]);
  useEffect(() => {
    if (!kind) return;
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
    const paking: any = paking_key.map((i) => flowerDate[kind][0][i]);
    const paking_unit = paking_unit_key.map((i) => flowerDate[kind][0][i]);
    const weight: any = weight_key.map((i) => flowerDate[kind][0][i]);

    setPaking(paking);
    setPakingUnit(paking_unit[0]);
    setWeight(weight);
  }, [kind]);

  return (
    <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
      <Form.Item
        {...restField}
        name={[field.name, "species"]}
        rules={[{ required: true, message: "缺少花的种类" }]}
      >
        <Select placeholder="选择花的种类" onChange={(i) => setKind(i)}>
          {species?.map((i) => (
            <Option key={`${i}`} value={i}>
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
        name={[field.name, "guige"]}
        rules={[{ required: true, message: "缺少花的规格" }]}
      >
        <PriceInput paking={paking} paking_unit={paking_unit} />
      </Form.Item>
      <Form.Item
        {...restField}
        name={[field.name, "weight/kg"]}
        initialValue={0}
        label="重量"
        rules={[{ required: true, message: "缺少花的单重" }]}
      >
        <Select placeholder="重量">
          {weight &&
            (weight as any)?.map((i: any) => (
              <Option key={`${i}`} value={i}>
                {i}
              </Option>
            ))}
        </Select>
      </Form.Item>
      {!In && (
        <>
          <Form.Item
            {...restField}
            name={[field.name, "shuliang"]}
            rules={[{ required: true, message: "缺少花的数量" }]}
            initialValue={0}
            label="数量"
          >
            <Input
              type="text"
              placeholder="数量"
              onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))}
            />
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
          <Form.Item {...restField}>总价：{total}</Form.Item>
        </>
      )}
      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Space>
  );
};

type SetOrderComponetProps = {
  flowerDate?: any;
  species?: any;
  packingCount?: any;
  In?: any;
  setFormValue?: any;
  key?: any;
  formDate?: any;
  num?: any;
};

const SerOrderComponet: React.FC<SetOrderComponetProps> = (props) => {
  const { flowerDate, species, packingCount, In, setFormValue, formDate, num } =
    props;
  const [diable, setDisabel] = useState(false);
  const onFinish = (values: any) => {
    setDisabel(true);
    const aForm = { PakingID: packingCount, values: values };
    setFormValue(aForm);
    console.log("Received values of form:", values);
  };
  const Date: any = {};
  console.log("num", num);
  console.log(flowerDate);

  if (formDate) {
    const key: any = Object?.keys(formDate)[num - 1];
    const value: any = Object?.values(formDate)[num - 1];
    Date[key] = value;
    console.log("formDate", Date);
    console.log(`Paking${num || packingCount}`);
  }

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
        Paking_ID:{num || packingCount}
      </Text>
      <br />
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        style={{ maxWidth: 1000 }}
        autoComplete="off"
        onChange={() => setDisabel(false)}
        initialValues={Date}
      >
        <Form.List name={`Paking${num || packingCount}`}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <OrderField
                  key={String(field)}
                  field={field}
                  restField={field}
                  flowerDate={flowerDate}
                  species={species}
                  remove={remove}
                  In={In}
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
            <Button type="primary" htmlType="submit" disabled={diable}>
              保存
            </Button>
            {!In && (
              <Space.Compact style={{ width: "20rem" }}>
                <Input style={{ width: "30%" }} defaultValue="总重：" />
                <Input style={{ width: "80%" }} defaultValue="0" />
              </Space.Compact>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SerOrderComponet;
