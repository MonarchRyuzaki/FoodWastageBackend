import { startExpireClaimsJob } from './expireClaimsJob.js';
import { startExpireDonationsJob } from './expireDonationsJob.js';

export const startBackgroundJobs = () => {
  startExpireClaimsJob();
  startExpireDonationsJob();
};
