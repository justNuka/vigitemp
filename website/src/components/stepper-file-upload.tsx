import SharedImportStepper from "@/components/stepper-import-shared";

export type AdjustmentInsertData = {
  Date_Heure_Ajustage: string | null;
  Sonde_Numero_Serie: string | null;
  Coeff_X2: number | null;
  Coeff_X: number | null;
  Coeff_Constant: number | null;
  Unite: string | null;
  Nb_Decimale: number | null;
  Operateur: string | null;
  SE_Numero: string | null;
  SE_Organisme: string | null;
  SE_Date_Certif: string | null;
  SE_Numero_Certif: string | null;
  Mesure_Etalon1: number | null;
  Mesure_Etalon2: number | null;
  Valeur_Brute1: number | null;
  Valeur_Brute2: number | null;
  Ancienne_Mesure1: number | null;
  Ancienne_Mesure2: number | null;
  Nouvelle_Mesure1: number | null;
  Nouvelle_Mesure2: number | null;
};

export type AdjustmentImportResult = {
  id: string;
  file: string;
  sensor: string | null;
  date: string | Date | null;
  dateText?: string | null;
  operator: string | null;
  coeffX: number | null;
  coeffConstant: number | null;
  measureEtalon1: number | null;
  measureEtalon2: number | null;
  unit: string | null;
  warnings?: string[];
  insertData: AdjustmentInsertData;
};

type StepperFileUploadProps = {
  onUploadResult?: (result: AdjustmentImportResult) => void;
  onFinish?: () => void;
};

export default function StepperFileUpload({ onUploadResult, onFinish }: StepperFileUploadProps) {
  return (
    <SharedImportStepper<AdjustmentImportResult>
      stepperNamespace="sensorAdjustmentStepper"
      uploadNamespace="sensorAdjustmentUpload"
      previewEndpoint="/api/sondes/ajustages/preview"
      validateRootTag={(rootTag) => rootTag.includes("CALIBRAGE") || rootTag.includes("AJUSTAGE")}
      onUploadResult={onUploadResult}
      onFinish={onFinish}
      closeOnProcessSuccess
    />
  );
}

