"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function StudentPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  // Calculer les indices des éléments affichés
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Générer un tableau de numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si le nombre total est inférieur ou égal à maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours inclure la première page
      pages.push(1);
      
      // Calculer les pages du milieu
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Ajuster si nous sommes près du début ou de la fin
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Ajouter un ellipsis si nécessaire
      if (startPage > 2) {
        pages.push(-1); // -1 représente l'ellipsis
      }
      
      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Ajouter un ellipsis si nécessaire
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 représente l'ellipsis
      }
      
      // Toujours inclure la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 py-4">
      <div className="text-sm text-muted-foreground">
        Affichage de {startItem} à {endItem} sur {totalItems} élèves
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center">
            {getPageNumbers().map((pageNumber, index) => {
              if (pageNumber < 0) {
                // Ellipsis
                return (
                  <div key={`ellipsis-${index}`} className="px-2">
                    ...
                  </div>
                );
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(pageNumber)}
                  className="h-8 w-8"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 