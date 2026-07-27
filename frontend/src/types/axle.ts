export interface AxleConfigData {
  numAxles: number;
  axleTyres: number[]; // e.g. [2, 4, 4] for 10-wheeler
}

/**
 * Parses an axle configuration string into structured axle count and per-axle tyre counts.
 * E.g.: "10 Wheeler (3 Axles: 2+4+4)" -> { numAxles: 3, axleTyres: [2, 4, 4] }
 * Fallback defaults to 2 axles [2, 4] if unparseable.
 */
export function parseAxleConfig(configStr?: string): AxleConfigData {
  if (!configStr) {
    return { numAxles: 2, axleTyres: [2, 4] };
  }

  // Check for pattern like "2+4+4" or "2 + 4 + 4"
  const breakdownMatch = configStr.match(/(\d+(?:\s*\+\s*\d+)+)/);
  if (breakdownMatch) {
    const tyres = breakdownMatch[1].split("+").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (tyres.length >= 2) {
      return {
        numAxles: tyres.length,
        axleTyres: tyres,
      };
    }
  }

  // Check for "X Wheeler" or "X Axles"
  const wheelerMatch = configStr.match(/(\d+)\s*Wheeler/i);
  if (wheelerMatch) {
    const totalWheels = parseInt(wheelerMatch[1], 10);
    if (totalWheels <= 6) return { numAxles: 2, axleTyres: [2, 4] };
    if (totalWheels === 10) return { numAxles: 3, axleTyres: [2, 4, 4] };
    if (totalWheels === 12) return { numAxles: 4, axleTyres: [2, 2, 4, 4] };
    if (totalWheels === 14) return { numAxles: 4, axleTyres: [2, 4, 4, 4] };
    if (totalWheels === 16) return { numAxles: 5, axleTyres: [2, 2, 4, 4, 4] };
    if (totalWheels >= 18) return { numAxles: 6, axleTyres: [2, 4, 4, 4, 4, 4] };
  }

  return { numAxles: 2, axleTyres: [2, 4] };
}

/**
 * Serializes AxleConfigData into standard formatted string.
 * E.g.: { numAxles: 3, axleTyres: [2, 4, 4] } -> "10 Wheeler (3 Axles: 2+4+4)"
 */
export function serializeAxleConfig(data: AxleConfigData): string {
  const totalTyres = data.axleTyres.reduce((sum, n) => sum + n, 0);
  const breakdown = data.axleTyres.join(" + ");
  return `${totalTyres} Wheeler (${data.numAxles} Axles: ${breakdown})`;
}
