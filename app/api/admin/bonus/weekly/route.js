// // // import { NextResponse } from 'next/server';
// // // import dbConnect from '@/utils/db';
// // // import User from '@/models/User';
// // // import Deposit from '@/models/Deposit';
// // // import Withdraw from '@/models/Withdraw';
// // // import BonusSetting from '@/models/BonusSetting';
// // // import { verifyAuth } from '@/utils/authCheck';

// // // // ==========================================
// // // // সপ্তাহের কী বের করার helper
// // // // ==========================================
// // // function getWeekKey(date = new Date()) {
// // //   const d = new Date(date);
// // //   const year = d.getFullYear();
// // //   const oneJan = new Date(year, 0, 1);
// // //   const days = Math.floor((d - oneJan) / 86400000);
// // //   const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
// // //   return `${year}-W${String(weekNum).padStart(2, '0')}`;
// // // }

// // // // ==========================================
// // // // ✅ POST — সাপ্তাহিক বোনাস দেওয়া
// // // // ==========================================
// // // export async function POST(req) {
// // //   try {
// // //     await dbConnect();

// // //     // ১. Auth check
// // //     const auth = await verifyAuth('admin');
// // //     if (!auth.success) {
// // //       return NextResponse.json(
// // //         { success: false, message: auth.message },
// // //         { status: auth.status }
// // //       );
// // //     }

// // //     // ২. বোনাস সেটিংস পাওয়া
// // //     let settings = await BonusSetting.findOne({});
// // //     if (!settings) {
// // //       settings = await BonusSetting.create({});
// // //     }

// // //     // ৩. চালু আছে কি না চেক
// // //     if (!settings.weeklyBonusEnabled) {
// // //       return NextResponse.json(
// // //         { success: false, message: 'সাপ্তাহিক বোনাস বন্ধ আছে!' },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // ৪. এই সপ্তাহের key
// // //     const thisWeekKey = getWeekKey();

// // //     // ৫. সব ইউজার আনা
// // //     const users = await User.find({ role: 'user' });

// // //     // ৬. হিসাব
// // //     let depositBonusCount = 0;
// // //     let cashbackCount = 0;
// // //     let totalDepositBonus = 0;
// // //     let totalCashback = 0;

// // //     const details = [];

// // //     for (const user of users) {
// // //       // এই সপ্তাহে ইতিমধ্যেই বোনাস পেয়েছে কি না চেক
// // //       const alreadyGot = user.weeklyBonusHistory?.some(
// // //         (h) => h.week === thisWeekKey
// // //       );
// // //       if (alreadyGot) continue;

// // //       let userBonus = 0;
// // //       const userDetails = { uid: user.uid, phone: user.phone, bonuses: [] };

// // //       // ==========================================
// // //       // ✅ ডিপোজিট বোনাস
// // //       // ==========================================
// // //       if (
// // //         settings.depositBonusEnabled &&
// // //         (user.weeklyDeposit || 0) >= settings.depositBonusMinDeposit
// // //       ) {
// // //         let depositBonus = (user.weeklyDeposit || 0) * (settings.depositBonusPercent / 100);
// // //         if (depositBonus > settings.depositBonusMax) {
// // //           depositBonus = settings.depositBonusMax;
// // //         }
// // //         depositBonus = Math.round(depositBonus);

// // //         if (depositBonus > 0) {
// // //           userBonus += depositBonus;
// // //           totalDepositBonus += depositBonus;
// // //           depositBonusCount++;

// // //           user.weeklyBonusHistory.push({
// // //             amount: depositBonus,
// // //             type: 'deposit',
// // //             week: thisWeekKey,
// // //           });

// // //           userDetails.bonuses.push({
// // //             type: 'ডিপোজিট বোনাস',
// // //             amount: depositBonus,
// // //           });
// // //         }
// // //       }

// // //       // ==========================================
// // //       // ✅ ক্যাশব্যাক
// // //       // ==========================================
// // //       if (
// // //         settings.cashbackEnabled &&
// // //         (user.weeklyTurnover || 0) >= settings.cashbackMinTurnover &&
// // //         (user.weeklyLost || 0) > 0
// // //       ) {
// // //         let cashback = (user.weeklyLost || 0) * (settings.cashbackPercent / 100);
// // //         if (cashback > settings.cashbackMax) {
// // //           cashback = settings.cashbackMax;
// // //         }
// // //         cashback = Math.round(cashback);

// // //         if (cashback > 0) {
// // //           userBonus += cashback;
// // //           totalCashback += cashback;
// // //           cashbackCount++;

// // //           user.weeklyBonusHistory.push({
// // //             amount: cashback,
// // //             type: 'cashback',
// // //             week: thisWeekKey,
// // //           });

// // //           userDetails.bonuses.push({
// // //             type: 'ক্যাশব্যাক',
// // //             amount: cashback,
// // //           });
// // //         }
// // //       }

// // //       // ==========================================
// // //       // ✅ বোনাস যোগ করা (যদি কিছু থাকে)
// // //       // ==========================================
// // //       if (userBonus > 0) {
// // //         user.balance += userBonus;
// // //         user.lastWeeklyBonusAt = new Date();

// // //         // ✅ সাপ্তাহিক ডেটা রিসেট
// // //         user.weeklyTurnover = 0;
// // //         user.weeklyLost = 0;
// // //         user.weeklyDeposit = 0;

// // //         await user.save();
// // //         details.push(userDetails);
// // //       }
// // //     }

// // //     // ৭. সেটিংসে ট্র্যাকিং আপডেট
// // //     settings.lastWeeklyBonusAt = new Date();
// // //     settings.weeklyBonusGivenCount = (settings.weeklyBonusGivenCount || 0) + 1;
// // //     await settings.save();

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: `✅ সাপ্তাহিক বোনাস দেওয়া হয়েছে!`,
// // //       summary: {
// // //         totalUsers: depositBonusCount + cashbackCount,
// // //         depositBonusCount,
// // //         cashbackCount,
// // //         totalDepositBonus,
// // //         totalCashback,
// // //         totalBonus: totalDepositBonus + totalCashback,
// // //         weekKey: thisWeekKey,
// // //       },
// // //       details,
// // //     }, { status: 200 });

// // //   } catch (error) {
// // //     console.error('Weekly Bonus Error:', error);
// // //     return NextResponse.json(
// // //       { success: false, message: 'সার্ভার এরর: ' + error.message },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // // //////////////////////////////////////////////////////////

// // import { NextResponse } from 'next/server';
// // import dbConnect from '@/utils/db';
// // import User from '@/models/User';
// // import Deposit from '@/models/Deposit';
// // import Withdraw from '@/models/Withdraw';
// // import BonusSetting from '@/models/BonusSetting';
// // import { verifyAuth } from '@/utils/authCheck';

// // // ==========================================
// // // সপ্তাহের কী বের করার helper
// // // ==========================================
// // function getWeekKey(date = new Date()) {
// //   const d = new Date(date);
// //   const year = d.getFullYear();
// //   const oneJan = new Date(year, 0, 1);
// //   const days = Math.floor((d - oneJan) / 86400000);
// //   const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
// //   return `${year}-W${String(weekNum).padStart(2, '0')}`;
// // }

// // // ==========================================
// // // ✅ POST — সাপ্তাহিক বোনাস দেওয়া
// // // ==========================================
// // export async function POST(req) {
// //   try {
// //     await dbConnect();

// //     // ১. Auth check
// //     const auth = await verifyAuth('admin');
// //     if (!auth.success) {
// //       return NextResponse.json(
// //         { success: false, message: auth.message },
// //         { status: auth.status }
// //       );
// //     }

// //     // ২. বোনাস সেটিংস পাওয়া
// //     let settings = await BonusSetting.findOne({});
// //     if (!settings) {
// //       settings = await BonusSetting.create({});
// //     }

// //     // ৩. চালু আছে কি না চেক
// //     if (!settings.weeklyBonusEnabled) {
// //       return NextResponse.json(
// //         { success: false, message: 'সাপ্তাহিক বোনাস বন্ধ আছে!' },
// //         { status: 400 }
// //       );
// //     }

// //     // ৪. এই সপ্তাহের key
// //     const thisWeekKey = getWeekKey();

// //     // ৫. সব ইউজার আনা
// //     const users = await User.find({ role: 'user' });

// //     // ৬. হিসাব
// //     let depositBonusCount = 0;
// //     let cashbackCount = 0;
// //     let totalDepositBonus = 0;
// //     let totalCashback = 0;

// //     const details = [];

// //     for (const user of users) {
// //       // এই সপ্তাহে ইতিমধ্যেই বোনাস পেয়েছে কি না চেক
// //       const alreadyGot = user.weeklyBonusHistory?.some(
// //         (h) => h.week === thisWeekKey
// //       );
// //       if (alreadyGot) continue;

// //       let userBonus = 0;
// //       const userDetails = { uid: user.uid, phone: user.phone, bonuses: [] };

// //       // ==========================================
// //       // ✅ ডিপোজিট বোনাস
// //       // ==========================================
// //       if (
// //         settings.depositBonusEnabled &&
// //         (user.weeklyDeposit || 0) >= settings.depositBonusMinDeposit
// //       ) {
// //         let depositBonus = (user.weeklyDeposit || 0) * (settings.depositBonusPercent / 100);
// //         if (depositBonus > settings.depositBonusMax) {
// //           depositBonus = settings.depositBonusMax;
// //         }
// //         depositBonus = Math.round(depositBonus);

// //         if (depositBonus > 0) {
// //           userBonus += depositBonus;
// //           totalDepositBonus += depositBonus;
// //           depositBonusCount++;

// //           // ✅ ডিপোজিট বোনাসে ২x টার্নওভার
// //           const depositBonusTurnover = depositBonus * 2;
// //           user.turnover = (user.turnover || 0) + depositBonusTurnover;

// //           user.weeklyBonusHistory.push({
// //             amount: depositBonus,
// //             type: 'deposit',
// //             week: thisWeekKey,
// //           });

// //           userDetails.bonuses.push({
// //             type: 'ডিপোজিট বোনাস',
// //             amount: depositBonus,
// //             turnover: depositBonusTurnover,   // ✅ রিপোর্টে দেখাবে
// //           });
// //         }
// //       }

// //       // ==========================================
// //       // ✅ ক্যাশব্যাক (টার্নওভার ছাড়া — ইউজার খুশি)
// //       // ==========================================
// //       if (
// //         settings.cashbackEnabled &&
// //         (user.weeklyTurnover || 0) >= settings.cashbackMinTurnover &&
// //         (user.weeklyLost || 0) > 0
// //       ) {
// //         let cashback = (user.weeklyLost || 0) * (settings.cashbackPercent / 100);
// //         if (cashback > settings.cashbackMax) {
// //           cashback = settings.cashbackMax;
// //         }
// //         cashback = Math.round(cashback);

// //         if (cashback > 0) {
// //           userBonus += cashback;
// //           totalCashback += cashback;
// //           cashbackCount++;

// //           // ✅ মাসিক ক্যাশব্যাক ট্র্যাকিং
// //           user.monthlyCashbackReceived = (user.monthlyCashbackReceived || 0) + cashback;

// //           user.weeklyBonusHistory.push({
// //             amount: cashback,
// //             type: 'cashback',
// //             week: thisWeekKey,
// //           });

// //           userDetails.bonuses.push({
// //             type: 'ক্যাশব্যাক',
// //             amount: cashback,
// //             // ❌ টার্নওভার নেই — ইউজার খুশি থাকবে
// //           });
// //         }
// //       }

// //       // ==========================================
// //       // ✅ বোনাস যোগ করা (যদি কিছু থাকে)
// //       // ==========================================
// //       if (userBonus > 0) {
// //         user.balance += userBonus;
// //         user.lastWeeklyBonusAt = new Date();

// //         // ✅ সাপ্তাহিক ডেটা রিসেট
// //         user.weeklyTurnover = 0;
// //         user.weeklyLost = 0;
// //         user.weeklyDeposit = 0;

// //         await user.save();
// //         details.push(userDetails);
// //       }
// //     }

// //     // ৭. সেটিংসে ট্র্যাকিং আপডেট
// //     settings.lastWeeklyBonusAt = new Date();
// //     settings.weeklyBonusGivenCount = (settings.weeklyBonusGivenCount || 0) + 1;
// //     await settings.save();

// //     return NextResponse.json({
// //       success: true,
// //       message: `✅ সাপ্তাহিক বোনাস দেওয়া হয়েছে!`,
// //       summary: {
// //         totalUsers: depositBonusCount + cashbackCount,
// //         depositBonusCount,
// //         cashbackCount,
// //         totalDepositBonus,
// //         totalCashback,
// //         totalBonus: totalDepositBonus + totalCashback,
// //         weekKey: thisWeekKey,
// //       },
// //       details,
// //     }, { status: 200 });

// //   } catch (error) {
// //     console.error('Weekly Bonus Error:', error);
// //     return NextResponse.json(
// //       { success: false, message: 'সার্ভার এরর: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }


// // ///////////////////////////////////////////////////////////

// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import Deposit from '@/models/Deposit';
// import Withdraw from '@/models/Withdraw';
// import BonusSetting from '@/models/BonusSetting';
// import { verifyAuth } from '@/utils/authCheck';

// // ==========================================
// // সপ্তাহের key বের করার helper
// // ==========================================
// function getWeekKey(date = new Date()) {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const oneJan = new Date(year, 0, 1);
//   const days = Math.floor((d - oneJan) / 86400000);
//   const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
//   return `${year}-W${String(weekNum).padStart(2, '0')}`;
// }

// // ==========================================
// // ✅ POST — সাপ্তাহিক বোনাস দেওয়া (Atomic)
// // ==========================================
// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. Auth check
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status }
//       );
//     }

//     // ২. বোনাস সেটিংস
//     let settings = await BonusSetting.findOne({});
//     if (!settings) {
//       settings = await BonusSetting.create({});
//     }

//     if (!settings.weeklyBonusEnabled) {
//       return NextResponse.json(
//         { success: false, message: 'সাপ্তাহিক বোনাস বন্ধ আছে!' },
//         { status: 400 }
//       );
//     }

//     // ৩. এই সপ্তাহের key
//     const thisWeekKey = getWeekKey();

//     // ৪. সব ইউজার আনা
//     const users = await User.find({ role: 'user' });

//     let depositBonusCount = 0;
//     let cashbackCount = 0;
//     let totalDepositBonus = 0;
//     let totalCashback = 0;

//     const details = [];

//     // ৫. প্রতিটি ইউজারের জন্য atomic update
//     for (const user of users) {
//       // এই সপ্তাহে ইতিমধ্যেই বোনাস পেয়েছে কি না
//       const alreadyGot = user.weeklyBonusHistory?.some(
//         (h) => h.week === thisWeekKey
//       );
//       if (alreadyGot) continue;

//       let userBonus = 0;
//       let depositBonusTurnover = 0;
//       let cashbackAmount = 0;
//       let depositBonusAmount = 0;
//       const userDetails = { uid: user.uid, phone: user.phone, bonuses: [] };

//       // ==========================================
//       // ✅ ডিপোজিট বোনাস
//       // ==========================================
//       if (
//         settings.depositBonusEnabled &&
//         (user.weeklyDeposit || 0) >= settings.depositBonusMinDeposit
//       ) {
//         let depositBonus = (user.weeklyDeposit || 0) * (settings.depositBonusPercent / 100);
//         if (depositBonus > settings.depositBonusMax) {
//           depositBonus = settings.depositBonusMax;
//         }
//         depositBonus = Math.round(depositBonus);

//         if (depositBonus > 0) {
//           depositBonusAmount = depositBonus;
//           userBonus += depositBonus;
//           totalDepositBonus += depositBonus;
//           depositBonusCount++;

//           depositBonusTurnover = depositBonus * 2;

//           userDetails.bonuses.push({
//             type: 'ডিপোজিট বোনাস',
//             amount: depositBonus,
//             turnover: depositBonusTurnover,
//           });
//         }
//       }

//       // ==========================================
//       // ✅ ক্যাশব্যাক (টার্নওভার ছাড়া)
//       // ==========================================
//       if (
//         settings.cashbackEnabled &&
//         (user.weeklyTurnover || 0) >= settings.cashbackMinTurnover &&
//         (user.weeklyLost || 0) > 0
//       ) {
//         let cashback = (user.weeklyLost || 0) * (settings.cashbackPercent / 100);
//         if (cashback > settings.cashbackMax) {
//           cashback = settings.cashbackMax;
//         }
//         cashback = Math.round(cashback);

//         if (cashback > 0) {
//           cashbackAmount = cashback;
//           userBonus += cashback;
//           totalCashback += cashback;
//           cashbackCount++;

//           userDetails.bonuses.push({
//             type: 'ক্যাশব্যাক',
//             amount: cashback,
//           });
//         }
//       }

//       // ==========================================
//       // ✅ Atomic Update — Race Condition মুক্ত
//       // ==========================================
//       if (userBonus > 0) {
//         try {
//           // ✅ CAS-style conditional update:
//           // weeklyBonusHistory-তে এই week না থাকলে update হবে
//           const updateResult = await User.updateOne(
//             {
//               _id: user._id,
//               'weeklyBonusHistory.week': { $ne: thisWeekKey },  // ✅ CAS
//             },
//             {
//               $inc: {
//                 balance: userBonus,
//                 turnover: depositBonusTurnover,   // ডিপোজিট বোনাসের 2x
//                 ...(cashbackAmount > 0 ? { monthlyCashbackReceived: cashbackAmount } : {}),
//               },
//               $set: {
//                 lastWeeklyBonusAt: new Date(),
//                 weeklyTurnover: 0,
//                 weeklyLost: 0,
//                 weeklyDeposit: 0,
//               },
//               $push: {
//                 weeklyBonusHistory: {
//                   $each: [
//                     {
//                       amount: userBonus,
//                       type: depositBonusAmount > 0 ? 'deposit' : 'cashback',
//                       week: thisWeekKey,
//                       givenAt: new Date(),
//                     }
//                   ]
//                 }
//               }
//             }
//           );

//           // ✅ Update সফল হলে details-এ push
//           if (updateResult.modifiedCount > 0) {
//             details.push(userDetails);
//           }
//         } catch (err) {
//           console.error(`Bonus error for ${user.uid}:`, err.message);
//         }
//       }
//     }

//     // ৬. সেটিংসে ট্র্যাকিং আপডেট (atomic)
//     await BonusSetting.updateOne(
//       { _id: settings._id },
//       {
//         $set: { lastWeeklyBonusAt: new Date() },
//         $inc: { weeklyBonusGivenCount: 1 },
//       }
//     );

//     return NextResponse.json({
//       success: true,
//       message: `✅ সাপ্তাহিক বোনাস দেওয়া হয়েছে!`,
//       summary: {
//         totalUsers: details.length,
//         depositBonusCount,
//         cashbackCount,
//         totalDepositBonus,
//         totalCashback,
//         totalBonus: totalDepositBonus + totalCashback,
//         weekKey: thisWeekKey,
//       },
//       details,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Weekly Bonus Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'সার্ভার এরর: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// //////////////////////////////////////////////

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Deposit from '@/models/Deposit';
import Withdraw from '@/models/Withdraw';
import BonusSetting from '@/models/BonusSetting';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// সপ্তাহের key বের করার helper
// ==========================================
function getWeekKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const days = Math.floor((d - oneJan) / 86400000);
  const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

// ==========================================
// ✅ POST — সাপ্তাহিক বোনাস দেওয়া (Atomic)
// ==========================================
export async function POST(req) {
  try {
    await dbConnect();

    // ১. Auth check
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    // ২. বোনাস সেটিংস
    let settings = await BonusSetting.findOne({});
    if (!settings) {
      settings = await BonusSetting.create({});
    }

    if (!settings.weeklyBonusEnabled) {
      return NextResponse.json(
        { success: false, message: 'সাপ্তাহিক বোনাস বন্ধ আছে!' },
        { status: 400 }
      );
    }

    // ৩. এই সপ্তাহের key
    const thisWeekKey = getWeekKey();

    // ৪. সব ইউজার আনা
    const users = await User.find({ role: 'user' });

    let depositBonusCount = 0;
    let cashbackCount = 0;
    let totalDepositBonus = 0;
    let totalCashback = 0;

    const details = [];

    // ৫. প্রতিটি ইউজারের জন্য atomic update
    for (const user of users) {
      // এই সপ্তাহে ইতিমধ্যেই বোনাস পেয়েছে কি না
      const alreadyGot = user.weeklyBonusHistory?.some(
        (h) => h.week === thisWeekKey
      );
      if (alreadyGot) continue;

      let userBonus = 0;
      let depositBonusTurnover = 0;
      let cashbackAmount = 0;
      let depositBonusAmount = 0;
      const userDetails = { uid: user.uid, phone: user.phone, bonuses: [] };

      // ==========================================
      // ✅ ডিপোজিট বোনাস
      // ==========================================
      if (
        settings.depositBonusEnabled &&
        (user.weeklyDeposit || 0) >= settings.depositBonusMinDeposit
      ) {
        let depositBonus = (user.weeklyDeposit || 0) * (settings.depositBonusPercent / 100);
        if (depositBonus > settings.depositBonusMax) {
          depositBonus = settings.depositBonusMax;
        }
        depositBonus = Math.round(depositBonus);

        if (depositBonus > 0) {
          depositBonusAmount = depositBonus;
          userBonus += depositBonus;
          totalDepositBonus += depositBonus;
          depositBonusCount++;

          depositBonusTurnover = depositBonus * 2;

          userDetails.bonuses.push({
            type: 'ডিপোজিট বোনাস',
            amount: depositBonus,
            turnover: depositBonusTurnover,
          });
        }
      }

      // ==========================================
      // ✅ ক্যাশব্যাক (টার্নওভার ছাড়া)
      // ==========================================
      if (
        settings.cashbackEnabled &&
        (user.weeklyTurnover || 0) >= settings.cashbackMinTurnover &&
        (user.weeklyLost || 0) > 0
      ) {
        let cashback = (user.weeklyLost || 0) * (settings.cashbackPercent / 100);
        if (cashback > settings.cashbackMax) {
          cashback = settings.cashbackMax;
        }
        cashback = Math.round(cashback);

        if (cashback > 0) {
          cashbackAmount = cashback;
          userBonus += cashback;
          totalCashback += cashback;
          cashbackCount++;

          userDetails.bonuses.push({
            type: 'ক্যাশব্যাক',
            amount: cashback,
          });
        }
      }

      // ==========================================
      // ✅ Atomic Update — Race Condition মুক্ত
      // ✅ আলাদা এন্ট্রি: deposit এবং cashback আলাদা push হবে
      // ==========================================
      if (userBonus > 0) {
        try {
          // ✅ CAS-style conditional update:
          // weeklyBonusHistory-তে এই week না থাকলে update হবে
          const updateResult = await User.updateOne(
            {
              _id: user._id,
              'weeklyBonusHistory.week': { $ne: thisWeekKey },  // ✅ CAS
            },
            {
              $inc: {
                balance: userBonus,
                turnover: depositBonusTurnover,   // ডিপোজিট বোনাসের 2x
                ...(cashbackAmount > 0 ? { monthlyCashbackReceived: cashbackAmount } : {}),
              },
              $set: {
                lastWeeklyBonusAt: new Date(),
                weeklyTurnover: 0,
                weeklyLost: 0,
                weeklyDeposit: 0,
              },
              $push: {
                weeklyBonusHistory: {
                  $each: [
                    // ✅ ডিপোজিট এন্ট্রি (যদি থাকে)
                    ...(depositBonusAmount > 0 ? [{
                      amount: depositBonusAmount,
                      type: 'deposit',
                      week: thisWeekKey,
                      givenAt: new Date(),
                    }] : []),

                    // ✅ ক্যাশব্যাক এন্ট্রি (যদি থাকে)
                    ...(cashbackAmount > 0 ? [{
                      amount: cashbackAmount,
                      type: 'cashback',
                      week: thisWeekKey,
                      givenAt: new Date(),
                    }] : []),
                  ]
                }
              }
            }
          );

          // ✅ Update সফল হলে details-এ push
          if (updateResult.modifiedCount > 0) {
            details.push(userDetails);
          }
        } catch (err) {
          console.error(`Bonus error for ${user.uid}:`, err.message);
        }
      }
    }

    // ৬. সেটিংসে ট্র্যাকিং আপডেট (atomic)
    await BonusSetting.updateOne(
      { _id: settings._id },
      {
        $set: { lastWeeklyBonusAt: new Date() },
        $inc: { weeklyBonusGivenCount: 1 },
      }
    );

    return NextResponse.json({
      success: true,
      message: `✅ সাপ্তাহিক বোনাস দেওয়া হয়েছে!`,
      summary: {
        totalUsers: details.length,
        depositBonusCount,
        cashbackCount,
        totalDepositBonus,
        totalCashback,
        totalBonus: totalDepositBonus + totalCashback,
        weekKey: thisWeekKey,
      },
      details,
    }, { status: 200 });

  } catch (error) {
    console.error('Weekly Bonus Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}