"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { TestConnectionTab } from "./test-connection-tab";
import { CommentsTab } from "./comments-tab";

export default function OutilsPage() {
  return (
    <>
      <PageHeader title="Outils" description="Outils de gestion et diagnostic du système" />
      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Tabs defaultValue="test-connexion" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-connexion">Test de connexion</TabsTrigger>
          <TabsTrigger value="commentaires">Commentaires</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
        </TabsList>

        <TabsContent value="test-connexion" className="mt-6">
          <TestConnectionTab />
        </TabsContent>

        <TabsContent value="commentaires" className="mt-6">
          <CommentsTab />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Onglet Config à venir...
          </div>
        </TabsContent>

        <TabsContent value="surveillance" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Onglet Surveillance à venir...
          </div>
        </TabsContent>
      </Tabs>
      </main>
    </>
  );
}
