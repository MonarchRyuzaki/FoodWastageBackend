import cron from 'node-cron';
import FoodDonation from '../models/FoodDonation.js';
import Claim from '../models/Claim.js';

export const startExpireDonationsJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const expiredDonations = await FoodDonation.find({
        status: { $nin: ['expired', 'delivered'] },
        expiryTime: { $lt: new Date() }
      });

      for (const donation of expiredDonations) {
        donation.status = 'expired';
        await donation.save();

        await Claim.updateMany(
          { donationId: donation._id, status: 'pending' },
          { status: 'expired' }
        );
      }

      if (expiredDonations.length > 0) {
        console.log(`[CRON] Expired ${expiredDonations.length} food donations.`);
      }
    } catch (err) {
      console.error('[CRON ERROR] Expire Donations:', err.message);
    }
  });
};
