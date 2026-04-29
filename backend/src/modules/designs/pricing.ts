/**
 * Centralized pricing for design generation.
 *
 * Base cost (5 points) covers the main image generation. Vision-API costs
 * for analyzing user-supplied reference images are billed on top, so the
 * platform recovers the real OpenAI cost when users attach many references
 * or enable extra analysis modes (measured-image overlay).
 */

export const POINTS_PER_DESIGN = 5;
/** Per analyzed reference image (vision call cost reimbursement). */
export const POINTS_PER_REFERENCE_ANALYSIS = 2;
/** Extra vision pass to overlay dimension callouts on the result. */
export const POINTS_FOR_MEASURED_OVERLAY = 3;

export interface DesignCostInputs {
  /** Reference images attached to this design (each triggers a vision call). */
  refCount?: number;
  /** Whether the design uses the measured-overlay mode. */
  measuredFirst?: boolean;
}

/** Returns the total points required for ONE generated design. */
export function calcDesignCost(inputs: DesignCostInputs = {}): number {
  const refs = Math.max(0, Math.floor(inputs.refCount ?? 0));
  const measured = !!inputs.measuredFirst;
  return (
    POINTS_PER_DESIGN +
    refs * POINTS_PER_REFERENCE_ANALYSIS +
    (measured ? POINTS_FOR_MEASURED_OVERLAY : 0)
  );
}

/** Public breakdown — handy when surfacing cost back to the client. */
export function describeDesignCost(inputs: DesignCostInputs = {}) {
  const refs = Math.max(0, Math.floor(inputs.refCount ?? 0));
  const measured = !!inputs.measuredFirst;
  return {
    base: POINTS_PER_DESIGN,
    references: refs * POINTS_PER_REFERENCE_ANALYSIS,
    measured: measured ? POINTS_FOR_MEASURED_OVERLAY : 0,
    total: calcDesignCost(inputs),
  };
}
