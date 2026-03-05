"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/toggle";
import { useWorkspace } from "@/features/workspace/use-workspace";
import { TEMPLATES } from "@/features/workspace/templates";
import { SetupWizard } from "@/features/workspace/setup-wizard";
import type { TemplateInfo } from "@/features/workspace/templates";
import type { Workspace } from "@/types";

type Screen = "home" | "templates" | "wizard";

export default function HomePage() {
  const router = useRouter();
  const { workspace, updateWorkspace, isLoaded } = useWorkspace();
  const [screen, setScreen] = useState<Screen>("home");

  const handleSelectTemplate = (template: TemplateInfo) => {
    const ws = template.create();
    updateWorkspace(ws);
    router.push("/area-de-trabalho");
  };

  const handleWizardComplete = (ws: Workspace) => {
    updateWorkspace(ws);
    setScreen("home");
    router.push("/area-de-trabalho");
  };

  if (screen === "wizard") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-4 lg:p-8 animate-fade-in">
        <SetupWizard
          onComplete={handleWizardComplete}
          onCancel={() => setScreen("home")}
        />
      </main>
    );
  }

  if (screen === "templates") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-4 animate-fade-in">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 animate-step-slide-in-right">
          <div className="flex w-full items-center gap-4">
            <button
              type="button"
              onClick={() => setScreen("home")}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              aria-label="Voltar para a tela inicial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              Escolha um Modelo
            </h1>
            <p className="mt-2 text-text-secondary">
              Selecione o tipo de CAPS para comecar com uma configuracao pre-definida.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            {TEMPLATES.map((template, i) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-shadow hover:shadow-lg animate-stagger-fade-in"
                style={{ "--stagger-index": i } as React.CSSProperties}
                onClick={() => handleSelectTemplate(template)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectTemplate(template);
                  }
                }}
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {template.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-4 animate-fade-in">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold font-hand text-primary">
            CronoCaps
          </h1>
          <p className="mt-2 text-text-secondary">
            Organize atividades e profissionais no seu CAPS
          </p>
        </div>

        {/* Action cards */}
        <div className="flex w-full flex-col gap-4">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => setScreen("templates")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setScreen("templates");
              }
            }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-text-primary">
                Criar a partir de Modelo
              </h2>
              <p className="text-sm text-text-secondary">
                Comece com um modelo pre-configurado com turnos e
                profissionais de exemplo.
              </p>
            </div>
          </Card>

          <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => setScreen("wizard")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setScreen("wizard");
              }
            }}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-text-primary">
                Criar do Zero
              </h2>
              <p className="text-sm text-text-secondary">
                Configure atividades, turnos e profissionais passo a passo.
              </p>
            </div>
          </Card>

          {isLoaded && workspace !== null && (
            <Card
              className="cursor-pointer border-primary/30 transition-shadow hover:shadow-lg"
              onClick={() => router.push("/area-de-trabalho")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push("/area-de-trabalho");
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Continuar Editando
                  </h2>
                  <Button variant="primary" size="sm" tabIndex={-1}>
                    Abrir
                  </Button>
                </div>
                <p className="text-sm text-text-secondary">
                  Retomar o espaco de trabalho &ldquo;{workspace.name}&rdquo;.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
