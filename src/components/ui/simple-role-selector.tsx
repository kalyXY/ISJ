"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/auth";

interface SimpleRoleSelectorProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
}

const roles = [
  { value: "admin", label: "Administrateur" },
  { value: "teacher", label: "Enseignant" },
  { value: "student", label: "Élève" },
  { value: "parent", label: "Parent" },
] as const;

export function SimpleRoleSelector({ value, onChange }: SimpleRoleSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedRole = roles.find((role) => role.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedRole ? selectedRole.label : "Sélectionner un rôle"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 py-2">
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Rechercher un rôle..."
            />
          </div>
          <div className="overflow-hidden p-1">
            {roles.map((role) => (
              <div
                key={role.value}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === role.value ? "bg-accent text-accent-foreground" : ""
                )}
                onClick={() => {
                  onChange(role.value as UserRole);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === role.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {role.label}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 