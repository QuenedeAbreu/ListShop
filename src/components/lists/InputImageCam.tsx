'use client'

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { FiCamera, FiImage, FiX, FiRefreshCcw } from "react-icons/fi";

interface ImageCaptureProps {
  onImageSelect: (file: File | null) => void;
  imageUrl?: string | null;
}

export interface ImageCaptureRef {
  closeCameraExternally: () => void; // função que o pai poderá chamar
}

const ImageCapture = forwardRef<ImageCaptureRef, ImageCaptureProps>(({ onImageSelect, imageUrl }, ref) => {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [switchingCamera, setSwitchingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Seleção de imagem pelo input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  // Verifica se há câmeras disponíveis
  const hasVideoInput = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(d => d.kind === "videoinput");
  }

  // Inicia câmera
  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    if (!await hasVideoInput()) {
      alert("Nenhuma câmera disponível no dispositivo.");
      return;
    }

    try {
      // Para qualquer stream antigo
      stream?.getTracks().forEach(track => track.stop());

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });

      if (videoRef.current) videoRef.current.srcObject = newStream;

      setStream(newStream);
      setStreaming(true);
      setPreview(null);
      setFileName(null);
      setFacingMode(mode);
    } catch (err) {
      const error = err as DOMException;
      console.error("Erro ao acessar câmera:", error);

      if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
        alert("Nenhuma câmera encontrada no dispositivo.");
      } else if (error.name === "NotAllowedError") {
        alert("Permissão para acessar a câmera negada.");
      } else if (error.name === "NotReadableError") {
        alert("Não foi possível acessar a câmera no momento.");
      } else {
        alert("Erro desconhecido ao acessar a câmera.");
      }
    }
  };

  // Atualiza srcObject do vídeo
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Captura foto
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPreview(dataUrl);
    setFileName("photo.png");

    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "photo.png", { type: "image/png" });
        onImageSelect(file);
      });

    closeCamera();
  };

  // Fecha câmera
  const closeCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStreaming(false);
    setStream(null);
  };

  // Fecha preview
  const closePreview = () => {
    setPreview(null);
    setFileName(null);
    onImageSelect(null);
  };

  // Troca câmera
  const switchCamera = async () => {
    if (!stream || switchingCamera) return;

    setSwitchingCamera(true);
    const newMode = facingMode === "user" ? "environment" : "user";

    try {
      // Para o stream atual
      stream.getTracks().forEach(track => track.stop());
      await startCamera(newMode);
    } catch (err) {
      console.error("Erro ao trocar câmera:", err);
    } finally {
      setSwitchingCamera(false);
    }
  };


  // expõe a função para o componente pai
  useImperativeHandle(ref, () => ({
    closeCameraExternally: closeCamera
  }));



  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {preview && (
        <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden relative">
          <Image src={preview} alt="Preview" fill className="object-cover" sizes='100%' />
          <button
            type="button"
            onClick={closePreview}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow"
          >
            <FiX />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!streaming && !switchingCamera ? (
        <div className="flex flex-col items-center w-full">
          <div className="flex gap-2 flex-1 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex flex-1 items-center justify-center gap-3 px-4 py-2 bg-gray-500 text-white rounded shadow"
            >
              <FiImage /> <span>Escolher Imagem</span>
            </button>
            <button
              onClick={() => startCamera(facingMode)}
              type="button"
              className="flex flex-1 items-center justify-center gap-3 px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
              <FiCamera /> <span>Usar Câmera</span>
            </button>
          </div>
          {fileName && <p className="text-sm text-gray-700 mt-1">📂 {fileName}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width="320"
            height="240"
            className="rounded border"
          />
          <div className="flex gap-2">
            <button
              onClick={takePhoto}
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded shadow"
            >
              Capturar
            </button>
            <button
              onClick={switchCamera}
              type="button"
              disabled={switchingCamera}
              className={`px-4 py-2 text-white rounded shadow flex items-center gap-2 ${switchingCamera ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500"}`}
            >
              {switchingCamera ? "Trocando..." : <><FiRefreshCcw /><span>Trocar Câmera</span></>}
            </button>
            <button
              onClick={closeCamera}
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded shadow"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} width="320" height="240" className="hidden" />
    </div>
  );
})
ImageCapture.displayName = "ImageCapture";
export default ImageCapture;