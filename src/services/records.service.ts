import { recordsRepository } from "@/infrastructure/repositories/records.repository";
import { getCurrentUserId } from "@/infrastructure/supabase/session";
import type { UpsertRecordDTO } from "@/domain/clinical/types";

export const recordsService = {
  listByPatient: (patientId: string) =>
    recordsRepository.listByPatient(patientId),

  async upsert(dto: UpsertRecordDTO) {
    const user_id = await getCurrentUserId();
    return recordsRepository.upsert({
      user_id,
      patient_id: dto.patient_id,
      kind: dto.kind,
      data: dto.data,
      locked: dto.locked ?? false,
    });
  },
};