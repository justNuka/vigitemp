"use client";

import SharedFileUpload, { type SharedFileUploadProps } from "@/components/file-upload-shared";

export type { UploadItem } from "@/components/file-upload-shared";

type FileUploadProps = Omit<SharedFileUploadProps, "translationNamespace">;

export default function FileUploadCalibration(props: FileUploadProps) {
  return <SharedFileUpload translationNamespace="sensorCalibrationUpload" {...props} />;
}
