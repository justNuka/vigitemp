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
          <TabsList className="grid w-full grid-cols-4 bg-primary/10 text-primary">
            <TabsTrigger
              value="test-connexion"
              className="hover:text-primary hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Test de connexion
            </TabsTrigger>
            <TabsTrigger
              value="commentaires"
              className="hover:text-primary hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Commentaires
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="hover:text-primary hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Config
            </TabsTrigger>
            <TabsTrigger
              value="surveillance"
              className="hover:text-primary hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Surveillance
            </TabsTrigger>
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
