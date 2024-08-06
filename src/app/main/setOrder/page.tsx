"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Form } from "antd";
import { Text } from "@mantine/core";
import SerOrderComponet from "../../components/setOrderPage";
import { UserOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import * as XLSX from "xlsx";

const THEPAGE = "CREATE";
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1; // 月份从0开始，所以要加1
const day = now.getDate();

const SetOrderPage: React.FC = () => {
  const [form] = useForm();
  const [flowerDate, setFlowerDate] = useState();
  const [species, setSpecies] = useState<any[]>();
  const [pakingCount, setPakingCount] = useState<any[]>([1]);
  const [customName, setCustomName] = useState("");
  const [formValue, setFormValue] = useState<any>([]);

  useEffect(() => {
    async function fetchFlowerDate() {
      try {
        const response = await fetch("/api/getFlowerDate");
        const data = await response.json();
        if (data) {
          setSpecies(Object.keys(data));
          setFlowerDate(data);
        }
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFlowerDate();
  }, []);

  const handleSave = async () => {
    try {
      // 将数据保存到对象中
      const orderData = {
        customerName: customName,
        date: String(`${year}-${month}-${day}`),
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

      const data = await response.json();
      console.log(data.message);
      // 清空表单数据
      setFormValue([]);
      setPakingCount([1]);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const saveForm = (value: any) => {
    setFormValue((prev: any[]) => {
      // 检查数组中是否已经存在具有相同 packingID 的对象
      const index = prev.findIndex((item) => item.PakingID === value.PakingID);

      if (index !== -1) {
        // 如果存在，则覆盖现有对象
        const newArray = [...prev];
        newArray[index] = value;
        return newArray;
      } else {
        // 如果不存在，则添加新对象
        return [...prev, value];
      }
    });
  };

  useEffect(() => {
    console.log(formValue);
  }, [formValue]);

  return (
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
          value={String(`${year}-${month}-${day}`)}
          style={{ width: "20%" }}
        />
      </div>
      <br />
      {pakingCount.length &&
        pakingCount.map((i) => (
          <SerOrderComponet
            flowerDate={flowerDate}
            species={species}
            key={i}
            packingCount={i}
            In={THEPAGE}
            setFormValue={saveForm}
          />
        ))}
      <Button
        type="primary"
        style={{ marginTop: "2rem" }}
        onClick={() =>
          setPakingCount((prev) => [
            ...prev,
            pakingCount[pakingCount.length - 1] + 1,
          ])
        }
      >
        增加paking
      </Button>
      <Button
        type="primary"
        style={{ marginTop: "2rem", marginLeft: "1rem" }}
        disabled={pakingCount.length === 1}
        onClick={() => {
          const newPaking = [...pakingCount];
          newPaking.pop();
          setPakingCount(newPaking);
        }}
      >
        删除paking
      </Button>
      <br />
      <Button type="primary" style={{ marginTop: "2rem" }} onClick={handleSave}>
        保存
      </Button>
    </div>
  );
};

export default SetOrderPage;
