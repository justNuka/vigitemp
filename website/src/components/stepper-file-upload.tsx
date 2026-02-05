import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Check, FileText, ListTodo, LoaderCircleIcon, WandSparkles } from "lucide-react";

const STEP_TOTAL = 3;

export default function StepperFileUpload() {
  const t = useTranslations("probeAdjustmentStepper");
  const [currentStep, setCurrentStep] = useState(1);
  const [canProceed, setCanProceed] = useState(false);

  const steps = useMemo(
    () => [
      { title: t("steps.upload"), icon: FileText },
      { title: t("steps.review"), icon: ListTodo },
      { title: t("steps.create"), icon: WandSparkles },
    ],
    [t],
  );

  return (
    <Stepper
      value={currentStep}
      onValueChange={setCurrentStep}
      indicators={{
        completed: <Check className="size-4" />,
        loading: <LoaderCircleIcon className="size-4 animate-spin" />,
      }}
      className="space-y-8"
    >
      <StepperNav className="gap-3 mb-10">
        {steps.map((step, index) => {
          return (
            <StepperItem key={step.title} step={index + 1} className="relative flex-1 items-start">
              <StepperTrigger className="flex flex-col items-start justify-center gap-2.5 grow" asChild>
                <StepperIndicator className="size-9 border-2 data-[state=completed]:text-white data-[state=completed]:bg-primary data-[state=inactive]:bg-transparent data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground">
                  <step.icon className="size-4" />
                </StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {t("step_label", { step: index + 1 })}
                  </div>
                  <StepperTitle className="text-start text-base font-semibold group-data-[state=inactive]/step:text-muted-foreground">
                    {step.title}
                  </StepperTitle>
                  <div>
                    <Badge
                      variant="primary"
                      className="hidden group-data-[state=active]/step:inline-flex"
                    >
                      {t("status.in_progress")}
                    </Badge>

                    <Badge
                      variant="success"
                      size="sm"
                      className="hidden group-data-[state=completed]/step:inline-flex"
                    >
                      {t("status.completed")}
                    </Badge>

                    <Badge
                      variant="secondary"
                      size="sm"
                      className="hidden group-data-[state=inactive]/step:inline-flex text-muted-foreground"
                    >
                      {t("status.pending")}
                    </Badge>
                  </div>
                </div>
              </StepperTrigger>

              {steps.length > index + 1 && (
                <StepperSeparator className="absolute top-4 inset-x-0 start-10 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2.25rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none  group-data-[state=completed]/step:bg-primary" />
              )}
            </StepperItem>
          );
        })}
      </StepperNav>

      <StepperPanel className="text-sm">
        <StepperContent value={1} className="flex items-center justify-center">
          <FileUpload
            uploadUrl="/api/sondes/ajustages/import"
            onAllCompleteChange={setCanProceed}
          />
        </StepperContent>
        <StepperContent value={2} className="flex items-center justify-center py-10 text-muted-foreground">
          {t("placeholders.review")}
        </StepperContent>
        <StepperContent value={3} className="flex items-center justify-center py-10 text-muted-foreground">
          {t("placeholders.create")}
        </StepperContent>
      </StepperPanel>

      <div className="flex items-center justify-between gap-2.5">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
        >
          {t("actions.previous")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev + 1)}
          disabled={currentStep === STEP_TOTAL || (currentStep === 1 && !canProceed)}
        >
          {t("actions.next")}
        </Button>
      </div>
    </Stepper>
  );
}
