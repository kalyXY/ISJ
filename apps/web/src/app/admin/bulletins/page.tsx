'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Settings, 
  Users,
  TrendingUp,
  Award,
  ClipboardList
} from 'lucide-react';

const BulletinsPage = () => {
  const modules = [
    {
      title: 'Gestion des Périodes',
      description: 'Créer et gérer les trimestres/semestres académiques',
      icon: Calendar,
      href: '/admin/bulletins/periodes',
      color: 'bg-blue-500',
      features: ['Création de périodes', 'Validation des périodes', 'Gestion des dates']
    },
    {
      title: 'Saisie des Notes',
      description: 'Encoder les notes par élève et par matière',
      icon: GraduationCap,
      href: '/admin/bulletins/notes',
      color: 'bg-green-500',
      features: ['Saisie par classe', 'Coefficients', 'Validation des notes']
    },
    {
      title: 'Génération des Bulletins',
      description: 'Créer et télécharger les bulletins scolaires en PDF',
      icon: FileText,
      href: '/admin/bulletins/bulletins',
      color: 'bg-purple-500',
      features: ['Bulletins individuels', 'Bulletins par classe', 'Export PDF']
    },
    {
      title: 'Statistiques & Classements',
      description: 'Analyser les performances et visualiser les données',
      icon: BarChart3,
      href: '/admin/bulletins/statistiques',
      color: 'bg-orange-500',
      features: ['Moyennes de classe', 'Classements', 'Graphiques interactifs']
    },
    {
      title: 'Paramètres Scolaires',
      description: 'Configurer les bornes de notes et paramètres de l\'école',
      icon: Settings,
      href: '/admin/bulletins/parametres',
      color: 'bg-gray-500',
      features: ['Notes min/max', 'Seuils de réussite', 'Configurations']
    }
  ];

  const quickStats = [
    {
      title: 'Périodes Actives',
      value: '3',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Notes en Attente',
      value: '156',
      icon: ClipboardList,
      color: 'text-orange-600'
    },
    {
      title: 'Bulletins Générés',
      value: '89%',
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Classes Suivies',
      value: '12',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des Bulletins & Notes
        </h1>
        <p className="text-muted-foreground">
          Module complet pour la gestion des évaluations, notes et bulletins scolaires
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${module.color}`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {module.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Link href={module.href} passHref>
                  <Button className="w-full">
                    Accéder au module
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Actions Rapides</span>
          </CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités les plus utilisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/bulletins/notes/saisie" passHref>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm">Saisir des Notes</span>
              </Button>
            </Link>
            <Link href="/admin/bulletins/bulletins/generer" passHref>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Générer Bulletins</span>
              </Button>
            </Link>
            <Link href="/admin/bulletins/statistiques/classe" passHref>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Voir Statistiques</span>
              </Button>
            </Link>
            <Link href="/admin/bulletins/periodes/valider" passHref>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Award className="h-6 w-6" />
                <span className="text-sm">Valider Période</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Guide d'utilisation
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-200">
            Suivez ces étapes pour une gestion efficace des bulletins et notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Processus recommandé :
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Créer et configurer les périodes académiques</li>
                <li>Saisir les notes par classe et par matière</li>
                <li>Valider les notes une fois la saisie terminée</li>
                <li>Générer les bulletins pour les élèves</li>
                <li>Consulter les statistiques et classements</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Permissions et sécurité :
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Les enseignants ne peuvent noter que leurs matières</li>
                <li>Seuls les admins peuvent valider les périodes</li>
                <li>Les notes validées ne peuvent plus être modifiées</li>
                <li>Historique complet des modifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletinsPage;