"use client";
import React, { useState } from "react";
import { Modal, Checkbox, message } from "antd";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import axios from "axios";

const plainOptions = [
  "箱单号",
  "图片",
  "名称",
  "植物学名",
  "规格",
  "数量",
  "单价（未处理）",
  "单价",
  "单重",
  "重量",
  "总额",
];

const map = {
  洋桔梗: "洋桔梗 Lisianthus",
  绣球: "绣球Hydrangeas",
  非洲菊: "非洲菊Gerbera",
};

const SelectModal = (props: any) => {
  const [selectValue, setSelectValue] = useState([]);
  const { isModalOpen, setIsModalOpen, initialValues, flowerDate, fee, money } =
    props;
  const [loading, setLoading] = useState(false);

  // console.log(initialValues);

  const addCategoryToFlowers = (flowers: any, categories: any) => {
    return flowers.map((flower: any) => {
      for (const category in categories) {
        const found = categories[category].find((item: any) =>
          flower.FlowerName.includes(item.Name)
        );

        if (found) {
          return { ...flower, Category: category, FlowerID: found.id };
        }
      }
      return flower; // 如果没有找到对应的种类，原样返回
    });
  };

  const updatedFlowers = addCategoryToFlowers(initialValues, flowerDate);

  const handleOk = () => {
    setLoading(true);
    exportExcel(selectValue, updatedFlowers, initialValues);
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
    initialValues: any
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    const cellWidthInPoints = 2.9 * 28.35; // 2.9 cm 转换为点
    const cellHeightInPoints = 2.9 * 28.35; // 2.9 cm 转换为点
    worksheet.getColumn(2).width = cellWidthInPoints / 7;

    // 添加表头信息
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

    // console.log(money);

    // 定义表头
    const headers = [];
    if (selectedFields.includes("箱单号")) headers.push("箱单号");
    if (selectedFields.includes("图片")) headers.push("图片");
    if (selectedFields.includes("名称")) headers.push("名称");
    if (selectedFields.includes("植物学名")) headers.push("植物学名");
    if (selectedFields.includes("规格")) headers.push("规格");
    if (selectedFields.includes("数量")) headers.push("数量");
    if (selectedFields.includes("单价（未处理）"))
      headers.push(`单价（未处理） UNIT PRICE（${money}）`);
    if (selectedFields.includes("单价"))
      headers.push(`单价 UNIT PRICE（${money}）`);
    if (selectedFields.includes("单重"))
      headers.push("单重 UNIT WEIGHT（weight/kg）");
    if (selectedFields.includes("重量")) headers.push("重量 Weight（kg）");
    if (selectedFields.includes("总额")) headers.push(`总额AMOUNT（${money}）`);

    // 插入表头
    worksheet.addRow(headers);
    worksheet.getRow(8).height = 20; // 设置表头行高

    // 设置数据行的起始行号
    let currentRow = 9; // 数据行从第9行开始
    // 添加数据行
    for (const item of data) {
      const row = [];
      if (selectedFields.includes("图片")) {
        // 根据 flowerDate 获取图片 URL
        const imageUrl1 = `https://raw.githubusercontent.com/Y-small-space/DB/main/DateBase/flawers/${
          item.FlowerName.split("_")[0]
        }.jpg`;
        const imageUrl2 = `https://raw.githubusercontent.com/Y-small-space/DB/main/DateBase/flawers/${
          item.FlowerName.split("_")[0]
        }.png`;
        const imageUrl3 = `https://raw.githubusercontent.com/Y-small-space/DB/main/DateBase/flawers/notfound.png`;

        // 下载图片为 buffer
        let imageResponse;
        try {
          // 尝试下载第一个图片链接
          imageResponse = await axios.get(imageUrl1, {
            responseType: "arraybuffer",
          });
        } catch (error) {
          // 第一个图片请求失败，尝试下载第二个图片链接
          try {
            imageResponse = await axios.get(imageUrl2, {
              responseType: "arraybuffer",
            });
          } catch (error) {
            imageResponse = await axios.get(imageUrl3, {
              responseType: "arraybuffer",
            });
          }
        }

        // 添加图片到工作簿
        const imageId = workbook.addImage({
          buffer: imageResponse.data,
          extension: "jpeg",
        });
        if (selectedFields.includes("箱单号")) row.push(item?.PackageID);
        row.push(""); // 在图片单元格填充一个空字符串
        if (selectedFields.includes("名称"))
          row.push(
            `${item.FlowerName?.split("_")[1]} ${
              item.FlowerName?.split("_")[2]
            }`
          );
        if (selectedFields.includes("植物学名"))
          row.push(`${item.FlowerName?.split("_")[3]}`);
        if (selectedFields.includes("规格"))
          row.push(item.FlowerName?.split("_")[4]);
        if (selectedFields.includes("数量")) row.push(item.Number);
        if (selectedFields.includes("单价（未处理）"))
          row.push(parseFloat(item.OutPrice).toFixed(2));
        if (selectedFields.includes("单价"))
          row.push(parseFloat(item.AdjustedPrice).toFixed(2));
        if (selectedFields.includes("单重"))
          row.push(parseFloat(item.FlowerWeight).toFixed(2));
        if (selectedFields.includes("重量"))
          row.push(
            (parseFloat(item.Number) * parseFloat(item.FlowerWeight)).toFixed(2)
          );
        if (selectedFields.includes("总额"))
          row.push(parseFloat(item.TotalPrice).toFixed(2));

        const addedRow = worksheet.addRow(row);
        addedRow.height = cellHeightInPoints / 1.34;
        // 插入图片到当前行的单元格
        worksheet.addImage(imageId, {
          tl: { col: 1, row: currentRow - 1 }, // 使用 currentRow - 1 确保图片与数据在同一行
          ext: { width: cellWidthInPoints, height: cellHeightInPoints }, // 图片尺寸
        });
      } else {
        // 继续添加数据列
        if (selectedFields.includes("箱单号")) row.push(item.PackageID);
        if (selectedFields.includes("名称"))
          row.push(
            `${item.FlowerName?.split("_")[1]} ${
              item.FlowerName?.split("_")[2]
            }`
          );
        if (selectedFields.includes("植物学名"))
          row.push(`${item.FlowerName?.split("_")[3]}`);
        if (selectedFields.includes("规格"))
          row.push(item.FlowerName?.split("_")[4]);
        if (selectedFields.includes("数量")) row.push(item.Number);
        if (selectedFields.includes("单价（未处理）")) row.push(item.OutPrice);
        if (selectedFields.includes("单价")) row.push(item.AdjustedPrice);
        if (selectedFields.includes("单重")) row.push(item.FlowerWeight);
        if (selectedFields.includes("重量"))
          row.push(
            (parseFloat(item.Number) * parseFloat(item.FlowerWeight)).toFixed(2)
          );
        if (selectedFields.includes("总额")) row.push(item.TotalPrice);

        // 将当前行数据添加到工作表，并设置行高
        const addedRow = worksheet.addRow(row);
        addedRow.height = cellHeightInPoints / 1.6; // 设置合适的行高
      }
      // 更新当前行号
      currentRow += 1; // 每添加一行数据，增加一行位置
    }

    // 添加尾部信息
    const total = data.map((i: any) => parseFloat(i.TotalPrice));
    // console.log("====================================");
    // console.log(data);
    // console.log("====================================");
    const weight = data.map(
      (i: any) => parseFloat(i.FlowerWeight) * parseFloat(i.Number)
    );
    const total_ = total.reduce((a: any, b: any) => a + b).toFixed(2);
    const weight_ = weight
      .reduce((a: any, b: any) => parseFloat(a) + parseFloat(b))
      .toFixed(2);
    const Total = [];
    Total.push("Sub Total");
    if (selectedFields.includes("箱单号")) Total.push("");
    if (selectedFields.includes("图片")) Total.push("");
    if (selectedFields.includes("名称")) Total.push("");
    if (selectedFields.includes("植物学名")) Total.push("");
    if (selectedFields.includes("规格")) Total.push("");
    if (selectedFields.includes("数量")) Total.push("");
    if (selectedFields.includes("单价（未处理）")) Total.push("");
    if (selectedFields.includes("单价")) Total.push("");
    if (selectedFields.includes("单重")) Total.push("");
    Total.pop();
    if (selectedFields.includes("重量")) Total.push(weight_);
    if (selectedFields.includes("总额")) Total.push(total_);
    worksheet.addRow(Total);

    const ShippingFee = [];
    ShippingFee.push("Freight Cost 运费");
    if (selectedFields.includes("箱单号")) ShippingFee.push("");
    if (selectedFields.includes("图片")) ShippingFee.push("");
    if (selectedFields.includes("名称")) ShippingFee.push("");
    if (selectedFields.includes("植物学名")) ShippingFee.push("");
    if (selectedFields.includes("规格")) ShippingFee.push("");
    if (selectedFields.includes("数量")) ShippingFee.push("");
    if (selectedFields.includes("单价（未处理）")) ShippingFee.push("");
    if (selectedFields.includes("单价")) ShippingFee.push("");
    if (selectedFields.includes("单重")) ShippingFee.push("");
    if (selectedFields.includes("重量")) ShippingFee.push("");
    ShippingFee.pop();
    ShippingFee.push(fee.shippingFee);
    worksheet.addRow(ShippingFee);

    const CustomFee = [];
    CustomFee.push("customs declaration service 报关服务费");
    if (selectedFields.includes("箱单号")) CustomFee.push("");
    if (selectedFields.includes("图片")) CustomFee.push("");
    if (selectedFields.includes("名称")) CustomFee.push("");
    if (selectedFields.includes("植物学名")) CustomFee.push("");
    if (selectedFields.includes("规格")) CustomFee.push("");
    if (selectedFields.includes("数量")) CustomFee.push("");
    if (selectedFields.includes("单价（未处理）")) CustomFee.push("");
    if (selectedFields.includes("单价")) CustomFee.push("");
    if (selectedFields.includes("单重")) CustomFee.push("");
    if (selectedFields.includes("重量")) CustomFee.push("");
    CustomFee.pop();
    CustomFee.push(fee.customFee);
    worksheet.addRow(CustomFee);

    const PackagingFee = [];
    PackagingFee.push("Packing 打包杂费");
    if (selectedFields.includes("箱单号")) PackagingFee.push("");
    if (selectedFields.includes("图片")) PackagingFee.push("");
    if (selectedFields.includes("名称")) PackagingFee.push("");
    if (selectedFields.includes("植物学名")) PackagingFee.push("");
    if (selectedFields.includes("规格")) PackagingFee.push("");
    if (selectedFields.includes("数量")) PackagingFee.push("");
    if (selectedFields.includes("单价（未处理）")) PackagingFee.push("");
    if (selectedFields.includes("单价")) PackagingFee.push("");
    if (selectedFields.includes("单重")) PackagingFee.push("");
    if (selectedFields.includes("重量")) PackagingFee.push("");
    PackagingFee.pop();
    PackagingFee.push(fee.packagingFee);
    worksheet.addRow(PackagingFee);

    const CertificateFee = [];
    CertificateFee.push("certifications 证书费");
    if (selectedFields.includes("箱单号")) CertificateFee.push("");
    if (selectedFields.includes("图片")) CertificateFee.push("");
    if (selectedFields.includes("名称")) CertificateFee.push("");
    if (selectedFields.includes("植物学名")) CertificateFee.push("");
    if (selectedFields.includes("规格")) CertificateFee.push("");
    if (selectedFields.includes("数量")) CertificateFee.push("");
    if (selectedFields.includes("单价（未处理）")) CertificateFee.push("");
    if (selectedFields.includes("单价")) CertificateFee.push("");
    if (selectedFields.includes("单重")) CertificateFee.push("");
    if (selectedFields.includes("重量")) CertificateFee.push("");
    CertificateFee.pop();
    CertificateFee.push(fee.certificateFee);
    worksheet.addRow(CertificateFee);

    const FumigationFee = [];
    FumigationFee.push("disinfestation or disinfection treatment 熏蒸费");
    if (selectedFields.includes("箱单号")) FumigationFee.push("");
    if (selectedFields.includes("图片")) FumigationFee.push("");
    if (selectedFields.includes("名称")) FumigationFee.push("");
    if (selectedFields.includes("植物学名")) FumigationFee.push("");
    if (selectedFields.includes("规格")) FumigationFee.push("");
    if (selectedFields.includes("数量")) FumigationFee.push("");
    if (selectedFields.includes("单价（未处理）")) FumigationFee.push("");
    if (selectedFields.includes("单价")) FumigationFee.push("");
    if (selectedFields.includes("单重")) FumigationFee.push("");
    if (selectedFields.includes("重量")) FumigationFee.push("");
    FumigationFee.pop();
    FumigationFee.push(fee.fumigationFee);
    worksheet.addRow(FumigationFee);

    const SUM = [];
    SUM.push("TOTAL");
    const sum =
      parseFloat(fee.customFee) +
      parseFloat(fee.shippingFee) +
      parseFloat(fee.packagingFee) +
      parseFloat(fee.certificateFee) +
      parseFloat(fee.fumigationFee);
    if (selectedFields.includes("箱单号")) SUM.push("");
    if (selectedFields.includes("图片")) SUM.push("");
    if (selectedFields.includes("名称")) SUM.push("");
    if (selectedFields.includes("植物学名")) SUM.push("");
    if (selectedFields.includes("规格")) SUM.push("");
    if (selectedFields.includes("数量")) SUM.push("");
    if (selectedFields.includes("单价（未处理）")) SUM.push("");
    if (selectedFields.includes("单价")) SUM.push("");
    if (selectedFields.includes("单重")) SUM.push("");
    if (selectedFields.includes("重量")) SUM.push("");
    SUM.pop();
    SUM.push((sum + parseFloat(total_)).toFixed(2));
    worksheet.addRow(SUM);

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

    // 保存 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "export_with_images.xlsx");
    message.success("打印成功！");
    setLoading(false);
  };

  return (
    <>
      <Modal
        title="请选择要打印的项目："
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        loading={loading}
      >
        <Checkbox.Group options={plainOptions} onChange={onChange} />
      </Modal>
    </>
  );
};

export default SelectModal;
