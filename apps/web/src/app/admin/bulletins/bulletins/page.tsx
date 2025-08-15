'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Eye, Users, Filter, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { bulletinsService, periodesService, bulletinsUtils, type Bulletin, type Periode } from '@/services/bulletins';
import { classesService, type Classe } from '@/services/academics';

const BulletinsPage = () => {
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<any>(null);
  const [appreciationGenerale, setAppreciationGenerale] = useState('');

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

  const fetchBulletins = async () => {
    if (!selectedClasse || !selectedPeriode) return;
    
    setLoading(true);
    try {
      const filters = {
        classeId: selectedClasse,
        periodeId: selectedPeriode
      };
      const data = await bulletinsService.getAll(filters);
      setBulletins(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des bulletins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (selectedClasse && selectedPeriode) {
      fetchBulletins();
    }
  }, [selectedClasse, selectedPeriode]);

  const handleGenerateBulletin = async (studentId: string) => {
    try {
      setGenerating(true);
      await bulletinsService.generer(studentId, selectedPeriode);
      toast.success('Bulletin généré avec succès');
      fetchBulletins();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la génération du bulletin');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateClasseBulletins = async () => {
    if (!confirm('Générer tous les bulletins de la classe ? Cette opération peut prendre du temps.')) return;
    
    try {
      setGenerating(true);
      await bulletinsService.genererClasse(selectedClasse, selectedPeriode);
      toast.success('Bulletins de classe générés avec succès');
      fetchBulletins();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la génération des bulletins');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (studentId: string, studentName: string) => {
    try {
      const blob = await bulletinsService.downloadPDF(studentId, selectedPeriode);
      bulletinsUtils.downloadBlob(blob, `Bulletin_${studentName}_${selectedPeriode}.pdf`);
      toast.success('Téléchargement du bulletin en cours...');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du téléchargement');
    }
  };

  const handleDownloadClassePDF = async () => {
    try {
      const blob = await bulletinsService.downloadClassePDF(selectedClasse, selectedPeriode);
      bulletinsUtils.downloadBlob(blob, `Bulletins_Classe_${selectedPeriode}.pdf`);
      toast.success('Téléchargement des bulletins en cours...');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du téléchargement');
    }
  };

  const handleViewDetails = async (bulletin: Bulletin) => {
    try {
      const details = await bulletinsService.getDetails(bulletin.studentId, bulletin.periodeId);
      setSelectedBulletin(details);
      setAppreciationGenerale(bulletin.appreciationGenerale || '');
      setDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des détails');
    }
  };

  const handleUpdateAppreciation = async () => {
    if (!selectedBulletin) return;
    
    try {
      await bulletinsService.updateAppreciation(selectedBulletin.bulletin.id, appreciationGenerale);
      toast.success('Appréciation mise à jour avec succès');
      setDialogOpen(false);
      fetchBulletins();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (bulletin: Bulletin) => {
    if (bulletin.isGenerated) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Généré</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
  };

  const getMoyenneColor = (moyenne: number) => {
    if (moyenne >= 16) return 'text-green-600';
    if (moyenne >= 14) return 'text-blue-600';
    if (moyenne >= 12) return 'text-indigo-600';
    if (moyenne >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Génération des Bulletins</h1>
          <p className="text-muted-foreground mt-1">
            Générez et téléchargez les bulletins scolaires par classe et période
          </p>
        </div>
        {selectedClasse && selectedPeriode && (
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateClasseBulletins}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              {generating ? 'Génération...' : 'Générer toute la classe'}
            </Button>
            <Button
              onClick={handleDownloadClassePDF}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger tout (PDF)
            </Button>
          </div>
        )}
      </div>

      {/* Filtres de sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Sélection</span>
          </CardTitle>
          <CardDescription>
            Choisissez la classe et la période pour voir les bulletins
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

      {/* Tableau des bulletins */}
      {selectedClasse && selectedPeriode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Bulletins de la classe</span>
            </CardTitle>
            <CardDescription>
              Gérez les bulletins des élèves de la classe sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Chargement des bulletins...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Moyenne générale</TableHead>
                    <TableHead>Rang</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date génération</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulletins.map((bulletin) => (
                    <TableRow key={bulletin.id}>
                      <TableCell className="font-medium">
                        {bulletin.student?.firstName} {bulletin.student?.lastName}
                      </TableCell>
                      <TableCell>{bulletin.student?.matricule}</TableCell>
                      <TableCell>
                        {bulletin.moyenneGenerale && (
                          <Badge variant="outline" className={getMoyenneColor(bulletin.moyenneGenerale)}>
                            {bulletin.moyenneGenerale.toFixed(2)}/20
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {bulletin.rangClasse && (
                          <Badge variant="secondary">
                            {bulletin.rangClasse}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(bulletin)}</TableCell>
                      <TableCell>
                        {bulletin.dateGeneration 
                          ? new Date(bulletin.dateGeneration).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {bulletin.isGenerated ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(bulletin)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(
                                  bulletin.studentId,
                                  `${bulletin.student?.firstName}_${bulletin.student?.lastName}`
                                )}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGenerateBulletin(bulletin.studentId)}
                              disabled={generating}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Générer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog des détails du bulletin */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du bulletin</DialogTitle>
            <DialogDescription>
              {selectedBulletin?.student && 
                `Bulletin de ${selectedBulletin.student.firstName} ${selectedBulletin.student.lastName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedBulletin && (
            <div className="space-y-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moyenne générale</Label>
                  <div className={`text-lg font-bold ${getMoyenneColor(selectedBulletin.bulletin.moyenneGenerale)}`}>
                    {selectedBulletin.bulletin.moyenneGenerale?.toFixed(2)}/20
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rang dans la classe</Label>
                  <div className="text-lg font-bold">
                    {selectedBulletin.bulletin.rangClasse}
                  </div>
                </div>
              </div>

              {/* Notes par matière */}
              <div className="space-y-2">
                <Label>Notes par matière</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matière</TableHead>
                      <TableHead>Moyenne</TableHead>
                      <TableHead>Coefficient</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBulletin.notesByMatiere?.map((matiere: any) => (
                      <TableRow key={matiere.id}>
                        <TableCell>{matiere.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getMoyenneColor(matiere.moyenne)}>
                            {matiere.moyenne.toFixed(2)}/20
                          </Badge>
                        </TableCell>
                        <TableCell>{matiere.coefficient}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Appréciation générale */}
              <div className="space-y-2">
                <Label htmlFor="appreciation">Appréciation générale</Label>
                <Textarea
                  id="appreciation"
                  value={appreciationGenerale}
                  onChange={(e) => setAppreciationGenerale(e.target.value)}
                  placeholder="Saisissez l'appréciation générale du conseil de classe..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={handleUpdateAppreciation}>
              Mettre à jour l'appréciation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* État vide */}
      {!selectedClasse || !selectedPeriode ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sélection requise</h3>
            <p className="text-muted-foreground">
              Veuillez sélectionner une classe et une période pour voir les bulletins.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default BulletinsPage;