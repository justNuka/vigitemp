"use client";

import { BlurFade } from "./BlurFade";
import { MagicCard } from "@/components/ui/magic-card";
import { Card } from "@/components/ui/card";
import { MapPin, Locate, AlertTriangle } from "lucide-react";

const pinLocations = [
  { x: "25%", y: "35%", label: "Salle blanche A", temp: "21.3", status: "ok" },
  { x: "60%", y: "25%", label: "Chambre froide B", temp: "-18.1", status: "alert" },
  { x: "45%", y: "65%", label: "Labo C", temp: "23.7", status: "ok" },
];

const features = [
  { icon: MapPin, text: "Associez chaque sonde a un lieu" },
  { icon: Locate, text: "Visualisez les zones critiques" },
  { icon: AlertTriangle, text: "Retrouvez rapidement l'origine d'une alarme" },
];

export function PlansSection() {
  return (
    <section id="plans" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <BlurFade>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Plans & Emplacements
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              {"Cartographiez vos sondes"}
            </h2>
            <p className="text-muted-foreground">
              {"Visualisez chaque capteur sur le plan de votre site."}
            </p>
          </div>
        </BlurFade>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Mock map with animated pins */}
          <BlurFade delay={200}>
            <Card className="glass border-0 shadow-none p-0 overflow-hidden aspect-4/3">
              <MagicCard className="p-1 h-full">
                <div className="relative w-full h-full rounded-lg bg-secondary/30 overflow-hidden">
                  {/* Grid lines */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "linear-gradient(hsla(190,95%,45%,0.5) 1px, transparent 1px), linear-gradient(90deg, hsla(190,95%,45%,0.5) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  {/* Room outlines */}
                  <div className="absolute top-[15%] left-[10%] w-[35%] h-[40%] border border-border/50 rounded-lg" />
                  <div className="absolute top-[10%] left-[48%] w-[40%] h-[30%] border border-border/50 rounded-lg" />
                  <div className="absolute top-[50%] left-[30%] w-[35%] h-[35%] border border-border/50 rounded-lg" />

                  {/* Animated pins */}
                  {pinLocations.map((pin) => (
                    <div
                      key={pin.label}
                      className="absolute z-10"
                      style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -100%)" }}
                    >
                      {/* Pulse ring */}
                      <div className={`absolute -inset-3 rounded-full animate-pulse-glow ${pin.status === "alert" ? "bg-destructive/20" : "bg-primary/20"}`} />

                      {/* Pin */}
                      <div className={`relative animate-float flex flex-col items-center`} style={{ animationDelay: `${Math.random() * 2}s` }}>
                        <div className={`glass rounded-lg px-2 py-1.5 text-center mb-1 glow-cyan ${pin.status === "alert" ? "border-destructive/40" : ""}`}>
                          <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{pin.label}</p>
                          <p className={`text-xs font-bold ${pin.status === "alert" ? "text-destructive" : "text-primary"}`}>
                            {pin.temp}{"°C"}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${pin.status === "alert" ? "bg-destructive" : "bg-primary"}`} />
                        <div className={`w-px h-3 ${pin.status === "alert" ? "bg-destructive/40" : "bg-primary/40"}`} />
                      </div>
                    </div>
                  ))}

                  {/* Labels */}
                  <span className="absolute top-[17%] left-[14%] text-[9px] text-muted-foreground/50">Salle blanche</span>
                  <span className="absolute top-[12%] left-[52%] text-[9px] text-muted-foreground/50">Ch. froide</span>
                  <span className="absolute top-[52%] left-[34%] text-[9px] text-muted-foreground/50">Laboratoire</span>
                </div>
              </MagicCard>
            </Card>
          </BlurFade>

          {/* Features */}
          <BlurFade delay={400}>
            <div className="flex flex-col gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pt-2">{f.text}</p>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground mt-4 pl-14">
                {"Disponible avec la licence Standard."}
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
