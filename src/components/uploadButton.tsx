"use client";

import { useRef, useState } from "react";
import { GrGallery } from "react-icons/gr";
import { Button } from "./ui/button";

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process file");

      const data = await res.json();

      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("uploadedReceipt", reader.result as string);
        sessionStorage.setItem("uploadedReceiptName", file.name);
        sessionStorage.setItem("extractedItems", JSON.stringify(data.items));
        sessionStorage.setItem("rawText", data.raw);
        sessionStorage.setItem("subtotal", String(data.subtotal));
        sessionStorage.setItem("pajak", String(data.pajak));
        sessionStorage.setItem("total", String(data.total));

        window.location.href = "/process";
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload gagal:", err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <Button
        type="button"
        variant="white"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <GrGallery /> Upload
          </>
        )}
      </Button>
    </>
  );
}
