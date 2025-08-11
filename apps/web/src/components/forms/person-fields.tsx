"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface PersonFieldsProps<FormValues> {
  register: any;
  errors: Partial<Record<keyof FormValues, { message?: string }>>;
  genderValue?: string | undefined;
  onGenderChange?: (value: string) => void;
}

export const PersonFields = <FormValues extends Record<string, unknown>>({
  register,
  errors,
  genderValue,
  onGenderChange,
}: PersonFieldsProps<FormValues>) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Prénom"
            {...register("firstName")}
            className={(errors as any).firstName ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {(errors as any).firstName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <Info className="h-3 w-3" />
              {(errors as any).firstName?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Nom de famille"
            {...register("lastName")}
            className={(errors as any).lastName ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {(errors as any).lastName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <Info className="h-3 w-3" />
              {(errors as any).lastName?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium">Genre</Label>
          <Select
            value={genderValue || ""}
            onValueChange={(value) => onGenderChange?.(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-sm font-medium">Date de naissance</Label>
          <Input id="birthDate" type="date" {...register("birthDate")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
          <Input id="phone" type="tel" placeholder="+243 900 000 000" {...register("phone")} />
        </div>
      </div>
    </div>
  );
}; 