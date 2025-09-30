import CameraButton from "@/components/cameraButton";
import UploadButton from "@/components/uploadButton";

export default function Home() {
  return (
    <div className="font-sans w-full min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <h1 className="text-4xl font-bold text-black mb-2">Split Bill</h1>
      <h2 className="text-lg font-bold text-black text-center mb-6">
        Foto Struk belanja dan lakukan split bill dengan mudah
      </h2>

      <img
        src="/vector_home.avif"
        alt="home"
        width={400}
        height={400}
        className="mb-6"
      />

      <div className="flex gap-2 w-full md:w-[300px] flex-col md:flex-row justify-center mt-10">
        <CameraButton/>

        <UploadButton />
      </div>
    </div>
  );
}
