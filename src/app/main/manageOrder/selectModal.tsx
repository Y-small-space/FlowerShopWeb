import React, { useState } from "react";
import { Modal, Checkbox } from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const plainOptions = [
  "图片",
  "品种",
  "植物学名",
  "数量",
  "单价",
  "总额",
  "规格",
];

const SelectModal = (props: any) => {
  const [selectValue, setSelectValue] = useState([]);
  const { isModalOpen, setIsModalOpen, initialValues } = props;

  const handleOk = () => {
    exportExcel(selectValue, initialValues);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (checkedValues: any) => {
    setSelectValue(checkedValues);
  };

  const exportExcel = (selectedFields: any, data: any) => {
    // 手动添加表头内容
    const headerRows = [
      ["云南恒矩进出口贸易有限公司"],
      ["YUNNAN HENGJU IMPORT AND EXPORT TRADE CO., LTD"],
      [
        "ADDRESS: ROOM 601-1,6F, ARTICLES EXPO CENTER,",
        "JIANGYUN HOTEL, DOUNAN STREET, CHENGGONG DISTRICT,",
        "KUNMING, YUNNAN PROVINCE,CHINA",
      ],
      ["发票", "INVOICE"],
      ["TO: FRESH BLOOM FLOWER TRADING LLC", "", "日期 DATE: JUL.25TH,2024"],
      [
        "Address: BUR DUBAI SAIH SHUAIB 2 P1 BLOCK 1OFFICE NO 61 SH 493 BUSINESS DUBAI 50819 AE",
        "发票号 INVOICE NO:2024C-YJ003",
        "合同号 CONTRACT NO:2024C-YJ003",
      ],
      ["", "", "SHIPPING MARKS: N/M"],
      [], // 空行，用于分隔表头和数据
    ];

    // 过滤选中的字段数据
    const filteredData = data.map((item: any) => {
      const filteredItem: any = {};
      if (selectedFields.includes("品种"))
        filteredItem["品种"] = item.FlowerSpecies;
      if (selectedFields.includes("植物学名"))
        filteredItem["植物学名"] = item.FlowerName;
      if (selectedFields.includes("数量")) filteredItem["数量"] = item.Number;
      if (selectedFields.includes("单价")) filteredItem["单价"] = item.OutPrice;
      if (selectedFields.includes("总额"))
        filteredItem["总额"] = item.TotalPrice;
      if (selectedFields.includes("规格"))
        filteredItem["规格"] = item.FlowerPacking;
      return filteredItem;
    });

    // 添加内容的属性名作为标题行
    const contentHeaders = selectedFields; // 使用选中的字段作为标题行

    // 将标题行和数据合并
    const combinedData = [
      ...headerRows,
      contentHeaders, // 添加标题行
      ...filteredData.map((row: any) =>
        contentHeaders.map((field: any) => row[field])
      ), // 按选中字段的顺序插入数据
      [], // 空行，用于分隔数据和尾部信息
      [],
      [],
      ["Bank details:"],
      ["Company Name: Yunnan Hengju Import and Export Trade co., LTD"],
      ["Bank Name: CHINA MERCHANTS BANK, KUNMING BRANCH"],
      ["A/C No. (美元 USD): 8719 1096 5732 501"],
      ["SWIFT: CMBCCNBS451"],
      ["Bank Add: CHONGREN STREET 1, KUNMING CITY, YUNNAN PROVINCE"],
    ];

    // 生成工作表
    const ws = XLSX.utils.aoa_to_sheet(combinedData);

    // 添加样式
    Object.keys(ws).forEach((cell) => {
      const cellRef = XLSX.utils.decode_cell(cell);
      const cellObject = ws[cell];

      if (cellObject && typeof cellObject === "object") {
        if (cellRef.r < headerRows.length) {
          // 判断是否为表头行
          cellObject.s = {
            font: { name: "Arial", sz: 12, bold: true }, // 表头加粗
            alignment: { horizontal: "center", vertical: "center" }, // 居中对齐
            border: {
              // 设置边框
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        } else if (cellRef.r === headerRows.length) {
          // 判断是否为内容的属性名行
          cellObject.s = {
            font: { name: "Arial", sz: 12, bold: true }, // 属性名加粗
            alignment: { horizontal: "center", vertical: "center" }, // 居中对齐
            border: {
              // 设置边框
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        } else {
          cellObject.s = {
            font: { name: "Arial", sz: 12 }, // 内容字体
            alignment: { horizontal: "center", vertical: "center" }, // 居中对齐
            border: {
              // 设置边框
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      }
    });

    // 创建工作簿并添加工作表
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // 导出 Excel 文件
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "export.xlsx"
    );
  };

  return (
    <>
      <Modal
        title="请选择要打印的项目："
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Checkbox.Group options={plainOptions} onChange={onChange} />
      </Modal>
    </>
  );
};

export default SelectModal;
