"use client";

import React, { useEffect, useState } from "react";
import { Collapse, List, Button, message } from "antd";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/loading";
import { useForm } from "antd/es/form/Form";

const OrderList: React.FC = () => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [form] = useForm();

  // 获取文件名列表
  const fetchFileNames = async (directory: string) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/getOrderList?directory=${encodeURIComponent(directory)}`
      );
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setFileNames(data);
      }
    } catch (err: any) {
      message.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileNames("/DateBase/orders");
  }, []);

  // 分组数据：按客户名字
  const groupedOrders = fileNames.reduce(
    (acc: Record<string, string[]>, fileName) => {
      const clientName = fileName.split("_")[0] || "Unknown"; // 获取客户名
      if (!acc[clientName]) {
        acc[clientName] = [];
      }
      acc[clientName].push(fileName);
      return acc;
    },
    {}
  );

  // 编辑按钮处理
  const handleEdit = (item: string) => {
    router.push(`/main/editOrder?item=${encodeURIComponent(item)}`);
  };

  const handleComplete = (item: string) => {
    router.push(`/main/manageOrder?item=${encodeURIComponent(item)}`);
  };

  const deleteOrder = async (item: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/deleteOneExcel?filePath=${encodeURIComponent(item)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("订单已删除");
        // 重新获取文件列表以刷新页面
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        message.error(`删除失败: ${data.error}`);
      }
    } catch (err) {
      message.error("删除订单时出错");
      console.error("Error deleting order:", err);
    } finally {
      setLoading(false);
    }
  };

  // 打印客户的Excel
  const handlePrintExcel = async () => {
    try {
      const response = await fetch("/api/updateCustomExcel", {
        method: "GET",
      });
      const data = await response.json();

      if (response.ok) {
        // 处理获取到的Excel文件
        const link = document.createElement("a");
        link.href = `data:application/octet-stream;base64,${data.fileBuffer}`;
        link.download = "orders.xlsx";
        link.click();
        message.success("Excel 文件已下载");
      } else {
        message.error(`获取Excel文件失败: ${data.error}`);
      }
    } catch (error) {
      message.error("获取Excel文件时出错");
      console.error("Error fetching Excel:", error);
    }
  };

  // 更新客户Excel
  const handleUpdateExcel = async () => {
    setLoading(true);
    try {
      // 将客户的订单数据按需转换
      const orders = Object.entries(groupedOrders).map(
        ([customer, orders]) => ({
          customer,
          order: orders,
        })
      );

      const response = await fetch("/api/updateCustomExcel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Excel 文件已更新");
      } else {
        message.error(`更新失败: ${data.error}`);
      }
    } catch (error) {
      message.error("更新Excel文件时出错");
      console.error("Error updating Excel:", error);
    } finally {
      setLoading(false);
    }
  };

  // 将客户订单分组为 Collapse 组件的 items 格式
  const collapseItems = Object.keys(groupedOrders).map((clientName, index) => ({
    key: String(index + 1), // 确保 key 为字符串
    label: clientName, // Collapse 面板的标题为客户名
    children: (
      <List
        size="small"
        dataSource={groupedOrders[clientName]}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<a href="#">{item.slice(0, item.length - 5)}</a>}
            />

            <Button onClick={() => handleEdit(item)}>编辑</Button>
            <Button
              style={{ marginLeft: "1rem" }}
              onClick={() => handleComplete(item)}
            >
              完善
            </Button>
            <Button
              onClick={() => deleteOrder(item)}
              style={{ marginLeft: "1rem" }}
            >
              删除
            </Button>
          </List.Item>
        )}
      />
    ),
  }));

  return (
    <>
      <Button type="primary" onClick={handlePrintExcel}>
        打印客户的Excel
      </Button>
      <Button
        type="default"
        onClick={handleUpdateExcel}
        style={{ marginLeft: "1rem" }}
      >
        更新客户Excel
      </Button>
      {loading ? (
        <Loading />
      ) : collapseItems.length ? (
        <Collapse
          items={collapseItems}
          style={{ marginTop: "1rem" }}
          size="small"
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default OrderList;
