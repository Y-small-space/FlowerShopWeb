// "use client";
// import React, { useEffect, useState } from "react";
// import { Button, Form, Input } from "antd";
// import { Text } from "@mantine/core";
// import SerOrderComponet from "../../components/setOrderPage";
// import { UserOutlined } from "@ant-design/icons";
// import { useSearchParams } from "next/navigation";
// import Loading from "@/app/components/loading";

// const onFinish = (values: any) => {
//   console.log("Received values of form:", values);
// };

// const now = new Date();

// const year = now.getFullYear();
// const month = now.getMonth() + 1; // 月份从0开始，所以要加1
// const day = now.getDate();

// const SerOrderPage: React.FC = () => {
//   const [flowerDate, setFlowerDate] = useState();
//   const [species, setSpecies] = useState<any[]>();
//   const [pakingCount, setPakingCount] = useState<any[]>([0]);
//   const [formData, setFormData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const searchParams = useSearchParams();
//   const item = searchParams.get("item");
//   const regex = /^([^_]+)_([^.]+)\.xlsx$/;
//   const match = item && item.match(regex);
//   const name = match[1]; // 匹配到的姓名
//   const date = match[2]; // 匹配到的日期
//   const [customName, setCustomName] = useState("");
//   const [formValue, setFormValue] = useState<any>([]);

//   useEffect(() => {
//     console.log("====================================");
//     console.log(item);
//     console.log("====================================");
//     async function fetchFlowerDate() {
//       try {
//         const response = await fetch("/api/getFlowerDate");
//         const data = await response.json();
//         if (data) {
//           setSpecies(Object.keys(data));
//           setFlowerDate(data);
//         }
//         console.log(data);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchFlowerDate();
//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           `/api/getOneExcel?filePath=${encodeURIComponent(item)}`
//         );
//         // setFormData(data);
//         const data = await response.json();
//         console.log("====================================");
//         console.log(data);
//         console.log("====================================");

//         const packingCount: any[] = [];
//         const handleDate = data.reduce((acc, item) => {
//           const key = `Paking${item.PakingID}`;
//           if (!acc[key]) {
//             acc[key] = [];
//             packingCount.push(item.PakingID);
//           }
//           acc[key].push(item);
//           return acc;
//         }, {});

//         console.log("====================================");
//         console.log(handleDate);
//         console.log("====================================");

//         console.log(packingCount);
//         setFormData(handleDate);
//         setPakingCount(packingCount);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     if (item) {
//       fetchData();
//     }
//   }, []);

//   const handleSave = async () => {
//     setLoading(true);
//     console.log("formvalue", formValue);

//     try {
//       const response = await fetch("/api/uploadOrderExcel", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ customName, year, month, day, formValue }),
//       });

//       console.log(response);

//       const data = await response.json();
//       console.log(data.message);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error saving order:", error);
//     }
//   };

//   const saveForm = (value: any) => {
//     setFormValue((prev: any[]) => {
//       // 检查数组中是否已经存在具有相同 packingID 的对象
//       const index = prev.findIndex((item) => item.PakingID === value.PakingID);

//       if (index !== -1) {
//         // 如果存在，则覆盖现有对象
//         const newArray = [...prev];
//         newArray[index] = value;
//         return newArray;
//       } else {
//         // 如果不存在，则添加新对象
//         return [...prev, value];
//       }
//     });
//   };

//   return (
//     <>
//       {loading ? (
//         <Loading />
//       ) : (
//         <div>
//           <Text fw={700} size="xl">
//             完善订单
//           </Text>
//           <br />
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <Input
//               size="large"
//               placeholder="客户姓名"
//               prefix={<UserOutlined />}
//               style={{ width: "20%" }}
//               value={name}
//             />
//             <Input
//               size="large"
//               value={date || String(`${year}-${month}-${day}`)}
//               style={{ width: "20%" }}
//             />
//           </div>
//           {pakingCount.length &&
//             pakingCount?.map((i) => (
//               <SerOrderComponet
//                 flowerDate={flowerDate}
//                 species={species}
//                 key={String(i * 100)}
//                 formDate={formData}
//                 num={i}
//                 setFormValue={saveForm}
//                 packingCount={i}
//               />
//             ))}
//           <Form
//             name="basic"
//             style={{ maxWidth: 300, marginTop: "2rem" }}
//             initialValues={{ remember: true }}
//             onFinish={onFinish}
//           >
//             <Form.Item label="报关服务费" name="username">
//               <Input />
//             </Form.Item>
//             <Form.Item label="运费" name="password">
//               <Input />
//             </Form.Item>
//             <Form.Item label="打包杂费" name="password">
//               <Input />
//             </Form.Item>
//             <Form.Item label="证书费" name="password">
//               <Input />
//             </Form.Item>
//             <Form.Item label="熏蒸费" name="password">
//               <Input />
//             </Form.Item>
//             <Form.Item label="杂费" name="password">
//               <Input />
//             </Form.Item>
//           </Form>
//           <Button
//             type="primary"
//             style={{ marginTop: "2rem" }}
//             onClick={handleSave}
//           >
//             保存
//           </Button>
//           <Button
//             type="primary"
//             style={{ marginTop: "2rem", marginLeft: "1rem" }}
//           >
//             默认导出
//           </Button>
//           <Button
//             type="primary"
//             style={{ marginTop: "2rem", marginLeft: "1rem" }}
//           >
//             海关导出
//           </Button>
//           <Button
//             type="primary"
//             style={{ marginTop: "2rem", marginLeft: "1rem" }}
//           >
//             出口导出
//           </Button>
//         </div>
//       )}
//     </>
//   );
// };

// export default SerOrderPage;

"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form, Space, Select, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { UserOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import Loading from "@/app/components/loading";
import { useSearchParams } from "next/navigation";
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
  const [form] = useForm(); // 使用 useForm hook
  const [initialValues, setInitialValues] = useState<any[]>([]); // 用于存储初始表单数据
  const searchParams = useSearchParams();
  const item = searchParams.get("item");
  const [time, setTime] = useState("");
  // 表单提交处理
  const onFinish = async (formValue: any) => {
    console.log("Received values of form:", formValue);
    setLoading(true);
    const year = time.split("-")[0];
    const month = time.split("-")[1];
    const day = time.split("-")[2];
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
        if (data) {
          setSpecies(Object.keys(data));
          setFlowerDate(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const response = await fetch("/api/uploadOrderExcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customName, year, month, day, formValue }),
      });

      fetchFlowerDate();

      if (response.ok) {
        message.success("保存成功！！！");
      }

      setLoading(false);
    } catch (error) {
      message.error("保存订单出错");
      console.error("Error saving order:", error);
    }
  };

  // 获取花卉数据
  useEffect(() => {
    setLoading(true);
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
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

  // 获取并渲染 Excel 数据
  useEffect(() => {
    async function fetchOrderData() {
      try {
        const response = await fetch(
          `/api/getOneExcel?filePath=${encodeURIComponent(item as any)}`
        );
        console.log("====================================");
        console.log(item?.split("_")[0]);
        setCustomName(item?.split("_")[0] as any);
        setTime(item?.split("_")[1].split(".")[0] as any);
        console.log("====================================");
        const data = await response.json();
        console.log("====================================");
        console.log(data);
        console.log("====================================");
        setInitialValues(data);
        form.setFieldsValue({ Order: data }); // 设置表单的初始值
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    }
    fetchOrderData();
  }, [form]);

  // 根据种类设置规格和单重
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

  console.log(time);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <Text fw={700} size="xl">
            完善订单
          </Text>
          <br />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Input
              size="large"
              placeholder="客户姓名"
              prefix={<UserOutlined />}
              style={{ width: "20%" }}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Input
              size="large"
              value={time || String(`${year}-${month}-${day}`)}
              style={{ width: "20%", marginRight: "23%" }}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <br />
          <Form
            form={form} // 绑定表单实例
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            style={{ maxWidth: 900 }}
            autoComplete="off"
            initialValues={{ Order: initialValues }} // 设置初始值
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
            <br />
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: "2rem" }}
              >
                保存
              </Button>
              <Button type="primary" style={{ marginLeft: "2rem" }}>
                内部
              </Button>
              <Button type="primary" style={{ marginLeft: "2rem" }}>
                打印1
              </Button>
              <Button type="primary" style={{ marginLeft: "2rem" }}>
                打印2
              </Button>
              <Button type="primary" style={{ marginLeft: "2rem" }}>
                打印3
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
};

export default SetOrderPage;
