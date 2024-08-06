"use client";
import React, { useEffect, useState } from "react";
import { Avatar, List, Radio, Space, Button } from "antd";

const OrderList: React.FC = () => {
  const [data, setDate] = useState<any>();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchFileNames = async (directory: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/getOrderList?directory=${encodeURIComponent(directory)}`
      );
      const data = await response.json();

      if (response.ok) {
        setFileNames(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFileNames("/DateBase/orders");
  }, []);
  return (
    <>
      <List
        dataSource={data}
        style={{ overflow: "auto" }}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              title={<a href="https://ant.design">{item.title}</a>}
              description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            />
            <Button>编辑</Button>
          </List.Item>
        )}
      />
    </>
  );
};

export default OrderList;
