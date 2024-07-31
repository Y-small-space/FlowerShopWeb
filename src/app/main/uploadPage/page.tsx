"use client";
import React, { useState } from "react";
import { Button, Group, FileInput } from "@mantine/core";

const PushDatePage = () => {
  const [flowerExcel, setFlowerExcel] = useState<File | null>(null);
  const [flowerImagesFiles, setFlowerImagesFiles] = useState<FileList | null>(
    null
  );
  console.log("tokne", process.env.NEXT_PUBLIC_GITHUB_TOKEN);

  const handleFlowerExcelChange = (file: File | null) => {
    setFlowerExcel(file);
  };

  const handleFlowerImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFlowerImagesFiles(e.target.files);
      console.log(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    if (flowerExcel) {
      formData.append("flowerExcel", flowerExcel);
    }

    if (flowerImagesFiles) {
      Array.from(flowerImagesFiles).forEach((file) => {
        const relativePath = file.webkitRelativePath || file.name;
        formData.append("flowerImagesFiles", file, relativePath);
      });
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    console.log(response);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <FileInput
          label="Flower Excel"
          placeholder="Upload flower excel file"
          onChange={handleFlowerExcelChange}
          accept=".xlsx, .xls"
          style={{ width: "300px" }}
        />
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFlowerImagesChange}
          style={{
            width: "300px",
            marginTop: "10px",
            backgroundColor: "white",
          }}
        />
        <Button type="submit">Upload</Button>
      </Group>
    </form>
  );
};

export default PushDatePage;
