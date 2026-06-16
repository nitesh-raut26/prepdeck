import { describe, expect, it } from "vitest";
import { isolationSteps } from "../isolation-algos";

const last = <T,>(a: T[]) => a[a.length - 1];

describe("isolationSteps — SQL-standard anomaly matrix", () => {
  it("dirty read: allowed only at read-uncommitted", () => {
    expect(last(isolationSteps("dirty", "read-uncommitted")).verdict).toBe("anomaly");
    expect(last(isolationSteps("dirty", "read-committed")).verdict).toBe("prevented");
  });

  it("non-repeatable: allowed up to read-committed, prevented at repeatable-read", () => {
    expect(last(isolationSteps("nonrepeatable", "read-committed")).verdict).toBe("anomaly");
    expect(last(isolationSteps("nonrepeatable", "repeatable-read")).verdict).toBe("prevented");
  });

  it("phantom: allowed up to repeatable-read, prevented only at serializable", () => {
    expect(last(isolationSteps("phantom", "repeatable-read")).verdict).toBe("anomaly");
    expect(last(isolationSteps("phantom", "serializable")).verdict).toBe("prevented");
  });

  it("surfaces what T1 sees at its critical read", () => {
    const anomalyRead = isolationSteps("nonrepeatable", "read-committed").find(
      (s) => s.t1Sees != null,
    );
    expect(anomalyRead!.t1Sees).toBe("20"); // re-read differs
    const safeRead = isolationSteps("nonrepeatable", "serializable").find(
      (s) => s.t1Sees != null,
    );
    expect(safeRead!.t1Sees).toBe("10"); // stable snapshot
  });
});
