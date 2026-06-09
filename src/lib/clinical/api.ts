/**
 * Backward-compatible facade over the new layered architecture.
 *
 *   UI / hooks  →  services  →  repositories  →  Supabase client
 *
 * Prefer importing from `@/services/*` or `@/hooks/clinical/*` in new code.
 * This module only re-exports the previous flat API so existing routes keep
 * compiling without changes.
 */
import { patientsService } from "@/services/patients.service";
import { appointmentsService } from "@/services/appointments.service";
import { recordsService } from "@/services/records.service";

export type {
  PatientRow,
  PatientInsert,
  PatientUpdate,
  AppointmentRow,
  AppointmentInsert,
  RecordRow,
  RecordKind,
  PatientAlert,
} from "@/domain/clinical/types";

// Patients
export const listPatients = patientsService.list;
export const getPatient = patientsService.getById;
export const createPatient = patientsService.create;
export const updatePatient = patientsService.update;
export const deletePatient = patientsService.remove;

// Appointments
export const listAppointments = appointmentsService.list;
export const getAppointment = appointmentsService.getById;
export const createAppointment = appointmentsService.create;
export const updateAppointment = appointmentsService.update;
export const deleteAppointment = appointmentsService.remove;

// Records
export const listRecords = recordsService.listByPatient;
export const upsertRecord = recordsService.upsert;