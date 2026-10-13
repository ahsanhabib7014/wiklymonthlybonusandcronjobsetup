// // // import { NextResponse } from 'next/server';
// // // import dbConnect from '@/utils/db';
// // // import User from '@/models/User';
// // // import BonusSetting from '@/models/BonusSetting';
// // // import { verifyAuth } from '@/utils/authCheck';

// // // // ==========================================
// // // // মাসের key বের করার helper
// // // // ==========================================
// // // function getMonthKey(date = new Date()) {
// // //   const d = new Date(date);
// // //   const year = d.getFullYear();
// // //   const month = String(d.getMonth() + 1).padStart(2, '0');
// // //   return `${year}-${month}`;
// // // }

// // // // ==========================================
// // // // ✅ POST — মাসিক টপ র্যাংকার বোনাস দেওয়া
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
// // //     if (!settings.topRankerEnabled) {
// // //       return NextResponse.json(
// // //         { success: false, message: 'মাসিক টপ র‍্যাংকার বন্ধ আছে!' },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // ৪. এই মাসের key
// // //     const thisMonthKey = getMonthKey();

// // //     // ৫. Top ইউজার খোঁজা — মাসিক ক্যাশব্যাক প্রাপ্তির ভিত্তিতে
// // //     const topUsers = await User.find({
// // //       role: 'user',
// // //       monthlyCashbackReceived: { $gt: 0 }
// // //     })
// // //       .sort({ monthlyCashbackReceived: -1 })
// // //       .limit(settings.topRankerCount || 10);

// // //     if (topUsers.length === 0) {
// // //       return NextResponse.json({
// // //         success: false,
// // //         message: 'এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।',
// // //       }, { status: 400 });
// // //     }

// // //     // ৬. পুরস্কার হিসাব
// // //     let totalBonus = 0;
// // //     const details = [];

// // //     for (let i = 0; i < topUsers.length; i++) {
// // //       const user = topUsers[i];
// // //       const rank = i + 1;

// // //       // এই মাসে ইতিমধ্যে পেয়েছে কি না
// // //       const alreadyGot = user.monthlyBonusHistory?.some(
// // //         (h) => h.month === thisMonthKey && h.type === 'top_ranker'
// // //       );
// // //       if (alreadyGot) continue;

// // //       // র‍্যাংক অনুযায়ী পুরস্কার
// // //     let prize = 0;
// // // if (rank === 1) prize = settings.rank1Prize || 5000;
// // // else if (rank === 2) prize = settings.rank2Prize || 3000;
// // // else if (rank === 3) prize = settings.rank3Prize || 2000;
// // // else if (rank === 4) prize = settings.rank4Prize || 1000;
// // // else if (rank === 5) prize = settings.rank5Prize || 800;
// // // else if (rank === 6) prize = settings.rank6Prize || 600;
// // // else if (rank === 7) prize = settings.rank7Prize || 500;
// // // else if (rank === 8) prize = settings.rank8Prize || 400;
// // // else if (rank === 9) prize = settings.rank9Prize || 300;
// // // else if (rank === 10) prize = settings.rank10Prize || 200;
// // // else prize = 0;

// // //       if (prize <= 0) continue;

// // //       // ব্যালেন্সে যোগ
// // //       user.balance = (user.balance || 0) + prize;
// // //       user.lastMonthlyBonusAt = new Date();

// // //       // হিস্ট্রিতে যোগ
// // //       user.monthlyBonusHistory.push({
// // //         amount: prize,
// // //         type: 'top_ranker',
// // //         month: thisMonthKey,
// // //         rank: rank,
// // //       });

// // //       await user.save();

// // //       totalBonus += prize;
// // //       details.push({
// // //         rank,
// // //         uid: user.uid,
// // //         phone: user.phone,
// // //         monthlyCashbackReceived: user.monthlyCashbackReceived,
// // //         prize,
// // //       });
// // //     }

// // //     // ৭. সেটিংসে ট্র্যাকিং আপডেট
// // //     settings.lastMonthlyBonusAt = new Date();
// // //     settings.monthlyBonusGivenCount = (settings.monthlyBonusGivenCount || 0) + 1;
// // //     await settings.save();

// // //     // ৮. সবার monthlyCashbackReceived রিসেট (নতুন মাসের জন্য)
// // //     await User.updateMany(
// // //       { role: 'user' },
// // //       { $set: { monthlyCashbackReceived: 0, monthlyTurnover: 0, monthlyLost: 0 } }
// // //     );

// // //     return NextResponse.json({
// // //       success: true,
// // //       message: `✅ মাসিক টপ র‍্যাংকার বোনাস দেওয়া হয়েছে!`,
// // //       summary: {
// // //         totalWinners: details.length,
// // //         totalBonus,
// // //         monthKey: thisMonthKey,
// // //       },
// // //       details,
// // //     }, { status: 200 });

// // //   } catch (error) {
// // //     console.error('Monthly Bonus Error:', error);
// // //     return NextResponse.json(
// // //       { success: false, message: 'সার্ভার এরর: ' + error.message },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }


// // // /////////////////////////////////////////////////

// // import { NextResponse } from 'next/server';
// // import dbConnect from '@/utils/db';
// // import User from '@/models/User';
// // import BonusSetting from '@/models/BonusSetting';
// // import { verifyAuth } from '@/utils/authCheck';

// // // ==========================================
// // // মাসের key বের করার helper
// // // ==========================================
// // function getMonthKey(date = new Date()) {
// //   const d = new Date(date);
// //   const year = d.getFullYear();
// //   const month = String(d.getMonth() + 1).padStart(2, '0');
// //   return `${year}-${month}`;
// // }

// // // ==========================================
// // // ✅ POST — মাসিক টপ র্যাংকার বোনাস দেওয়া
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
// //     if (!settings.topRankerEnabled) {
// //       return NextResponse.json(
// //         { success: false, message: 'মাসিক টপ র‍্যাংকার বন্ধ আছে!' },
// //         { status: 400 }
// //       );
// //     }

// //     // ৪. এই মাসের key
// //     const thisMonthKey = getMonthKey();

// //     // ৫. Top ইউজার খোঁজা — মাসিক ক্যাশব্যাক প্রাপ্তির ভিত্তিতে
// //     const topUsers = await User.find({
// //       role: 'user',
// //       monthlyCashbackReceived: { $gt: 0 }
// //     })
// //       .sort({ monthlyCashbackReceived: -1 })
// //       .limit(settings.topRankerCount || 10);

// //     if (topUsers.length === 0) {
// //       return NextResponse.json({
// //         success: false,
// //         message: 'এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।',
// //       }, { status: 400 });
// //     }

// //     // ৬. পুরস্কার হিসাব
// //     let totalBonus = 0;
// //     const details = [];

// //     for (let i = 0; i < topUsers.length; i++) {
// //       const user = topUsers[i];
// //       const rank = i + 1;

// //       // এই মাসে ইতিমধ্যে পেয়েছে কি না
// //       const alreadyGot = user.monthlyBonusHistory?.some(
// //         (h) => h.month === thisMonthKey && h.type === 'top_ranker'
// //       );
// //       if (alreadyGot) continue;

// //       // র‍্যাংক অনুযায়ী পুরস্কার
// //       let prize = 0;
// //       if (rank === 1) prize = settings.rank1Prize || 5000;
// //       else if (rank === 2) prize = settings.rank2Prize || 3000;
// //       else if (rank === 3) prize = settings.rank3Prize || 2000;
// //       else if (rank === 4) prize = settings.rank4Prize || 1000;
// //       else if (rank === 5) prize = settings.rank5Prize || 800;
// //       else if (rank === 6) prize = settings.rank6Prize || 600;
// //       else if (rank === 7) prize = settings.rank7Prize || 500;
// //       else if (rank === 8) prize = settings.rank8Prize || 400;
// //       else if (rank === 9) prize = settings.rank9Prize || 300;
// //       else if (rank === 10) prize = settings.rank10Prize || 200;
// //       else if (rank >= 11) prize = settings.rank11PlusPrize || 100;   // ✅ নতুন
// //       else prize = 0;

// //       if (prize <= 0) continue;

// //       // ব্যালেন্সে যোগ
// //       user.balance = (user.balance || 0) + prize;
// //       user.lastMonthlyBonusAt = new Date();

// //       // হিস্ট্রিতে যোগ
// //       user.monthlyBonusHistory.push({
// //         amount: prize,
// //         type: 'top_ranker',
// //         month: thisMonthKey,
// //         rank: rank,
// //       });

// //       await user.save();

// //       totalBonus += prize;
// //       details.push({
// //         rank,
// //         uid: user.uid,
// //         phone: user.phone,
// //         monthlyCashbackReceived: user.monthlyCashbackReceived,
// //         prize,
// //       });
// //     }

// //     // ৭. সেটিংসে ট্র্যাকিং আপডেট
// //     settings.lastMonthlyBonusAt = new Date();
// //     settings.monthlyBonusGivenCount = (settings.monthlyBonusGivenCount || 0) + 1;
// //     await settings.save();

// //     // ৮. সবার monthlyCashbackReceived রিসেট (নতুন মাসের জন্য)
// //     await User.updateMany(
// //       { role: 'user' },
// //       { $set: { monthlyCashbackReceived: 0, monthlyTurnover: 0, monthlyLost: 0 } }
// //     );

// //     return NextResponse.json({
// //       success: true,
// //       message: `✅ মাসিক টপ র‍্যাংকার বোনাস দেওয়া হয়েছে!`,
// //       summary: {
// //         totalWinners: details.length,
// //         totalBonus,
// //         monthKey: thisMonthKey,
// //       },
// //       details,
// //     }, { status: 200 });

// //   } catch (error) {
// //     console.error('Monthly Bonus Error:', error);
// //     return NextResponse.json(
// //       { success: false, message: 'সার্ভার এরর: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// // //////////////////////////////////////////////////////////

// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import User from '@/models/User';
// import BonusSetting from '@/models/BonusSetting';
// import { verifyAuth } from '@/utils/authCheck';

// // ==========================================
// // মাসের key বের করার helper
// // ==========================================
// function getMonthKey(date = new Date()) {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   return `${year}-${month}`;
// }

// // ==========================================
// // ✅ POST — মাসিক টপ র‍্যাংকার বোনাস দেওয়া
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

//     // ২. বোনাস সেটিংস পাওয়া
//     let settings = await BonusSetting.findOne({});
//     if (!settings) {
//       settings = await BonusSetting.create({});
//     }

//     // ৩. চালু আছে কি না চেক
//     if (!settings.topRankerEnabled) {
//       return NextResponse.json(
//         { success: false, message: 'মাসিক টপ র‍্যাংকার বন্ধ আছে!' },
//         { status: 400 }
//       );
//     }

//     // ৪. এই মাসের key
//     const thisMonthKey = getMonthKey();

//     // ৫. Top ইউজার খোঁজা — মাসিক ক্যাশব্যাক প্রাপ্তির ভিত্তিতে
//     const topUsers = await User.find({
//       role: 'user',
//       monthlyCashbackReceived: { $gt: 0 }
//     })
//       .sort({ monthlyCashbackReceived: -1 })
//       .limit(settings.topRankerCount || 10);

//     if (topUsers.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: 'এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।',
//       }, { status: 400 });
//     }

//     // ৬. পুরস্কার হিসাব
//     let totalBonus = 0;
//     const details = [];

//     for (let i = 0; i < topUsers.length; i++) {
//       const user = topUsers[i];
//       const rank = i + 1;

//       // এই মাসে ইতিমধ্যে পেয়েছে কি না
//       const alreadyGot = user.monthlyBonusHistory?.some(
//         (h) => h.month === thisMonthKey && h.type === 'top_ranker'
//       );
//       if (alreadyGot) continue;

//       // র‍্যাংক অনুযায়ী পুরস্কার
//       let prize = 0;
//       if (rank === 1) prize = settings.rank1Prize || 5000;
//       else if (rank === 2) prize = settings.rank2Prize || 3000;
//       else if (rank === 3) prize = settings.rank3Prize || 2000;
//       else if (rank === 4) prize = settings.rank4Prize || 1000;
//       else if (rank === 5) prize = settings.rank5Prize || 800;
//       else if (rank === 6) prize = settings.rank6Prize || 600;
//       else if (rank === 7) prize = settings.rank7Prize || 500;
//       else if (rank === 8) prize = settings.rank8Prize || 400;
//       else if (rank === 9) prize = settings.rank9Prize || 300;
//       else if (rank === 10) prize = settings.rank10Prize || 200;
//       else if (rank >= 11) prize = settings.rank11PlusPrize || 100;
//       else prize = 0;

//       if (prize <= 0) continue;

//       // ✅ টপ র‍্যাংকারে ৩x টার্নওভার
//       const topRankerTurnover = prize * 3;

//       // ব্যালেন্সে যোগ
//       user.balance = (user.balance || 0) + prize;
//       user.turnover = (user.turnover || 0) + topRankerTurnover;   // ✅ নতুন
//       user.lastMonthlyBonusAt = new Date();

//       // হিস্ট্রিতে যোগ
//       user.monthlyBonusHistory.push({
//         amount: prize,
//         type: 'top_ranker',
//         month: thisMonthKey,
//         rank: rank,
//       });

//       await user.save();

//       totalBonus += prize;
//       details.push({
//         rank,
//         uid: user.uid,
//         phone: user.phone,
//         monthlyCashbackReceived: user.monthlyCashbackReceived,
//         prize,
//         turnover: topRankerTurnover,   // ✅ রিপোর্টে দেখাবে
//       });
//     }

//     // ৭. সেটিংসে ট্র্যাকিং আপডেট
//     settings.lastMonthlyBonusAt = new Date();
//     settings.monthlyBonusGivenCount = (settings.monthlyBonusGivenCount || 0) + 1;
//     await settings.save();

//     // ৮. সবার monthlyCashbackReceived রিসেট (নতুন মাসের জন্য)
//     await User.updateMany(
//       { role: 'user' },
//       { $set: { monthlyCashbackReceived: 0, monthlyTurnover: 0, monthlyLost: 0 } }
//     );

//     return NextResponse.json({
//       success: true,
//       message: `✅ মাসিক টপ র‍্যাংকার বোনাস দেওয়া হয়েছে!`,
//       summary: {
//         totalWinners: details.length,
//         totalBonus,
//         monthKey: thisMonthKey,
//       },
//       details,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Monthly Bonus Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'সার্ভার এরর: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// // ///////////////////////////////////////////////////////

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import BonusSetting from '@/models/BonusSetting';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// মাসের key বের করার helper
// ==========================================
function getMonthKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// ==========================================
// ✅ POST — মাসিক টপ র‍্যাংকার বোনাস (Atomic)
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

    if (!settings.topRankerEnabled) {
      return NextResponse.json(
        { success: false, message: 'মাসিক টপ র‍্যাংকার বন্ধ আছে!' },
        { status: 400 }
      );
    }

    // ৩. এই মাসের key
    const thisMonthKey = getMonthKey();

    // ৪. Top ইউজার — monthlyCashbackReceived > 0
    const topUsers = await User.find({
      role: 'user',
      monthlyCashbackReceived: { $gt: 0 }
    })
      .sort({ monthlyCashbackReceived: -1 })
      .limit(settings.topRankerCount || 10);

    if (topUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।',
      }, { status: 400 });
    }

    let totalBonus = 0;
    const details = [];

    // ৫. প্রতিটি ইউজারের জন্য atomic update
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const rank = i + 1;

      // এই মাসে ইতিমধ্যে পেয়েছে কি না
      const alreadyGot = user.monthlyBonusHistory?.some(
        (h) => h.month === thisMonthKey && h.type === 'top_ranker'
      );
      if (alreadyGot) continue;

      // র‍্যাংক অনুযায়ী পুরস্কার
      let prize = 0;
      if (rank === 1) prize = settings.rank1Prize || 5000;
      else if (rank === 2) prize = settings.rank2Prize || 3000;
      else if (rank === 3) prize = settings.rank3Prize || 2000;
      else if (rank === 4) prize = settings.rank4Prize || 1000;
      else if (rank === 5) prize = settings.rank5Prize || 800;
      else if (rank === 6) prize = settings.rank6Prize || 600;
      else if (rank === 7) prize = settings.rank7Prize || 500;
      else if (rank === 8) prize = settings.rank8Prize || 400;
      else if (rank === 9) prize = settings.rank9Prize || 300;
      else if (rank === 10) prize = settings.rank10Prize || 200;
      else if (rank >= 11) prize = settings.rank11PlusPrize || 100;

      if (prize <= 0) continue;

      // ✅ টপ র‍্যাংকারে ৩x টার্নওভার
      const topRankerTurnover = prize * 3;

      // ✅ Atomic update — CAS style
      // - monthlyBonusHistory-তে এই মাসে top_ranker না থাকলে তবেই update
      try {
        const updateResult = await User.updateOne(
          {
            _id: user._id,
            // ✅ CAS: এই মাসে top_ranker এন্ট্রি না থাকলে update
            'monthlyBonusHistory': {
              $not: {
                $elemMatch: {
                  month: thisMonthKey,
                  type: 'top_ranker',
                }
              }
            }
          },
          {
            $inc: {
              balance: prize,
              turnover: topRankerTurnover,
            },
            $set: {
              lastMonthlyBonusAt: new Date(),
            },
            $push: {
              monthlyBonusHistory: {
                amount: prize,
                type: 'top_ranker',
                month: thisMonthKey,
                rank: rank,
                givenAt: new Date(),
              }
            }
          }
        );

        // ✅ Update সফল হলে details-এ push
        if (updateResult.modifiedCount > 0) {
          totalBonus += prize;
          details.push({
            rank,
            uid: user.uid,
            phone: user.phone,
            monthlyCashbackReceived: user.monthlyCashbackReceived,
            prize,
            turnover: topRankerTurnover,
          });
        }
      } catch (err) {
        console.error(`Top ranker error for ${user.uid}:`, err.message);
      }
    }

    // ৬. সেটিংসে ট্র্যাকিং আপডেট (atomic)
    await BonusSetting.updateOne(
      { _id: settings._id },
      {
        $set: { lastMonthlyBonusAt: new Date() },
        $inc: { monthlyBonusGivenCount: 1 },
      }
    );

    // ৭. সবার মাসিক ডাটা রিসেট (atomic)
    // ✅ শুধু monthlyCashbackReceived, monthlyTurnover, monthlyLost রিসেট
    // ✅ যারা top ranker পেয়েছে তাদের monthlyBonusHistory থাকবে
    await User.updateMany(
      { role: 'user' },
      {
        $set: {
          monthlyCashbackReceived: 0,
          monthlyTurnover: 0,
          monthlyLost: 0,
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `✅ মাসিক টপ র‍্যাংকার বোনাস দেওয়া হয়েছে!`,
      summary: {
        totalWinners: details.length,
        totalBonus,
        monthKey: thisMonthKey,
      },
      details,
    }, { status: 200 });

  } catch (error) {
    console.error('Monthly Bonus Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}