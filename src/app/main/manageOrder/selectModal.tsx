"use client";
import React, { useState } from "react";
import { Modal, Checkbox } from "antd";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import axios from "axios";

const plainOptions = [
  "图片",
  "品种",
  "植物学名",
  "规格",
  "数量",
  "单价",
  "总额",
];

const SelectModal = (props: any) => {
  const [selectValue, setSelectValue] = useState([]);
  const { isModalOpen, setIsModalOpen, initialValues, flowerDate } = props;

  const handleOk = () => {
    exportExcel(selectValue, initialValues, flowerDate);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (checkedValues: any) => {
    setSelectValue(checkedValues);
  };

  const exportExcel = async (
    selectedFields: any,
    data: any,
    flowerDate: any
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // 添加表头
    worksheet.addRow(["云南恒矩进出口贸易有限公司"]);
    worksheet.addRow(["YUNNAN HENGJU IMPORT AND EXPORT TRADE CO., LTD"]);
    worksheet.addRow([
      "ADDRESS: ROOM 601-1,6F, ARTICLES EXPO CENTER,",
      "JIANGYUN HOTEL, DOUNAN STREET, CHENGGONG DISTRICT,",
      "KUNMING, YUNNAN PROVINCE,CHINA",
    ]);
    worksheet.addRow(["发票", "INVOICE"]);
    worksheet.addRow([
      "TO: FRESH BLOOM FLOWER TRADING LLC",
      "",
      "日期 DATE: JUL.25TH,2024",
    ]);
    worksheet.addRow([
      "Address: BUR DUBAI SAIH SHUAIB 2 P1 BLOCK 1OFFICE NO 61 SH 493 BUSINESS DUBAI 50819 AE",
      "发票号 INVOICE NO:2024C-YJ003",
      "合同号 CONTRACT NO:2024C-YJ003",
    ]);
    worksheet.addRow(["", "", "SHIPPING MARKS: N/M"]);
    worksheet.addRow([]);

    // 添加数据行
    for (const item of data) {
      const row = [];
      if (selectedFields.includes("图片")) {
        // 根据 flowerDate 获取图片 URL
        const imageUrl = `https://raw.githubusercontent.com/Y-small-space/FlowerShopWeb/main/DateBase/flawers/${
          item.FlowerSpecies
        }/${item.FlowerSpecies}${item.FlowerName.split("_")[0]}.jpg`;

        console.log(item, imageUrl);

        try {
          // 下载图片为 buffer
          const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });

          // 添加图片到工作簿
          const imageId = workbook.addImage({
            buffer: imageResponse.data,
            extension: "jpg",
          });

          // 插入图片到单元格
          worksheet.addImage(imageId, {
            tl: { col: 0, row: worksheet.rowCount },
            ext: { width: 100, height: 100 },
          });

          row.push(""); // 在图片单元格填充一个空字符串
        } catch (error) {
          console.error("图片下载失败:", error);
        }
      }

      if (selectedFields.includes("品种")) row.push(item.FlowerSpecies);
      if (selectedFields.includes("植物学名"))
        row.push(item.FlowerName?.split("_")[1]);
      if (selectedFields.includes("规格"))
        row.push(item.FlowerPacking?.split(" ")[0]);
      if (selectedFields.includes("数量")) row.push(item.Number);
      if (selectedFields.includes("单价")) row.push(item.OutPrice);
      if (selectedFields.includes("总额")) row.push(item.TotalPrice);

      worksheet.addRow(row);
    }

    // 添加尾部信息
    worksheet.addRow([]);
    worksheet.addRow(["Bank details:"]);
    worksheet.addRow([
      "Company Name: Yunnan Hengju Import and Export Trade co., LTD",
    ]);
    worksheet.addRow(["Bank Name: CHINA MERCHANTS BANK, KUNMING BRANCH"]);
    worksheet.addRow(["A/C No. (美元 USD): 8719 1096 5732 501"]);
    worksheet.addRow(["SWIFT: CMBCCNBS451"]);
    worksheet.addRow([
      "Bank Add: CHONGREN STREET 1, KUNMING CITY, YUNNAN PROVINCE",
    ]);

    // // 保存 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "export_with_images.xlsx");
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
