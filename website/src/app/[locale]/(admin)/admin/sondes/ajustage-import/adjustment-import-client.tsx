"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StepperFileUpload from "@/components/stepper-file-upload";

export function AdjustmentImportClient() {
  const t = useTranslations("probeAdjustmentImport");
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t("table.title")}</CardTitle>
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
              {t("actions.import")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.columns.file")}</TableHead>
                <TableHead>{t("table.columns.status")}</TableHead>
                <TableHead>{t("table.columns.uploaded_at")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  {t("table.empty")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("modal.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t("modal.description")}</p>
          </DialogHeader>
          <StepperFileUpload />
        </DialogContent>
      </Dialog>
    </div>
  );
}
