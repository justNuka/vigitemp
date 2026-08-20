"use client"

import { MetrologyReadingRefreshFeedback } from "../_components/metrology-reading-refresh-feedback"
import { AdjustmentWorkflowClient } from "./adjustment-workflow-client"

export default function RealiserAjustagePage() {
  return (
    <>
      <AdjustmentWorkflowClient />
      <MetrologyReadingRefreshFeedback />
    </>
  )
}
