import { appointmentsRepository } from "@/infrastructure/repositories/appointments.repository";
import { getCurrentUserId } from "@/infrastructure/supabase/session";
import type {
  CreateAppointmentDTO,
  ListAppointmentsRange,
  UpdateAppointmentDTO,
} from "@/domain/clinical/types";

export const appointmentsService = {
  list: (range?: ListAppointmentsRange) => appointmentsRepository.list(range),
  getById: (id: string) => appointmentsRepository.findById(id),

  async create(input: CreateAppointmentDTO) {
    const user_id = await getCurrentUserId();
    return appointmentsRepository.insert({ ...input, user_id });
  },

  update: (id: string, patch: UpdateAppointmentDTO) =>
    appointmentsRepository.update(id, patch),

  remove: (id: string) => appointmentsRepository.remove(id),
};