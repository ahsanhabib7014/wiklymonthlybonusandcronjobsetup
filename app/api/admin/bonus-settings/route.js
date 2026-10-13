// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import BonusSetting from '@/models/BonusSetting';
// import { verifyAuth } from '@/utils/authCheck';

// // ==========================================
// // ✅ GET — বোনাস সেটিংস পাওয়া
// // ==========================================
// export async function GET(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status }
//       );
//     }

//     let settings = await BonusSetting.findOne({});

//     // যদি কোনো সেটিংস না থাকে — ডিফল্ট তৈরি করি
//     if (!settings) {
//       settings = await BonusSetting.create({});
//     }

//     return NextResponse.json({
//       success: true,
//       settings
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Bonus Settings GET Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'সার্ভার এরর: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // ✅ PATCH — বোনাস সেটিংস আপডেট
// // ==========================================
// export async function PATCH(req) {
//   try {
//     await dbConnect();

//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status }
//       );
//     }

//     const body = await req.json();

//     // কোন কোন ফিল্ড আপডেট করা যাবে
//     const allowedFields = [
//       // সাপ্তাহিক
//       'weeklyBonusEnabled',
//       'depositBonusEnabled',
//       'depositBonusPercent',
//       'depositBonusMax',
//       'depositBonusMinDeposit',
//       'cashbackEnabled',
//       'cashbackPercent',
//       'cashbackMax',
//       'cashbackMinTurnover',
//       // মাসিক
//       'topRankerEnabled',
//       'topRankerCount',
//       'rank1Prize',
//       'rank2Prize',
//       'rank3Prize',
//       'rank4to10Prize',
//     ];

//     const updateData = {};
//     for (const field of allowedFields) {
//       if (body[field] !== undefined) {
//         updateData[field] = body[field];
//       }
//     }

//     let settings = await BonusSetting.findOne({});

//     if (!settings) {
//       settings = await BonusSetting.create(updateData);
//     } else {
//       settings = await BonusSetting.findByIdAndUpdate(
//         settings._id,
//         { $set: updateData },
//         { new: true }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: '✅ বোনাস সেটিংস সফলভাবে আপডেট হয়েছে!',
//       settings
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Bonus Settings PATCH Error:', error);
//     return NextResponse.json(
//       { success: false, message: 'সার্ভার এরর: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// ///////////////////////////////////////////////////
import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import BonusSetting from '@/models/BonusSetting';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// ✅ GET — বোনাস সেটিংস পাওয়া
// ==========================================
export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    let settings = await BonusSetting.findOne({});

    // যদি কোনো সেটিংস না থাকে — ডিফল্ট তৈরি করি
    if (!settings) {
      settings = await BonusSetting.create({});
    }

    return NextResponse.json({
      success: true,
      settings
    }, { status: 200 });

  } catch (error) {
    console.error('Bonus Settings GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// ✅ PATCH — বোনাস সেটিংস আপডেট (Atomic Upsert)
// ==========================================
export async function PATCH(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json();

    // ✅ কোন কোন ফিল্ড আপডেট করা যাবে
    // ✅ এখন সবগুলো আলাদা rank ফিল্ড যোগ করা হলো
    const allowedFields = [
      // সাপ্তাহিক
      'weeklyBonusEnabled',
      'depositBonusEnabled',
      'depositBonusPercent',
      'depositBonusMax',
      'depositBonusMinDeposit',
      'cashbackEnabled',
      'cashbackPercent',
      'cashbackMax',
      'cashbackMinTurnover',
      // মাসিক
      'topRankerEnabled',
      'topRankerCount',
      // ✅ ১১টি আলাদা rank ফিল্ড
      'rank1Prize',
      'rank2Prize',
      'rank3Prize',
      'rank4Prize',
      'rank5Prize',
      'rank6Prize',
      'rank7Prize',
      'rank8Prize',
      'rank9Prize',
      'rank10Prize',
      'rank11PlusPrize',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // ✅ Atomic upsert — Race Condition মুক্ত
    // - এক query-তে ডকুমেন্ট তৈরি বা আপডেট
    // - upsert: true → না থাকলে তৈরি হবে
    // - setDefaultsOnInsert: true → ডিফল্ট মান বসবে
    const settings = await BonusSetting.findOneAndUpdate(
      {},                              // যেকোনো একটি ডকুমেন্ট
      { $set: updateData },
      {
        new: true,                     // আপডেটেড ডকুমেন্ট ফেরত
        upsert: true,                  // না থাকলে তৈরি হবে
        setDefaultsOnInsert: true,     // ডিফল্ট মান বসবে
      }
    );

    return NextResponse.json({
      success: true,
      message: '✅ বোনাস সেটিংস সফলভাবে আপডেট হয়েছে!',
      settings
    }, { status: 200 });

  } catch (error) {
    console.error('Bonus Settings PATCH Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}