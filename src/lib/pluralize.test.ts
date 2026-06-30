import { describe, it, expect } from "vitest";

import { pluralize, formatPlural } from "@/lib/pluralize";

describe("pluralize", () => {
  it("usa singular apenas para 1 e -1", () => {
    expect(pluralize(1, "consulta", "consultas")).toBe("consulta");
    expect(pluralize(-1, "consulta", "consultas")).toBe("consulta");
  });

  it("trata 0 como plural (convenção pt-BR)", () => {
    expect(pluralize(0, "consulta", "consultas")).toBe("consultas");
  });

  it("usa plural para n > 1", () => {
    expect(pluralize(2, "paciente", "pacientes")).toBe("pacientes");
  });
});

describe("formatPlural", () => {
  it("prefixa a contagem", () => {
    expect(formatPlural(0, "consulta", "consultas")).toBe("0 consultas");
    expect(formatPlural(1, "consulta", "consultas")).toBe("1 consulta");
  });
});
