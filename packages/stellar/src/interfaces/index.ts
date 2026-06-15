import type { StellarNetwork } from '../types';

/**
 * Placeholder configuration shape for a future Stellar client.
 * No implementation exists yet — this scaffold only reserves the package.
 */
export interface StellarClientConfig {
  network: StellarNetwork;
  horizonUrl: string;
}
