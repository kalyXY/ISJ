'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, Award, BookOpen, Filter, Target, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { statistiquesService, periodesService, type StatistiquesClasse, type StatistiquesMatiere, type Periode } from '@/services/bulletins';
import { classesService, type Classe } from '@/services/academics';

const StatistiquesPage = () => {
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [statistiquesClasse, setStatistiquesClasse] = useState<StatistiquesClasse | null>(null);
  const [statistiquesMatieres, setStatistiquesMatieres] = useState<StatistiquesMatiere[]>([]);
  const [loading, setLoading] = useState(false);

  // États pour les données de référence
  const [classes, setClasses] = useState<Classe[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);

  const fetchReferenceData = async () => {
    try {
      const [periodesData, classesData] = await Promise.all([
        periodesService.getAll(),
        classesService.getAll()
      ]);
      setPeriodes(periodesData);
      setClasses(classesData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données de référence');
    }
  };

  const fetchStatistiques = async () => {
    if (!selectedClasse || !selectedPeriode) return;
    
    setLoading(true);
    try {
      const [statsClasse, statsMatieres] = await Promise.all([
        statistiquesService.getStatistiquesClasse(selectedClasse, selectedPeriode),
        statistiquesService.getStatistiquesMatiere(selectedClasse, selectedPeriode)
      ]);
      
      setStatistiquesClasse(statsClasse);
      setStatistiquesMatieres(statsMatieres);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (selectedClasse && selectedPeriode) {
      fetchStatistiques();
    }
  }, [selectedClasse, selectedPeriode]);

  const getAppreciationColor = (moyenne: number) => {
    if (moyenne >= 16) return 'text-green-600 bg-green-50';
    if (moyenne >= 14) return 'text-blue-600 bg-blue-50';
    if (moyenne >= 12) return 'text-indigo-600 bg-indigo-50';
    if (moyenne >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAppreciation = (moyenne: number) => {
    if (moyenne >= 16) return 'Excellent';
    if (moyenne >= 14) return 'Très bien';
    if (moyenne >= 12) return 'Bien';
    if (moyenne >= 10) return 'Assez bien';
    return 'Insuffisant';
  };

  const StatsCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const RepartitionChart = ({ repartition }: { repartition: any }) => {
    const total = Object.values(repartition).reduce((sum: number, val: any) => sum + val, 0);
    
    return (
      <div className="space-y-2">
        {Object.entries(repartition).map(([niveau, count]: [string, any]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const colorMap: any = {
            excellent: 'bg-green-500',
            tresBien: 'bg-blue-500',
            bien: 'bg-indigo-500',
            assezBien: 'bg-yellow-500',
            insuffisant: 'bg-red-500'
          };
          
          const labelMap: any = {
            excellent: 'Excellent (16-20)',
            tresBien: 'Très bien (14-16)',
            bien: 'Bien (12-14)',
            assezBien: 'Assez bien (10-12)',
            insuffisant: 'Insuffisant (0-10)'
          };
          
          return (
            <div key={niveau} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${colorMap[niveau]}`}></div>
                <span className="text-sm">{labelMap[niveau]}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{count}</span>
                <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Statistiques & Analyses</h1>
        <p className="text-muted-foreground">
          Analysez les performances et visualisez les données académiques
        </p>
      </div>

      {/* Filtres de sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Sélection</span>
          </CardTitle>
          <CardDescription>
            Choisissez la classe et la période pour voir les statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {periodes.map((periode) => (
                    <SelectItem key={periode.id} value={periode.id}>
                      {periode.nom} ({periode.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de la classe */}
      {statistiquesClasse && (
        <>
          {/* Cartes de statistiques générales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Élèves"
              value={statistiquesClasse.statistiques.nombreEleves}
              subtitle="Dans la classe"
              icon={Users}
              color="text-blue-600"
            />
            <StatsCard
              title="Moyenne de classe"
              value={`${statistiquesClasse.statistiques.moyenneClasse.toFixed(2)}/20`}
              subtitle={getAppreciation(statistiquesClasse.statistiques.moyenneClasse)}
              icon={Target}
              color="text-green-600"
            />
            <StatsCard
              title="Meilleure note"
              value={`${statistiquesClasse.statistiques.meilleureNote.toFixed(2)}/20`}
              subtitle="Note maximum"
              icon={Award}
              color="text-yellow-600"
            />
            <StatsCard
              title="Note la plus basse"
              value={`${statistiquesClasse.statistiques.plusBasseNote.toFixed(2)}/20`}
              subtitle="Note minimum"
              icon={TrendingUp}
              color="text-red-600"
            />
          </div>

          {/* Répartition et classement */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Répartition des notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Répartition des niveaux</span>
                </CardTitle>
                <CardDescription>
                  Distribution des élèves par niveau de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RepartitionChart repartition={statistiquesClasse.statistiques.repartition} />
              </CardContent>
            </Card>

            {/* Classement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Classement de la classe</span>
                </CardTitle>
                <CardDescription>
                  Top 10 des élèves de la classe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statistiquesClasse.statistiques.classement.slice(0, 10).map((eleve, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {eleve.rang}
                        </div>
                        <span className="font-medium">
                          {eleve.student.firstName} {eleve.student.lastName}
                        </span>
                      </div>
                      <Badge variant="outline" className={getAppreciationColor(eleve.moyenne)}>
                        {eleve.moyenne.toFixed(2)}/20
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques par matière */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Statistiques par matière</span>
              </CardTitle>
              <CardDescription>
                Performance de la classe dans chaque matière
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Chargement des statistiques...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matière</TableHead>
                      <TableHead>Nombre de notes</TableHead>
                      <TableHead>Moyenne</TableHead>
                      <TableHead>Meilleure note</TableHead>
                      <TableHead>Note la plus basse</TableHead>
                      <TableHead>Appréciation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistiquesMatieres.map((matiere) => (
                      <TableRow key={matiere.matiere.id}>
                        <TableCell className="font-medium">{matiere.matiere.nom}</TableCell>
                        <TableCell>{matiere.nombreNotes}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAppreciationColor(matiere.moyenne)}>
                            {matiere.moyenne.toFixed(2)}/20
                          </Badge>
                        </TableCell>
                        <TableCell>{matiere.meilleureNote.toFixed(2)}/20</TableCell>
                        <TableCell>{matiere.plusBasseNote.toFixed(2)}/20</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${getAppreciationColor(matiere.moyenne)}`}>
                            {getAppreciation(matiere.moyenne)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* État vide */}
      {!selectedClasse || !selectedPeriode ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sélection requise</h3>
            <p className="text-muted-foreground">
              Veuillez sélectionner une classe et une période pour voir les statistiques.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default StatistiquesPage;