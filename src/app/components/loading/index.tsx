import React from "react";
import { Flex, Spin } from "antd";

const contentStyle: React.CSSProperties = {
  padding: 50,
  borderRadius: 4,
  textAlign: "center",
};

const content = <div style={contentStyle} />;

const Loading: React.FC = () => (
  <Flex
    align="center"
    gap="middle"
    style={{ display: "flex", justifyContent: "center" }}
  >
    <Spin size="large" tip="loading...">
      {content}
    </Spin>
  </Flex>
);

export default Loading;
