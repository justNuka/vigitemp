import SharedImportStepper from "@/components/stepper-import-shared";

export type CalibrationMeasureInsertData = {
  Numero_Ordre: number;
  Mesure_Sonde: number | null;
  Mesure_Etalon: number | null;
};

export type CalibrationInsertData = {
  Date_Heure_Etalonnage: string | null;
  Sonde_Numero_Serie: string | null;
  Date_Validite: string | null;
  Duree_Validite_Jours: number | null;
  Operateur: string | null;
  Etalon_Numero_Serie: string | null;
  Date_Certif: string | null;
  Organisme: string | null;
  Num_Certif: string | null;
  Unite: string | null;
  Incertitude: string | null;
  Moyenne_Etalon: number | null;
  Moyenne_Sonde: number | null;
  Repetabilite: string | null;
  Err_Justesse: string | null;  Mesures: CalibrationMeasureInsertData[];
};

export type CalibrationImportResult = {
  id: string;
  file: string;
  sensor: string | null;
  date: string | Date | null;
  dateText?: string | null;
  dateValidity?: string | Date | null;
  dateValidityText?: string | null;
  operator: string | null;
  uncertainty: string | null;
  unit: string | null;
  warnings?: string[];
  insertData: CalibrationInsertData;
};

type StepperCalibrationFileUploadProps = {
  onUploadResult?: (result: CalibrationImportResult) => void;
  onFinish?: () => void;
};

export default function StepperCalibrationFileUpload({ onUploadResult, onFinish }: StepperCalibrationFileUploadProps) {
  return (
    <SharedImportStepper<CalibrationImportResult>
      stepperNamespace="sensorCalibrationStepper"
      uploadNamespace="sensorCalibrationUpload"
      previewEndpoint="/api/sondes/etalonnages/preview"
      validateRootTag={(rootTag) => rootTag.includes("ETALON")}
      invalidRootError="Racine XML inattendue (attendu ETALONNAGE)."
      onUploadResult={onUploadResult}
      onFinish={onFinish}
    />
  );
}


