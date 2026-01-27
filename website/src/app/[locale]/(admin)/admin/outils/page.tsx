"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CommentsTab = dynamic(() => import("./comments-tab").then((mod) => mod.CommentsTab))
const TestConnectionTab = dynamic(() => import("./test-connection-tab").then((mod) => mod.TestConnectionTab))

export default function OutilsPage() {
  const [activeTab, setActiveTab] = useState("test-connexion")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab !== "commentaires") {
        void import("./comments-tab")
      }
      if (activeTab !== "test-connexion") {
        void import("./test-connection-tab")
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [activeTab])

  return (
    <>
      <PageHeader title="Outils" description="Outils de gestion et diagnostic du système" />
      <main className="flex-1 space-y-6 p-4 animate-fade-in md:p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="test-connexion"
          className="w-full"
        >
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
            {activeTab === "test-connexion" ? <TestConnectionTab /> : null}
          </TabsContent>

          <TabsContent value="commentaires" className="mt-6">
            {activeTab === "commentaires" ? <CommentsTab /> : null}
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
