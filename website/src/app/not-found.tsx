import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Logo size="lg" showText={false} />
          <div className="flex items-center gap-3">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-6xl font-bold tracking-tight">404</h1>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page introuvable</h2>
          <p className="text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
