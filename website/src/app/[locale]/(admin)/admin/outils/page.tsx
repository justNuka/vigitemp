"use client"

import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CommentsTab } from "./comments-tab"
import { TestConnectionTab } from "./test-connection-tab"

export default function OutilsPage() {
  return (
    <>
      <PageHeader title="Outils" description="Outils de gestion et diagnostic du système" />
      <main className="flex-1 space-y-6 p-4 animate-fade-in md:p-6">
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
            <div className="py-12 text-center text-muted-foreground">Onglet Config à venir...</div>
          </TabsContent>

          <TabsContent value="surveillance" className="mt-6">
            <div className="py-12 text-center text-muted-foreground">
              Onglet Surveillance à venir...
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}

