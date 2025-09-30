"use client";

import { useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function CameraButton() {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    cameraInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Foto diambil:", files[0]);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment" 
        ref={cameraInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <Button type="button" variant="white" onClick={handleClick}>
        <FiCamera /> Camera
      </Button>
    </>
  );
}
