export type PatientAlert = { kind: "comorbidade" | "alergia"; label: string };

export type Patient = {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  goal: string;
  email: string;
  phone: string;
  lastVisit: string;
  tag: string;
  alerts: PatientAlert[];
};

export const PATIENTS: Patient[] = [
  { id: "mariana-costa", name: "Mariana Costa", age: 34, sex: "F", goal: "Hipertrofia",
    email: "mariana@email.com", phone: "(27) 99999-0001", lastVisit: "12/05/2026", tag: "Clínica",
    alerts: [{ kind: "comorbidade", label: "Hipotireoidismo" }, { kind: "alergia", label: "Lactose" }] },
  { id: "rafael-andrade", name: "Rafael Andrade", age: 58, sex: "M", goal: "Suporte enteral",
    email: "rafa@email.com", phone: "(27) 99999-0002", lastVisit: "10/05/2026", tag: "Enteral",
    alerts: [{ kind: "comorbidade", label: "Diabetes tipo 2" }] },
  { id: "luciana-ferreira", name: "Luciana Ferreira", age: 7, sex: "F", goal: "Nutrição infantil",
    email: "lu@email.com", phone: "(27) 99999-0003", lastVisit: "08/05/2026", tag: "Pediatria",
    alerts: [{ kind: "alergia", label: "Amendoim" }] },
  { id: "eduardo-martins", name: "Eduardo Martins", age: 29, sex: "M", goal: "Emagrecimento",
    email: "edu@email.com", phone: "(27) 99999-0004", lastVisit: "05/05/2026", tag: "Personal",
    alerts: [] },
  { id: "beatriz-almeida", name: "Beatriz Almeida", age: 41, sex: "F", goal: "Performance esportiva",
    email: "bia@email.com", phone: "(27) 99999-0005", lastVisit: "01/05/2026", tag: "Esportiva",
    alerts: [{ kind: "comorbidade", label: "Anemia ferropriva" }] },
];

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}