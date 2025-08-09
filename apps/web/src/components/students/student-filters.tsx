"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type StudentFilters } from "@/types/student";

interface StudentFiltersProps {
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
  availableClasses: string[];
  availablePromotions: string[];
}

export function StudentFiltersForm({
  filters,
  onFilterChange,
  availableClasses,
  availablePromotions,
}: StudentFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedClass, setSelectedClass] = useState(filters.class || "all");
  const [selectedPromotion, setSelectedPromotion] = useState(filters.promotion || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    filters.isActive === null ? "all" : filters.isActive ? "active" : "inactive"
  );

  // Appliquer les filtres avec un délai pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        search: searchTerm,
        page: 1, // Réinitialiser la pagination lors du filtrage
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Appliquer les autres filtres immédiatement
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    onFilterChange({
      ...filters,
      class: value === "all" ? "" : value,
      page: 1,
    });
  };

  const handlePromotionChange = (value: string) => {
    setSelectedPromotion(value);
    onFilterChange({
      ...filters,
      promotion: value === "all" ? "" : value,
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onFilterChange({
      ...filters,
      isActive: value === "" || value === "all" ? null : value === "active",
      page: 1,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setSelectedPromotion("all");
    setSelectedStatus("all");
    onFilterChange({
      page: 1,
      limit: filters.limit,
      search: "",
      class: "",
      promotion: "",
      isActive: null,
    });
  };

  return (
    <div className="bg-card rounded-md p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Label htmlFor="search">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nom, prénom, matricule..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="class">Classe</Label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger id="class">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="promotion">Promotion</Label>
          <Select value={selectedPromotion} onValueChange={handlePromotionChange}>
            <SelectTrigger id="promotion">
              <SelectValue placeholder="Toutes les promotions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les promotions</SelectItem>
              {availablePromotions.map((promo) => (
                <SelectItem key={promo} value={promo}>
                  {promo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Statut</Label>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={handleReset}>
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
} 