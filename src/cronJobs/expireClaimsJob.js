import cron from 'node-cron';
import Claim from '../models/Claim.js';
import FoodDonation from '../models/FoodDonation.js';

export const startExpireClaimsJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredClaims = await Claim.find({
        status: 'pending',
        bufferExpiryTime: { $lt: new Date() }
      });

      for (const claim of expiredClaims) {
        claim.status = 'expired';
        await claim.save();

        const donation = await FoodDonation.findById(claim.donationId);
        if (donation && donation.status === 'claimed') {
          donation.status = 'available';
          await donation.save();
        }
      }

      if (expiredClaims.length > 0) {
        console.log(`[CRON] Expired ${expiredClaims.length} claims.`);
      }
    } catch (err) {
      console.error('[CRON ERROR] Expire Claims:', err.message);
    }
  });
};
