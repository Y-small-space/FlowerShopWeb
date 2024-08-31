"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import { useForm } from "antd/es/form/Form";
import Loading from "@/app/components/loading";
import { useSearchParams } from "next/navigation";
import "./index.css"; // 引入样式文件

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
  const [form] = useForm();
  const [initialValues, setInitialValues] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const item = searchParams.get("item");
  const [time, setTime] = useState("");

  const onFinish = async (formValue: any) => {
    console.log(formValue);

    // setLoading(true);
    // const [year, month, day] = time.split("-");
    // try {
    //   const response = await fetch("/api/uploadOrderExcel", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ customName, year, month, day, formValue }),
    //   });

    //   if (response.ok) {
    //     message.success("保存成功！！！");
    //   }
    //   setLoading(false);
    // } catch (error) {
    //   message.error("保存订单出错");
    //   console.error("Error saving order:", error);
    // }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();

        console.log(data);

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
    async function fetchOrderData() {
      try {
        const response = await fetch(
          `/api/getOneExcel?filePath=${encodeURIComponent(item as any)}`
        );
        console.log(response);

        setCustomName(item?.split("_")[0] as any);
        setTime(item?.split("_")[1].split(".")[0] as any);
        const data = await response.json();
        console.log(data);

        console.log(data.summary);

        setInitialValues(data.orders);
        form.setFieldsValue({
          Order: data.orders,
          customFee: data.summary.CustomFee,
          shippingFee: data.summary.ShippingFee,
          packagingFee: data.summary.PackagingFee,
          certificateFee: data.summary.CertificateFee,
          fumigationFee: data.summary.FumigationFee,
        });
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    }
    fetchOrderData();
  }, [form]);

  useEffect(() => {
    if (!kind || !flowerDate) return;
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
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="container">
          <Text fw={700} size="xl">
            完善订单
          </Text>
          <br />
          <div className="form-header">
            <Input
              size="large"
              placeholder="客户姓名"
              prefix={<UserOutlined />}
              className="form-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Input
              size="large"
              value={time || String(`${year}-${month}-${day}`)}
              className="form-input"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <br />
          <Form
            form={form}
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              style={{ width: "20%" }}
              label="报关服务费"
              name="customFee"
            >
              <Input type="number" placeholder="请输入报关服务费" />
            </Form.Item>
            <Form.Item style={{ width: "20%" }} label="运费" name="shippingFee">
              <Input type="number" placeholder="请输入运费" />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="打包杂费"
              name="packagingFee"
            >
              <Input type="number" placeholder="请输入打包杂费" />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="证书费"
              name="certificateFee"
            >
              <Input type="number" placeholder="请输入证书费" />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="熏蒸费"
              name="fumigationFee"
            >
              <Input type="number" placeholder="请输入熏蒸费" />
            </Form.Item>
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
                          style={{ width: "4rem" }}
                          placeholder="PackageID"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "FlowerSpecies"]}
                        rules={[{ required: true, message: "花的种类为必填" }]}
                      >
                        <Select
                          className="form-item"
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
                        <Select
                          className="form-item"
                          placeholder="选择花的名称"
                        >
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
                        <Select
                          className="form-item"
                          placeholder="选择花的规格"
                        >
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
                        rules={[{ required: true, message: "花的重量为必填" }]}
                      >
                        <Select
                          className="form-item"
                          placeholder="选择花的重量"
                        >
                          {weight &&
                            (weight as any)?.map((i: any) => (
                              <Option key={i} value={i}>
                                {i}
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
                      <Form.Item
                        {...restField}
                        name={[name, "InPrice"]}
                        rules={[{ required: true, message: "进价为必填" }]}
                      >
                        <Input style={{ width: "4rem" }} placeholder="进价" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "OutPrice"]}
                        rules={[{ required: true, message: "售价为必填" }]}
                      >
                        <Input style={{ width: "4rem" }} placeholder="售价" />
                      </Form.Item>
                      <Form.Item
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.Order[name]?.Number !==
                            curValues.Order[name]?.Number ||
                          prevValues.Order[name]?.OutPrice !==
                            curValues.Order[name]?.OutPrice ||
                          prevValues.Order !== curValues.Order
                        }
                      >
                        {({ getFieldValue }) => {
                          const number = getFieldValue([
                            "Order",
                            name,
                            "Number",
                          ]);
                          const outPrice = getFieldValue([
                            "Order",
                            name,
                            "OutPrice",
                          ]);
                          const weight = getFieldValue([
                            "Order",
                            name,
                            "FlowerWeight",
                          ]);

                          const totalWeight =
                            number && weight ? number * weight : 0;

                          // 计算每个订单均摊的杂费
                          const formValues = form.getFieldsValue(); // 获取表单的所有值
                          const totalMiscFee =
                            (Number(formValues.customFee) || 0) +
                            (Number(formValues.shippingFee) || 0) +
                            (parseInt(formValues.packagingFee) || 0) +
                            (parseInt(formValues.certificateFee) || 0) +
                            (parseInt(formValues.fumigationFee) || 0);

                          const totalNumber = Number(
                            (formValues.Order || []).reduce(
                              (acc: number, curr: any) =>
                                acc + Number(curr?.Number ?? 0),
                              0
                            )
                          );

                          console.log("totalnumber", totalNumber);

                          const totalMiscFeePerItem =
                            totalNumber > 0 ? totalMiscFee / totalNumber : 0;

                          console.log(totalMiscFeePerItem);
                          console.log(totalMiscFee);

                          const adjustedPrice = outPrice
                            ? Number(outPrice) + totalMiscFeePerItem
                            : totalMiscFeePerItem;
                          const amount =
                            adjustedPrice && number
                              ? number * adjustedPrice
                              : number && outPrice
                              ? number * outPrice
                              : 0;
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span>总额: {amount.toFixed(2)}</span>
                              <span>总重: {totalWeight.toFixed(2)}</span>
                              <span>
                                均摊后的售价:{" "}
                                {(adjustedPrice
                                  ? adjustedPrice
                                  : outPrice
                                )?.toFixed(2)}
                              </span>{" "}
                              {/* 保留两位小数 */}
                            </div>
                          );
                        }}
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
                      添加新订单
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存订单
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default SetOrderPage;
