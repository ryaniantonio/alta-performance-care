import { patientsRepository } from "@/infrastructure/repositories/patients.repository";
import { getCurrentUserId } from "@/infrastructure/supabase/session";
import type {
  CreatePatientDTO,
  PatientRow,
  UpdatePatientDTO,
} from "@/domain/clinical/types";

/**
 * Patient business logic. Owns the auth/session concern so repositories
 * stay pure data-access.
 */
export const patientsService = {
  list: (): Promise<PatientRow[]> => patientsRepository.list(),
  getById: (id: string) => patientsRepository.findById(id),

  async create(input: CreatePatientDTO): Promise<PatientRow> {
    const user_id = await getCurrentUserId();
    return patientsRepository.insert({ ...input, user_id });
  },

  update: (id: string, patch: UpdatePatientDTO) =>
    patientsRepository.update(id, patch),

  remove: (id: string) => patientsRepository.remove(id),
};