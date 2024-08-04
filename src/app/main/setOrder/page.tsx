"use client";
import React, { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";
import { Text } from "@mantine/core";
import SerOrderComponet from "../../components/setOrderPage";
import { UserOutlined } from "@ant-design/icons";

const { Option } = Select;

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
  console.log(pakingCount);

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
        />
        <Input
          size="large"
          value={String(`${year}-${month}-${day}`)}
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
        style={{ marginTop: "2rem", marginLeft: "1rem", marginBottom: "2rem" }}
        onClick={() => {}}
      >
        海关
      </Button>
      <Button
        type="primary"
        style={{ marginTop: "2rem", marginLeft: "1rem", marginBottom: "2rem" }}
        onClick={() => {}}
      >
        出口
      </Button>
      <Button
        type="primary"
        style={{ marginTop: "2rem", marginLeft: "1rem", marginBottom: "2rem" }}
        onClick={() => {}}
      >
        4
      </Button>
      <br />
      {pakingCount.length &&
        pakingCount?.map((i) => (
          <SerOrderComponet flowerDate={flowerDate} species={species} key={i} />
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
      <Button type="primary" style={{ marginTop: "2rem", marginLeft: "1rem" }}>
        默认导出
      </Button>
      <Button type="primary" style={{ marginTop: "2rem", marginLeft: "1rem" }}>
        海关导出
      </Button>
      <Button type="primary" style={{ marginTop: "2rem", marginLeft: "1rem" }}>
        出口导出
      </Button>
      <Button type="primary" style={{ marginTop: "2rem", marginLeft: "1rem" }}>
        保存
      </Button>
    </div>
  );
};

export default SerOrderPage;
