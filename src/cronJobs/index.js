import { startExpireClaimsJob } from './expireClaimsJob.js';
import { startExpireDonationsJob } from './expireDonationJobs.js';

export const startBackgroundJobs = () => {
  startExpireClaimsJob();
  startExpireDonationsJob();
};
