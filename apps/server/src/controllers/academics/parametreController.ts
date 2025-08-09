import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour les paramètres
const parametreSchema = z.object({
  cle: z.string().min(1, 'La clé est requise'),
  valeur: z.string().min(1, 'La valeur est requise'),
  type: z.enum(['number', 'string', 'boolean']),
  description: z.string().optional()
});

// Récupérer tous les paramètres
export const getAllParametres = async (req: Request, res: Response) => {
  try {
    const parametres = await prisma.parametreEcole.findMany({
      orderBy: { cle: 'asc' }
    });

    // Convertir les valeurs selon leur type
    const parametresConverties = parametres.map(param => ({
      ...param,
      valeurConvertie: convertirValeur(param.valeur, param.type)
    }));

    res.json({
      success: true,
      data: parametresConverties,
      message: 'Paramètres récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

// Récupérer un paramètre par clé
export const getParametreByKey = async (req: Request, res: Response) => {
  try {
    const { cle } = req.params;

    const parametre = await prisma.parametreEcole.findUnique({
      where: { cle }
    });

    if (!parametre) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        ...parametre,
        valeurConvertie: convertirValeur(parametre.valeur, parametre.type)
      },
      message: 'Paramètre récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du paramètre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du paramètre'
    });
  }
};

// Créer ou mettre à jour un paramètre
export const upsertParametre = async (req: Request, res: Response) => {
  try {
    const validatedData = parametreSchema.parse(req.body);

    // Valider que la valeur correspond au type
    if (!validerValeurType(validatedData.valeur, validatedData.type)) {
      return res.status(400).json({
        success: false,
        message: `La valeur "${validatedData.valeur}" n'est pas valide pour le type "${validatedData.type}"`
      });
    }

    const parametre = await prisma.parametreEcole.upsert({
      where: { cle: validatedData.cle },
      update: {
        valeur: validatedData.valeur,
        type: validatedData.type,
        description: validatedData.description
      },
      create: validatedData
    });

    res.json({
      success: true,
      data: {
        ...parametre,
        valeurConvertie: convertirValeur(parametre.valeur, parametre.type)
      },
      message: 'Paramètre sauvegardé avec succès'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.issues
      });
    }

    console.error('Erreur lors de la sauvegarde du paramètre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde du paramètre'
    });
  }
};

// Supprimer un paramètre
export const deleteParametre = async (req: Request, res: Response) => {
  try {
    const { cle } = req.params;

    // Vérifier que le paramètre existe
    const parametre = await prisma.parametreEcole.findUnique({
      where: { cle }
    });

    if (!parametre) {
      return res.status(404).json({
        success: false,
        message: 'Paramètre non trouvé'
      });
    }

    // Vérifier que ce n'est pas un paramètre système critique
    const parametresCritiques = ['note_min', 'note_max', 'seuil_reussite'];
    if (parametresCritiques.includes(cle)) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un paramètre système critique'
      });
    }

    await prisma.parametreEcole.delete({
      where: { cle }
    });

    res.json({
      success: true,
      message: 'Paramètre supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du paramètre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du paramètre'
    });
  }
};

// Initialiser les paramètres par défaut
export const initialiserParametresDefaut = async (req: Request, res: Response) => {
  try {
    const parametresDefaut = [
      {
        cle: 'note_min',
        valeur: '0',
        type: 'number',
        description: 'Note minimale autorisée'
      },
      {
        cle: 'note_max',
        valeur: '20',
        type: 'number',
        description: 'Note maximale autorisée'
      },
      {
        cle: 'seuil_reussite',
        valeur: '10',
        type: 'number',
        description: 'Seuil de réussite pour valider une matière'
      },
      {
        cle: 'coefficient_defaut',
        valeur: '1',
        type: 'number',
        description: 'Coefficient par défaut pour les notes'
      },
      {
        cle: 'autoriser_notes_negatives',
        valeur: 'false',
        type: 'boolean',
        description: 'Autoriser les notes négatives'
      },
      {
        cle: 'precision_moyennes',
        valeur: '2',
        type: 'number',
        description: 'Nombre de décimales pour les moyennes'
      },
      {
        cle: 'format_bulletin',
        valeur: 'standard',
        type: 'string',
        description: 'Format par défaut des bulletins'
      }
    ];

    const parametresCrees = [];
    const parametresExistants = [];

    for (const param of parametresDefaut) {
      try {
        const nouveau = await prisma.parametreEcole.create({
          data: param
        });
        parametresCrees.push(nouveau);
      } catch (error: any) {
        if (error.code === 'P2002') { // Contrainte unique violée
          parametresExistants.push(param.cle);
        } else {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      data: {
        parametresCrees: parametresCrees.length,
        parametresExistants: parametresExistants.length,
        details: {
          crees: parametresCrees.map(p => p.cle),
          existants: parametresExistants
        }
      },
      message: `${parametresCrees.length} paramètres créés, ${parametresExistants.length} déjà existants`
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation des paramètres'
    });
  }
};

// Récupérer les paramètres de notation
export const getParametresNotation = async (req: Request, res: Response) => {
  try {
    const parametresNotation = await prisma.parametreEcole.findMany({
      where: {
        cle: {
          in: [
            'note_min',
            'note_max', 
            'seuil_reussite',
            'coefficient_defaut',
            'autoriser_notes_negatives',
            'precision_moyennes'
          ]
        }
      }
    });

    // Créer un objet avec les valeurs converties
    const config: Record<string, any> = {};
    parametresNotation.forEach(param => {
      config[param.cle] = convertirValeur(param.valeur, param.type);
    });

    // Ajouter des valeurs par défaut si manquantes
    const defaults = {
      note_min: 0,
      note_max: 20,
      seuil_reussite: 10,
      coefficient_defaut: 1,
      autoriser_notes_negatives: false,
      precision_moyennes: 2
    };

    Object.keys(defaults).forEach(key => {
      if (config[key] === undefined) {
        config[key] = defaults[key as keyof typeof defaults];
      }
    });

    res.json({
      success: true,
      data: config,
      message: 'Paramètres de notation récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de notation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres de notation'
    });
  }
};

// Mettre à jour plusieurs paramètres en lot
export const updateParametresLot = async (req: Request, res: Response) => {
  try {
    const { parametres } = req.body;

    if (!Array.isArray(parametres)) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "parametres" doit être un tableau'
      });
    }

    const resultats = [];
    const erreurs = [];

    for (const param of parametres) {
      try {
        const validatedData = parametreSchema.parse(param);
        
        if (!validerValeurType(validatedData.valeur, validatedData.type)) {
          erreurs.push({
            cle: validatedData.cle,
            erreur: `La valeur "${validatedData.valeur}" n'est pas valide pour le type "${validatedData.type}"`
          });
          continue;
        }

        const parametre = await prisma.parametreEcole.upsert({
          where: { cle: validatedData.cle },
          update: {
            valeur: validatedData.valeur,
            type: validatedData.type,
            description: validatedData.description
          },
          create: validatedData
        });

        resultats.push(parametre);
      } catch (error: any) {
        erreurs.push({
          cle: param.cle || 'inconnu',
          erreur: error.message
        });
      }
    }

    res.json({
      success: erreurs.length === 0,
      data: {
        parametresMisAJour: resultats.length,
        erreurs: erreurs.length,
        details: {
          succes: resultats.map(p => p.cle),
          erreurs
        }
      },
      message: `${resultats.length} paramètres mis à jour avec succès, ${erreurs.length} erreurs`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour en lot:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour en lot'
    });
  }
};

// Fonctions utilitaires
function convertirValeur(valeur: string, type: string): any {
  switch (type) {
    case 'number':
      return parseFloat(valeur);
    case 'boolean':
      return valeur === 'true';
    default:
      return valeur;
  }
}

function validerValeurType(valeur: string, type: string): boolean {
  switch (type) {
    case 'number':
      return !isNaN(parseFloat(valeur));
    case 'boolean':
      return valeur === 'true' || valeur === 'false';
    case 'string':
      return typeof valeur === 'string';
    default:
      return false;
  }
}