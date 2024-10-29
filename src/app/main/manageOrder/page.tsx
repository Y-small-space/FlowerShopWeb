"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message, Table } from "antd";
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
import * as XLSX from "xlsx"; // 使用 SheetJS 库来生成 Excel 文件
import SelectModal from "./selectModal";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1; // 月份从0开始，所以要加1
const day = now.getDate();
const { Option } = Select;

const SetOrderPage: React.FC = () => {
  const [flowerDate, setFlowerDate] = useState();
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [form] = useForm();
  const [initialValues, setInitialValues] = useState<any>([]);
  const searchParams = useSearchParams();
  const item = searchParams.get("item");
  const [time, setTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fee, setFee] = useState<any>();
  const [flowerDateOption, setFlowerDateOption] = useState<any>();
  const [money, setMoney] = useState("");
  const Option = [
    { key: "USD", value: "USD", label: "USD" },
    { key: "CNY", value: "CNY", label: "CNY" },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onFinish = async (formValue: any) => {
    const {
      certificateFee,
      customFee,
      fumigationFee,
      packagingFee,
      shippingFee,
      Order,
    } = formValue;
    // console.log(formValue);

    const sum =
      parseFloat(certificateFee) +
      parseFloat(customFee) +
      parseFloat(fumigationFee) +
      parseFloat(packagingFee) +
      parseFloat(shippingFee);
    let amout = 0;
    Order?.forEach((i: any) => {
      amout += parseFloat(i.Number);
    });
    const avarageFee = sum / amout;
    const formValueAferHandle = Order?.map((i: any) => ({
      ...i,
      AdjustedPrice: avarageFee + parseFloat(i?.OutPrice),
      TotalPrice: (avarageFee + parseFloat(i?.OutPrice)) * parseFloat(i.Number),
    }));
    formValue.Order = formValueAferHandle;
    setLoading(true);
    const [year, month, day] = time.split("-");
    try {
      const response = await fetch("/api/uploadOrderExcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customName, year, month, day, formValue }),
      });

      if (response.ok) {
        message.success("保存成功！！！");
      }
      setLoading(false);
    } catch (error) {
      message.error("保存订单出错");
      console.error("Error saving order:", error);
    }
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

        if (data) {
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
        setCustomName(item?.split("_")[0] as any);
        setTime(item?.split("_")[1].split(".")[0] as any);
        const data = await response.json();

        setInitialValues(data.orders);
        setFee({
          customFee: data.summary.CustomFee,
          shippingFee: data.summary.ShippingFee,
          packagingFee: data.summary.PackagingFee,
          certificateFee: data.summary.CertificateFee,
          fumigationFee: data.summary.FumigationFee,
        });
        setMoney(data.summary.Money);

        form.setFieldsValue({
          Order: data.orders,
          customFee: data.summary.CustomFee,
          shippingFee: data.summary.ShippingFee,
          packagingFee: data.summary.PackagingFee,
          certificateFee: data.summary.CertificateFee,
          fumigationFee: data.summary.FumigationFee,
          money: data.summary.Money,
        });
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    }
    fetchOrderData();
  }, [form]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 阻止默认行为
    }
  };

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
              disabled
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
            layout="vertical"
            onKeyDown={handleKeyDown}
          >
            <Form.Item style={{ width: "20%" }} label="单位" name="money">
              <Select
                placeholder="请选择单位"
                options={Option}
                onChange={(e) => setMoney(e)}
              />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="报关服务费"
              name="customFee"
              rules={[
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "请输入有效的数字",
                },
              ]}
            >
              <Input placeholder="请输入报关服务费" addonAfter={<>{money}</>} />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="运费"
              name="shippingFee"
              rules={[
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "请输入有效的数字",
                },
              ]}
            >
              <Input placeholder="请输入运费" addonAfter={<>{money}</>} />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="打包杂费"
              name="packagingFee"
              rules={[
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "请输入有效的数字",
                },
              ]}
            >
              <Input placeholder="请输入打包杂费" addonAfter={<>{money}</>} />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="证书费"
              name="certificateFee"
              rules={[
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "请输入有效的数字",
                },
              ]}
            >
              <Input placeholder="请输入证书费" addonAfter={<>{money}</>} />
            </Form.Item>
            <Form.Item
              style={{ width: "20%" }}
              label="熏蒸费"
              name="fumigationFee"
              rules={[
                {
                  pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: "请输入有效的数字",
                },
              ]}
            >
              <Input placeholder="请输入熏蒸费" addonAfter={<>{money}</>} />
            </Form.Item>

            <Form.List name="Order">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{
                        display: "flex",
                        marginBottom: 8,
                        overflow: "auto",
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        label="PackageID"
                        {...restField}
                        name={[name, "PackageID"]}
                      >
                        <Input
                          style={{ width: "8rem" }}
                          placeholder="PackageID"
                        />
                      </Form.Item>
                      <Form.Item
                        label="名称"
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
                          style={{ maxWidth: "20rem" }}
                          options={flowerDateOption}
                        ></Select>
                      </Form.Item>
                      <Form.Item
                        label="单重"
                        {...restField}
                        name={[name, "FlowerWeight"]}
                      >
                        <Input
                          style={{ width: "12rem" }}
                          placeholder="单重"
                          addonAfter={<>weight/kg</>}
                        />
                      </Form.Item>
                      <Form.Item
                        label="数量"
                        {...restField}
                        name={[name, "Number"]}
                        rules={[
                          {
                            required: true,
                            message: "数量为必填项",
                          },
                          {
                            pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                            message: "请输入有效的数字",
                          },
                        ]}
                      >
                        <Input
                          style={{ width: "9rem" }}
                          placeholder="数量"
                          addonAfter={<>个</>}
                        />
                      </Form.Item>
                      <Form.Item
                        label="进价"
                        {...restField}
                        name={[name, "InPrice"]}
                        rules={[
                          {
                            pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                            message: "请输入有效的数字",
                          },
                        ]}
                      >
                        <Input
                          style={{ width: "9rem" }}
                          placeholder="进价"
                          addonAfter={<>{money}</>}
                        />
                      </Form.Item>
                      <Form.Item
                        label="售价"
                        {...restField}
                        name={[name, "OutPrice"]}
                        rules={[
                          {
                            pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
                            message: "请输入有效的数字",
                          },
                        ]}
                      >
                        <Input
                          style={{ width: "9rem" }}
                          placeholder="售价"
                          addonAfter={<>{money}</>}
                        />
                      </Form.Item>
                      <Form.Item
                        label="均摊售价｜总额｜总重"
                        shouldUpdate={(prevValues, curValues) => {
                          return (
                            prevValues.Order[name]?.Number !==
                              curValues.Order[name]?.Number ||
                            prevValues.Order[name]?.OutPrice !==
                              curValues.Order[name]?.OutPrice ||
                            prevValues.Order !== curValues.Order ||
                            prevValues.customFee !== curValues.customFee ||
                            prevValues.fumigationFee !==
                              curValues.fumigationFee ||
                            prevValues.packagingFee !==
                              curValues.packagingFee ||
                            prevValues.shippingFee !== curValues.shippingFee ||
                            prevValues.certificateFee !==
                              curValues.certificateFee
                          );
                        }}
                      >
                        {({ getFieldValue }) => {
                          const number = getFieldValue([
                            "Order",
                            name,
                            "Number",
                          ]);
                          const outPrice =
                            getFieldValue(["Order", name, "OutPrice"]) || 0;
                          const weight = getFieldValue([
                            "Order",
                            name,
                            "FlowerWeight",
                          ])?.split(" ")[0];
                          const exg = /^[0-9]+(\.[0-9]{1,2})?$/;

                          if (exg.test(outPrice) && exg.test(number)) {
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

                            const totalMiscFeePerItem =
                              totalNumber > 0 ? totalMiscFee / totalNumber : 0;

                            const adjustedPrice = outPrice
                              ? Number(outPrice) + totalMiscFeePerItem
                              : totalMiscFeePerItem;
                            const amount =
                              adjustedPrice && number
                                ? number * adjustedPrice
                                : number && outPrice
                                ? number * outPrice
                                : 0;

                            const columns = [
                              {
                                title: "均摊售价",
                                dataIndex: "adjustedPrice",
                                key: "adjustedPrice",
                                width: "4rem",
                              },
                              {
                                title: "总额",
                                dataIndex: "amount",
                                key: "amount",
                              },
                              {
                                title: "总重",
                                dataIndex: "totalWeight",
                                key: "totalWeight",
                              },
                            ];
                            const data = [
                              {
                                key: key,
                                amount: amount?.toFixed(2) || "0.00",
                                adjustedPrice:
                                  (adjustedPrice
                                    ? adjustedPrice
                                    : outPrice
                                  )?.toFixed(2) || "0.00",
                                totalWeight: totalWeight?.toFixed(2) || "0.00",
                              },
                            ];
                            return (
                              <Table
                                style={{
                                  transform: "0px -10px",
                                  fontSize: "10px",
                                  backgroundColor: "transparent",
                                }}
                                size="small"
                                columns={columns}
                                dataSource={data}
                                pagination={false}
                                showHeader={false}
                                bordered
                              />
                            );
                          }
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
                      添加订单
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: "1rem" }}
                onClick={showModal}
              >
                打印Excel
              </Button>
            </Form.Item>
          </Form>
          <SelectModal
            fee={fee}
            flowerDate={flowerDate}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            initialValues={initialValues}
            money={money}
          />
        </div>
      )}
    </>
  );
};

export default SetOrderPage;
