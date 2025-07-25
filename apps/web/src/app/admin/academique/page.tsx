"use client";

import { useState } from 'react';
import { useRequireAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { BookOpen, GraduationCap, School, Book, Calendar } from "lucide-react";

// Import des composants pour chaque onglet
import SectionsTab from "./sections";
import OptionsTab from "./options";
import ClassesTab from "./classes";
import MatieresTab from "./matieres";
import AnneeScolaireTab from "./annees";

export default function AcademiqueAdminPage() {
  const { user, isLoading } = useRequireAuth(["admin"]);
  const [activeTab, setActiveTab] = useState("classes");

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <div className="text-center animate-pulse">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-primary font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Gestion académique</h1>
        <p className="text-muted-foreground">
          Gérer les classes, sections, options et matières de l'école
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-4 h-auto p-1 bg-background">
          <TabsTrigger value="classes" className="flex items-center gap-2 py-3 data-[state=active]:shadow-md">
            <School className="h-4 w-4" />
            <span>Classes</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2 py-3 data-[state=active]:shadow-md">
            <GraduationCap className="h-4 w-4" />
            <span>Sections</span>
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2 py-3 data-[state=active]:shadow-md">
            <BookOpen className="h-4 w-4" />
            <span>Options</span>
          </TabsTrigger>
          <TabsTrigger value="matieres" className="flex items-center gap-2 py-3 data-[state=active]:shadow-md">
            <Book className="h-4 w-4" />
            <span>Matières</span>
          </TabsTrigger>
          <TabsTrigger value="annees" className="flex items-center gap-2 py-3 data-[state=active]:shadow-md">
            <Calendar className="h-4 w-4" />
            <span>Année scolaire</span>
          </TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <TabsContent value="classes" className="mt-0">
            <ClassesTab />
          </TabsContent>
          <TabsContent value="sections" className="mt-0">
            <SectionsTab />
          </TabsContent>
          <TabsContent value="options" className="mt-0">
            <OptionsTab />
          </TabsContent>
          <TabsContent value="matieres" className="mt-0">
            <MatieresTab />
          </TabsContent>
          <TabsContent value="annees" className="mt-0">
            <AnneeScolaireTab />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
} 