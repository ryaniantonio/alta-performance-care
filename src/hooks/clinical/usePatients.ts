import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "@/services/patients.service";
import type { CreatePatientDTO, UpdatePatientDTO } from "@/domain/clinical/types";

export const patientsKeys = {
  all: ["patients"] as const,
  detail: (id: string) => ["patients", id] as const,
};

export function usePatients() {
  return useQuery({ queryKey: patientsKeys.all, queryFn: patientsService.list });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: id ? patientsKeys.detail(id) : ["patients", "none"],
    queryFn: () => patientsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePatientDTO) => patientsService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: patientsKeys.all }),
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdatePatientDTO) => patientsService.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientsKeys.all });
      qc.invalidateQueries({ queryKey: patientsKeys.detail(id) });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: patientsKeys.all }),
  });
}