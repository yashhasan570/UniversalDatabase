import type { WhiteLabelConfig } from 'universaldatabase-sdk';

/**
 * Display product name for transactional emails — the white-label product name
 * when branding is enabled, otherwise the UniversalDatabase default. Used in template body
 * copy (headings, buttons, preview text) so white-labelled emails don't say
 * "UniversalDatabase".
 */
export const resolveProductName = (
  branding?: WhiteLabelConfig | null,
): string => (branding?.enabled && branding.productName) || 'UniversalDatabase';
