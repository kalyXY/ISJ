"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Un composant pour afficher un état de chargement
const DataLoading = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <Spinner size="lg" color="primary" />
    <p className="mt-4 text-sm text-muted-foreground">Chargement des données...</p>
  </div>
);

export default function DataTableExample() {
  const [loading, setLoading] = useState(false);
  
  // Simuler un chargement de données
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tableau de données</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <DataLoading />
        ) : (
          <div className="space-y-4">
            <p>Données chargées avec succès</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Élève 1: Jean Mutombo</li>
              <li>Élève 2: Marie Kabongo</li>
              <li>Élève 3: David Nzuzi</li>
              <li>Élève 4: Sarah Mbuyi</li>
              <li>Élève 5: Paul Kalonji</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}