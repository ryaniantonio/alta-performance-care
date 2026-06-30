/**
 * pt-BR pluralization helpers.
 *
 * Portuguese plurals are irregular (consulta -> consultas, paciente -> pacientes,
 * but also avaliacao -> avaliacoes, animal -> animais), so we never derive the
 * plural automatically: both forms are passed explicitly. This kills the habit of
 * rendering "(s)" / "(es)" in user-facing strings.
 *
 * pt-BR convention: 0 is plural ("0 pacientes"); only 1 (and -1) uses the singular.
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return Math.abs(count) === 1 ? singular : plural;
}

/**
 * Same as `pluralize`, but already prefixes the count:
 * `formatPlural(1, "consulta", "consultas")` => "1 consulta";
 * `formatPlural(2, "consulta", "consultas")` => "2 consultas".
 */
export function formatPlural(count: number, singular: string, plural: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
