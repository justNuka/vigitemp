"use client"

import { MetrologyReadingRefreshFeedback } from "../_components/metrology-reading-refresh-feedback"
import { CalibrationWorkflowClient } from "./calibration-workflow-client"

export default function RealiserEtalonnagePage() {
  return (
    <>
      <CalibrationWorkflowClient />
      <MetrologyReadingRefreshFeedback />
    </>
  )
}
