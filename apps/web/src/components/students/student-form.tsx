"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { type Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentActions } from "@/hooks/useStudents";
import { generateStudentInfo } from "@/services/students";
import { 
  getSections, 
  getOptions, 
  getClasses, 
  getAnneeScolareCourante,
  type Section,
  type Option,
  type Classe,
  type AnneeScolaire
} from "@/services/academics";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// --- Types pour les utilisateurs étudiants non liés ---
interface UserEtudiant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Type pour le formulaire
const studentFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  gender: z.enum(["M", "F"], { message: "Veuillez sélectionner un genre" }),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format de date invalide",
  }),
  sectionId: z.string().optional(),
  optionId: z.string().optional(),
  classeId: z.string().min(1, "La classe est requise"),
  promotion: z.string().min(1, "La promotion est requise"),
  matricule: z.string().min(3, "Le matricule doit contenir au moins 3 caractères"),
  parentPhone: z.string().min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
  isActive: z.boolean(),
  userId: z.string().optional(),
}).refine((data) => {
  // Pour les classes de 7ème et 8ème, section et option ne sont pas requises
  // Pour les autres classes, section et option sont requises
  const selectedClasse = data.classeId;
  if (!selectedClasse) return true; // La validation de classeId se fait séparément
  
  // Cette validation sera complétée après chargement des classes
  return true;
}, {
  message: 'Veuillez sélectionner une section et une option pour les classes de 1ère à 4ème',
  path: ['sectionId']
});

type StudentFormData = {
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  birthDate: string;
  sectionId?: string;
  optionId?: string;
  classeId: string;
  promotion: string;
  matricule: string;
  parentPhone: string;
  isActive: boolean;
  userId?: string;
};

interface StudentFormProps {
  student?: Student;
  open: boolean;
  onClose: () => void;
}

async function fetchUnlinkedEtudiants(): Promise<UserEtudiant[]> {
  try {
    const res = await axiosInstance.get('/admin/users?role=student&notLinkedToStudent=true');
    return res.data.users || [];
  } catch (error: any) {
    console.error('[fetchUnlinkedEtudiants] Erreur:', error);
    throw new Error('Erreur lors du chargement des utilisateurs étudiants');
  }
}

export function StudentForm({ student, open, onClose }: StudentFormProps) {
  const { createStudent, updateStudent, isLoading } = useStudentActions();
  const isEditing = Boolean(student);
  const [sections, setSections] = useState<Section[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [allClasses, setAllClasses] = useState<Classe[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [anneeScolaire, setAnneeScolaire] = useState<AnneeScolaire | null>(null);
  const [etudiants, setEtudiants] = useState<UserEtudiant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userFieldsLocked, setUserFieldsLocked] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [generatingInfo, setGeneratingInfo] = useState(false);
  
  // --- Chargement initial des données ---
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      
      const loadInitialData = async () => {
        try {
          const [sectionsData, optionsData, classesData, etudiantsData] = await Promise.all([
            getSections(),
            getOptions(),
            getClasses(),
            !isEditing ? fetchUnlinkedEtudiants() : Promise.resolve([])
          ]);
          
          setSections(sectionsData);
          setOptions(optionsData);
          setAllClasses(classesData);
          setClasses(classesData); // Afficher toutes les classes par défaut
          setEtudiants(etudiantsData);
          
          // Essayer de récupérer l'année scolaire active
          try {
            const anneeData = await getAnneeScolareCourante();
            setAnneeScolaire(anneeData);
            
            // Si on a une année scolaire active, pré-remplir la promotion
            if (anneeData && !isEditing) {
              form.setValue("promotion", anneeData.nom);
            }
          } catch (anneeError) {
            console.warn('Aucune année scolaire active trouvée, utilisation de l\'année courante');
            // Générer une année scolaire par défaut basée sur l'année courante
            const currentYear = new Date().getFullYear();
            const defaultAnnee = {
              id: 'default',
              nom: `${currentYear}-${currentYear + 1}`,
              debut: `${currentYear}-09-01`,
              fin: `${currentYear + 1}-06-30`,
              actuelle: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setAnneeScolaire(defaultAnnee);
            
            if (!isEditing) {
              form.setValue("promotion", defaultAnnee.nom);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast.error('Erreur lors du chargement des données académiques');
        } finally {
          setLoadingData(false);
        }
      };
      
      loadInitialData();
    }
  }, [open, isEditing]);

  // --- Initialiser le formulaire ---
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "M",
      birthDate: "",
      sectionId: "",
      optionId: "",
      classeId: "",
      promotion: "",
      matricule: "",
      parentPhone: "",
      isActive: true,
      userId: undefined,
    },
  });

  // --- Pré-remplir les champs si un utilisateur étudiant est sélectionné ---
  useEffect(() => {
    if (!isEditing && selectedUserId) {
      const user = etudiants.find((u) => u.id === selectedUserId);
      if (user) {
        form.setValue("firstName", user.firstName);
        form.setValue("lastName", user.lastName);
        form.setValue("userId", user.id);
        setUserFieldsLocked(true);
      }
    } else if (!selectedUserId) {
      setUserFieldsLocked(false);
      form.setValue("userId", undefined);
    }
  }, [selectedUserId, isEditing, etudiants, form]);

  // --- Déterminer si les champs section/option sont nécessaires ---
  const selectedClasse = classes.find(c => c.id === form.watch("classeId"));
  const needsSectionAndOption = selectedClasse ? 
    !selectedClasse.nom.includes('7ème') && !selectedClasse.nom.includes('8ème') : 
    false; // Par défaut, ne pas afficher les champs section/option

  // --- Afficher automatiquement les champs section/option quand une classe est sélectionnée ---
  useEffect(() => {
    const classeId = form.watch("classeId");
    if (classeId) {
      const classe = allClasses.find(c => c.id === classeId);
      if (classe && classe.sectionId && classe.optionId) {
        // Si la classe a une section et option, les pré-remplir
        form.setValue("sectionId", classe.sectionId);
        form.setValue("optionId", classe.optionId);
      } else if (classe && !classe.sectionId && !classe.optionId) {
        // Si la classe n'a pas de section/option (7ème, 8ème), vider ces champs
        form.setValue("sectionId", "");
        form.setValue("optionId", "");
      }
    }
  }, [allClasses, form]);

  // --- Charger les classes quand section et option changent ---
  useEffect(() => {
    const sectionId = form.watch("sectionId");
    const optionId = form.watch("optionId");
    
    setLoadingClasses(true);
    
    // Filtrer les classes selon la logique métier
    let filteredClasses = allClasses;
    
    if (sectionId && optionId) {
      // Pour les classes de 1ère à 4ème : filtrer par section et option
      filteredClasses = allClasses.filter(classe => 
        classe.sectionId === sectionId && classe.optionId === optionId
      );
    } else if (sectionId) {
      // Pour les classes de 1ère à 4ème : filtrer par section seulement
      filteredClasses = allClasses.filter(classe => 
        classe.sectionId === sectionId
      );
    } else {
      // Afficher toutes les classes disponibles (7ème, 8ème, 1ère, 2ème, 3ème, 4ème)
      // Pas de filtrage - montrer toutes les classes
      filteredClasses = allClasses;
    }
    
    setClasses(filteredClasses);
    // Réinitialiser la sélection de classe
    form.setValue("classeId", "");
    setLoadingClasses(false);
  }, [allClasses, form]);

  // --- Générer automatiquement la promotion et le matricule ---
  useEffect(() => {
    const sectionId = form.watch("sectionId");
    const optionId = form.watch("optionId");
    
    if (sectionId && optionId && !isEditing) {
      setGeneratingInfo(true);
      
      const generateInfo = async () => {
        try {
          // Récupérer les noms de section et option
          const section = sections.find(s => s.id === sectionId);
          const option = options.find(o => o.id === optionId);
          
          if (section && option) {
            const info = await generateStudentInfo(section.nom, option.nom);
            form.setValue("promotion", info.promotion);
            form.setValue("matricule", info.matricule);
          }
        } catch (error: any) {
          console.error("Erreur lors de la génération des informations:", error);
          const errorMessage = error.response?.data?.message || 'Erreur lors de la génération du matricule';
          toast.error(errorMessage);
        } finally {
          setGeneratingInfo(false);
        }
      };
      
      generateInfo();
    }
  }, [isEditing, form, sections, options]);

  // --- Remplir le formulaire avec les données de l'élève en cas de modification ---
  useEffect(() => {
    if (student) {
      const birthDate = new Date(student.birthDate);
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender as "M" | "F",
        birthDate: format(birthDate, "yyyy-MM-dd"),
        sectionId: "", // Sera rempli après chargement des sections
        optionId: "", // Sera rempli après chargement des options
        classeId: student.classeId || "",
        promotion: student.promotion,
        matricule: student.matricule,
        parentPhone: student.parentPhone,
        isActive: student.isActive,
      });
      setUserFieldsLocked(false);
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        gender: "M",
        birthDate: "",
        sectionId: "",
        optionId: "",
        classeId: "",
        promotion: anneeScolaire?.nom || "",
        matricule: "",
        parentPhone: "",
        isActive: true,
        userId: undefined,
      });
      setUserFieldsLocked(false);
    }
  }, [student, form, anneeScolaire]);

  // --- Gérer la soumission du formulaire ---
  const onSubmit = useCallback(
    async (data: StudentFormData) => {
      try {
        console.log('[StudentForm] Données à envoyer:', data);
        
        // Validation supplémentaire du matricule
        if (!data.matricule || !data.matricule.match(/^ISJ-\d{4}-[A-Z]{2}-\d{3}$/)) {
          toast.error('Format de matricule invalide. Veuillez sélectionner une section et une option.');
          return;
        }
        
        // Préparer les données pour l'API (convertir undefined en chaînes vides)
        const apiData = {
          ...data,
          sectionId: data.sectionId || "",
          optionId: data.optionId || "",
        };
        
        if (isEditing && student) {
          await updateStudent(student.id, apiData);
        } else {
          await createStudent(apiData);
        }
        onClose();
      } catch (error: any) {
        console.error('Erreur lors de la soumission:', error);
        console.error('Détails de l\'erreur:', error.response?.data);
        
        // Afficher un message d'erreur spécifique pour les matricules dupliqués
        if (error.response?.data?.message?.includes('matricule')) {
          toast.error('Ce matricule existe déjà. Veuillez réessayer.');
        } else {
          toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'élève');
        }
      }
    },
    [isEditing, student, updateStudent, createStudent, onClose]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier un élève" : "Ajouter un nouvel élève"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'élève ci-dessous."
              : "Remplissez le formulaire pour ajouter un nouvel élève."}
          </DialogDescription>
        </DialogHeader>
        
        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* --- Sélection utilisateur étudiant --- */}
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utilisateur existant (étudiant)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedUserId(value);
                          field.onChange(value);
                        }}
                        value={selectedUserId || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un utilisateur étudiant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {etudiants.length === 0 ? (
                            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50">
                              Aucun utilisateur étudiant disponible
                            </div>
                          ) : (
                            etudiants.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sélectionnez un utilisateur existant pour pré-remplir les champs nom et prénom.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* --- Informations personnelles --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} disabled={userFieldsLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} disabled={userFieldsLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Informations académiques --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {needsSectionAndOption && (
                  <FormField
                    control={form.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.length === 0 ? (
                              <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50">
                                Aucune section disponible
                              </div>
                            ) : (
                              sections.map((section) => (
                                <SelectItem key={section.id} value={section.id}>
                                  {section.nom}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {needsSectionAndOption && (
                  <FormField
                    control={form.control}
                    name="optionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {options.length === 0 ? (
                              <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50">
                                Aucune option disponible
                              </div>
                            ) : (
                              options.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.nom}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingClasses}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingClasses ? "Chargement..." : "Sélectionner une classe"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingClasses ? (
                            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50">
                              Chargement des classes...
                            </div>
                          ) : classes.length === 0 ? (
                            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50">
                              Aucune classe disponible pour cette section et option
                            </div>
                          ) : (
                            classes.map((classe) => (
                              <SelectItem key={classe.id} value={classe.id}>
                                {classe.salle ? `${classe.nom} ${classe.salle}` : classe.nom}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="promotion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Généré automatiquement" 
                          {...field} 
                          readOnly 
                          className="bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription>
                        Généré automatiquement selon l'année scolaire active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={generatingInfo ? "Génération en cours..." : "Généré automatiquement"} 
                        {...field} 
                        readOnly 
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormDescription>
                      {generatingInfo ? "Génération en cours..." : "Généré automatiquement selon la section et option"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du parent</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: +243 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Statut actif</FormLabel>
                      <FormDescription>
                        Indique si l&apos;élève est actuellement inscrit à l&apos;école
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading || loadingData || generatingInfo}>
                  {isLoading
                    ? "Enregistrement..."
                    : isEditing
                    ? "Mettre à jour"
                    : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 