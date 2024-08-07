"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input } from "antd";
import { Text } from "@mantine/core";
import SerOrderComponet from "../../components/setOrderPage";
import { UserOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import Loading from "@/app/components/loading";

const onFinish = (values: any) => {
  console.log("Received values of form:", values);
};

const now = new Date();

const year = now.getFullYear();
const month = now.getMonth() + 1; // 月份从0开始，所以要加1
const day = now.getDate();

const SerOrderPage: React.FC = () => {
  const [flowerDate, setFlowerDate] = useState();
  const [species, setSpecies] = useState<any[]>();
  const [pakingCount, setPakingCount] = useState<any[]>([0]);
  const [formData, setFormData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const item = searchParams.get("item");
  const regex = /^([^_]+)_([^.]+)\.xlsx$/;
  const match = item && item.match(regex);
  const name = match[1]; // 匹配到的姓名
  const date = match[2]; // 匹配到的日期

  useEffect(() => {
    console.log("====================================");
    console.log(item);
    console.log("====================================");
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
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/getOneExcel?filePath=${encodeURIComponent(item)}`
        );
        // setFormData(data);
        const data = await response.json();
        console.log("====================================");
        console.log(data);
        console.log("====================================");

        const packingCount: any[] = [];
        const handleDate = data.reduce((acc, item) => {
          const key = `Paking${item.PakingID}`;
          if (!acc[key]) {
            acc[key] = [];
            packingCount.push(item.PakingID);
          }
          acc[key].push(item);
          return acc;
        }, {});

        console.log(packingCount);
        setFormData(handleDate);
        setPakingCount(packingCount);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (item) {
      fetchData();
    }
  }, []);

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
              value={name}
            />
            <Input
              size="large"
              value={date || String(`${year}-${month}-${day}`)}
              style={{ width: "20%" }}
            />
          </div>
          <Button
            type="primary"
            style={{ marginBottom: "2rem" }}
            onClick={() => {}}
          >
            预览
          </Button>
          <Button
            type="primary"
            style={{
              marginTop: "2rem",
              marginLeft: "1rem",
              marginBottom: "2rem",
            }}
            onClick={() => {}}
          >
            海关
          </Button>
          <Button
            type="primary"
            style={{
              marginTop: "2rem",
              marginLeft: "1rem",
              marginBottom: "2rem",
            }}
            onClick={() => {}}
          >
            出口
          </Button>
          <Button
            type="primary"
            style={{
              marginTop: "2rem",
              marginLeft: "1rem",
              marginBottom: "2rem",
            }}
            onClick={() => {}}
          >
            4
          </Button>
          <br />
          {pakingCount.length &&
            pakingCount?.map((i) => (
              <SerOrderComponet
                flowerDate={flowerDate}
                species={species}
                key={i * 1000}
                formDate={formData}
                num={i}
              />
            ))}
          <Button
            type="primary"
            style={{ marginTop: "2rem" }}
            onClick={() => setPakingCount((prev) => [...prev, 0])}
          >
            增加paking
          </Button>
          <Button
            type="primary"
            style={{ marginTop: "2rem", marginLeft: "1rem" }}
            disabled={pakingCount.length === 1}
            onClick={() => {
              const newPaking = [...pakingCount];
              newPaking.shift();
              setPakingCount(newPaking);
            }}
          >
            删除paking
          </Button>
          <Form
            name="basic"
            style={{ maxWidth: 300, marginTop: "2rem" }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item label="报关服务费" name="username">
              <Input />
            </Form.Item>
            <Form.Item label="运费" name="password">
              <Input />
            </Form.Item>
            <Form.Item label="打包杂费" name="password">
              <Input />
            </Form.Item>
            <Form.Item label="证书费" name="password">
              <Input />
            </Form.Item>
            <Form.Item label="熏蒸费" name="password">
              <Input />
            </Form.Item>
            <Form.Item label="杂费" name="password">
              <Input />
            </Form.Item>
          </Form>
          <Button type="primary" style={{ marginTop: "2rem" }}>
            保存
          </Button>
          <Button
            type="primary"
            style={{ marginTop: "2rem", marginLeft: "1rem" }}
          >
            默认导出
          </Button>
          <Button
            type="primary"
            style={{ marginTop: "2rem", marginLeft: "1rem" }}
          >
            海关导出
          </Button>
          <Button
            type="primary"
            style={{ marginTop: "2rem", marginLeft: "1rem" }}
          >
            出口导出
          </Button>
          <Button
            type="primary"
            style={{ marginTop: "2rem", marginLeft: "1rem" }}
          >
            保存
          </Button>
        </div>
      )}
    </>
  );
};

export default SerOrderPage;
