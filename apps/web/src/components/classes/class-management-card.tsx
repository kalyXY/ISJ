import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Eye, School, AlertTriangle } from 'lucide-react';

interface ClassManagementCardProps {
  class: {
    id: string;
    nom: string;
    salle?: string;
    section?: { nom: string };
    option?: { nom: string };
    anneeScolaire: string;
    capaciteMaximale: number;
    description?: string;
    studentsCount: number;
    availableSpots: number;
    isAtCapacity: boolean;
    capacityPercentage: number;
  };
  onViewStudents: () => void;
  onAssignStudent: () => void;
}

export const ClassManagementCard = ({ class: classe, onViewStudents, onAssignStudent }: ClassManagementCardProps) => {
  const getCapacityColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCapacityBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return 'destructive';
    if (percentage >= 80) return 'outline';
    return 'secondary';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${classe.isAtCapacity ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <School className="h-5 w-5 text-blue-600" />
              {classe.nom}
              {classe.salle && (
                <Badge variant="outline" className="text-xs">
                  Salle {classe.salle}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {classe.section && (
                <Badge variant="secondary" className="text-xs">
                  {classe.section.nom}
                </Badge>
              )}
              {classe.option && (
                <Badge variant="secondary" className="text-xs">
                  {classe.option.nom}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {classe.anneeScolaire}
              </Badge>
            </div>
          </div>
          
          {classe.isAtCapacity && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {classe.description && (
          <p className="text-sm text-muted-foreground">{classe.description}</p>
        )}
        
        {/* Informations de capacité */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Occupation
            </span>
            <span className={getCapacityColor(classe.capacityPercentage)}>
              {classe.studentsCount}/{classe.capaciteMaximale}
            </span>
          </div>
          
          <Progress 
            value={classe.capacityPercentage} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={getCapacityBadgeVariant(classe.capacityPercentage)}
              className="text-xs"
            >
              {classe.capacityPercentage}% occupé
            </Badge>
            
            {classe.availableSpots > 0 ? (
              <span className="text-xs text-muted-foreground">
                {classe.availableSpots} place{classe.availableSpots > 1 ? 's' : ''} libre{classe.availableSpots > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium">
                Complet
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewStudents}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Voir élèves
          </Button>
          
          <Button
            size="sm"
            onClick={onAssignStudent}
            disabled={classe.isAtCapacity}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {classe.isAtCapacity ? 'Complet' : 'Affecter'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};