'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Plus, Edit, Trash2, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parametresService, type ParametreEcole } from '@/services/bulletins';

const ParametresPage = () => {
  const [parametres, setParametres] = useState<ParametreEcole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParametre, setSelectedParametre] = useState<ParametreEcole | null>(null);
  const [formData, setFormData] = useState({
    cle: '',
    valeur: '',
    type: 'string' as 'number' | 'string' | 'boolean',
    description: ''
  });

  // Paramètres prédéfinis par catégorie
  const categoriesParametres = {
    notation: [
      { cle: 'note_min', label: 'Note minimale', type: 'number', description: 'Note minimale possible (généralement 0)' },
      { cle: 'note_max', label: 'Note maximale', type: 'number', description: 'Note maximale possible (généralement 20)' },
      { cle: 'seuil_reussite', label: 'Seuil de réussite', type: 'number', description: 'Note minimale pour être admis (généralement 10)' },
      { cle: 'precision_note', label: 'Précision des notes', type: 'number', description: 'Nombre de décimales pour les notes (0.25, 0.5, 1)' }
    ],
    appreciation: [
      { cle: 'seuil_excellent', label: 'Seuil Excellent', type: 'number', description: 'Note minimale pour "Excellent" (généralement 16)' },
      { cle: 'seuil_tres_bien', label: 'Seuil Très bien', type: 'number', description: 'Note minimale pour "Très bien" (généralement 14)' },
      { cle: 'seuil_bien', label: 'Seuil Bien', type: 'number', description: 'Note minimale pour "Bien" (généralement 12)' },
      { cle: 'seuil_assez_bien', label: 'Seuil Assez bien', type: 'number', description: 'Note minimale pour "Assez bien" (généralement 10)' }
    ],
    bulletins: [
      { cle: 'afficher_rang', label: 'Afficher le rang', type: 'boolean', description: 'Afficher le rang de l\'élève sur le bulletin' },
      { cle: 'afficher_moyenne_classe', label: 'Afficher moyenne classe', type: 'boolean', description: 'Afficher la moyenne de la classe sur le bulletin' },
      { cle: 'coefficient_defaut', label: 'Coefficient par défaut', type: 'number', description: 'Coefficient par défaut pour les nouvelles notes' },
      { cle: 'appreciation_obligatoire', label: 'Appréciation obligatoire', type: 'boolean', description: 'Rendre l\'appréciation obligatoire pour les bulletins' }
    ],
    systeme: [
      { cle: 'nom_etablissement', label: 'Nom de l\'établissement', type: 'string', description: 'Nom complet de l\'établissement' },
      { cle: 'adresse_etablissement', label: 'Adresse', type: 'string', description: 'Adresse complète de l\'établissement' },
      { cle: 'email_etablissement', label: 'Email', type: 'string', description: 'Email de contact de l\'établissement' },
      { cle: 'telephone_etablissement', label: 'Téléphone', type: 'string', description: 'Numéro de téléphone de l\'établissement' }
    ]
  };

  const fetchParametres = async () => {
    setLoading(true);
    try {
      const data = await parametresService.getAll();
      setParametres(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParametres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (selectedParametre) {
        // Mise à jour
        await parametresService.upsert({
          cle: selectedParametre.cle,
          valeur: formData.valeur,
          type: formData.type,
          description: formData.description
        });
        toast.success('Paramètre mis à jour avec succès');
      } else {
        // Création
        await parametresService.upsert(formData);
        toast.success('Paramètre créé avec succès');
      }
      setDialogOpen(false);
      resetForm();
      fetchParametres();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (parametre: ParametreEcole) => {
    setSelectedParametre(parametre);
    setFormData({
      cle: parametre.cle,
      valeur: parametre.valeur,
      type: parametre.type,
      description: parametre.description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (cle: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) return;
    try {
      await parametresService.delete(cle);
      toast.success('Paramètre supprimé avec succès');
      fetchParametres();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleInitialiserDefaut = async () => {
    if (!confirm('Initialiser les paramètres par défaut ? Cela peut écraser les valeurs existantes.')) return;
    try {
      await parametresService.initialiser();
      toast.success('Paramètres par défaut initialisés avec succès');
      fetchParametres();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'initialisation');
    }
  };

  const resetForm = () => {
    setSelectedParametre(null);
    setFormData({
      cle: '',
      valeur: '',
      type: 'string',
      description: ''
    });
  };

  const getParametreValue = (cle: string) => {
    const parametre = parametres.find(p => p.cle === cle);
    return parametre?.valeur || '';
  };

  const getParametreValeurConvertie = (parametre: ParametreEcole) => {
    switch (parametre.type) {
      case 'boolean':
        return parametre.valeur === 'true' ? 'Oui' : 'Non';
      case 'number':
        return parametre.valeur;
      default:
        return parametre.valeur;
    }
  };

  const ParametresByCategory = ({ title, parametresArray, color }: { title: string; parametresArray: any[]; color: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${color}`}></div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parametresArray.map((paramDef) => {
            const parametre = parametres.find(p => p.cle === paramDef.cle);
            return (
              <div key={paramDef.cle} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{paramDef.label}</div>
                  <div className="text-sm text-muted-foreground">{paramDef.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {parametre ? (
                    <>
                      <Badge variant="outline">
                        {getParametreValeurConvertie(parametre)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(parametre)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          cle: paramDef.cle,
                          valeur: '',
                          type: paramDef.type,
                          description: paramDef.description
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres Scolaires</h1>
          <p className="text-muted-foreground mt-1">
            Configurez les paramètres généraux de l'établissement et du système de notation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleInitialiserDefaut}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Valeurs par défaut
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau paramètre
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Paramètres par catégorie */}
      <div className="grid gap-6 md:grid-cols-2">
        <ParametresByCategory
          title="Système de notation"
          parametresArray={categoriesParametres.notation}
          color="bg-blue-500"
        />
        <ParametresByCategory
          title="Appréciations"
          parametresArray={categoriesParametres.appreciation}
          color="bg-green-500"
        />
        <ParametresByCategory
          title="Bulletins"
          parametresArray={categoriesParametres.bulletins}
          color="bg-purple-500"
        />
        <ParametresByCategory
          title="Informations établissement"
          parametresArray={categoriesParametres.systeme}
          color="bg-orange-500"
        />
      </div>

      {/* Tableau de tous les paramètres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Tous les paramètres</span>
          </CardTitle>
          <CardDescription>
            Vue d'ensemble de tous les paramètres configurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement des paramètres...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clé</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parametres.map((parametre) => (
                  <TableRow key={parametre.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {parametre.cle}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getParametreValeurConvertie(parametre)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{parametre.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {parametre.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(parametre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(parametre.cle)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && parametres.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun paramètre</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par initialiser les paramètres par défaut.
              </p>
              <Button onClick={handleInitialiserDefaut}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Initialiser les paramètres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/modification */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedParametre ? 'Modifier le paramètre' : 'Nouveau paramètre'}
            </DialogTitle>
            <DialogDescription>
              {selectedParametre ? 'Modifiez la valeur du paramètre.' : 'Créez un nouveau paramètre pour l\'école.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cle">Clé du paramètre</Label>
              <Input
                id="cle"
                value={formData.cle}
                onChange={(e) => setFormData({ ...formData, cle: e.target.value })}
                placeholder="Ex: note_max, seuil_reussite..."
                disabled={!!selectedParametre}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de valeur</Label>
              <Select value={formData.type} onValueChange={(value: 'number' | 'string' | 'boolean') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Texte</SelectItem>
                  <SelectItem value="number">Nombre</SelectItem>
                  <SelectItem value="boolean">Vrai/Faux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valeur">Valeur</Label>
              {formData.type === 'boolean' ? (
                <Select value={formData.valeur} onValueChange={(value) => setFormData({ ...formData, valeur: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une valeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Oui (Vrai)</SelectItem>
                    <SelectItem value="false">Non (Faux)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="valeur"
                  type={formData.type === 'number' ? 'number' : 'text'}
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                  placeholder={formData.type === 'number' ? 'Ex: 20, 10.5...' : 'Ex: Institution Saint-Joseph...'}
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du paramètre..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : (selectedParametre ? 'Modifier' : 'Créer')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParametresPage;