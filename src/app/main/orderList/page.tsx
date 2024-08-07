"use client";

import React, { useEffect, useState } from "react";
import { Avatar, List, Radio, Space, Button, message } from "antd";
import { useRouter } from "next/navigation";

const OrderList: React.FC = () => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      message.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileNames("/DateBase/orders");
  }, []);

  const handleEdit = (item: string) => {
    router.push(`/main/manageOrder?item=${encodeURIComponent(item)}`);
  };

  return (
    <>
      <List
        dataSource={fileNames}
        style={{ overflow: "auto" }}
        loading={loading}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              title={<a href="#">{item.slice(0, item.length - 5)}</a>}
            />
            <Button onClick={() => handleEdit(item)}>编辑</Button>
          </List.Item>
        )}
      />
    </>
  );
};

export default OrderList;
