// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   uid: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   balance: { type: Number, default: 0 },
//   turnover: { type: Number, default: 0 },
//   isBlocked: { type: Boolean, default: false },
//   ipAddress: { type: String, default: '' },
//   pin: { type: String, required: true },
//   role: { type: String, default: 'user' },

//   // 🔐 Login brute-force protection
//   loginAttempts: { type: Number, default: 0 },
//   loginLockedUntil: { type: Date, default: null },
//   loginAttempts: { type: Number, default: 0 },
//   loginLockedUntil: { type: Date, default: null },

//   // 🎁 রেফারেল সিস্টেম
//   referralBalance: { type: Number, default: 0 },
//   referralCode: { type: String, unique: true, sparse: true },
//   referredBy: { type: String, default: null },
//   customCommission: { type: Number, default: null },
// }, { timestamps: true });

// // Next.js ক্যাশ সমস্যা এড়াতে মডেল মুছে নতুন করে কম্পাইল
// if (mongoose.models.User) {
//   delete mongoose.models.User;
// }

// export default mongoose.model('User', UserSchema);


// ////////////////////////////////////////////////////////////

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  turnover: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  ipAddress: { type: String, default: '' },
  pin: { type: String, required: true },
  role: { type: String, default: 'user' },

  // 🔐 Login brute-force protection
  loginAttempts: { type: Number, default: 0 },
  loginLockedUntil: { type: Date, default: null },

  // 🎁 রেফারেল সিস্টেম
  referralBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  customCommission: { type: Number, default: null },

  // ==========================================
  // ✅ বোনাস ট্র্যাকিং — সাপ্তাহিক
  // ==========================================
  weeklyTurnover: { type: Number, default: 0 },      // এই সপ্তাহের টার্নওভার
  weeklyLost: { type: Number, default: 0 },          // এই সপ্তাহের লস
  weeklyDeposit: { type: Number, default: 0 },       // এই সপ্তাহের ডিপোজিট

  // ==========================================
  // ✅ বোনাস ট্র্যাকিং — মাসিক
  // ==========================================
  monthlyTurnover: { type: Number, default: 0 },     // এই মাসের টার্নওভার
  monthlyLost: { type: Number, default: 0 },         // এই মাসের লস
  monthlyCashbackReceived: { type: Number, default: 0 }, // এই মাসে পাওয়া ক্যাশব্যাক (টপ র্যাংকারের জন্য)

  // ==========================================
  // ✅ সব সময়ের ট্র্যাকিং
  // ==========================================
  totalLost: { type: Number, default: 0 },           // সব সময়ের মোট লস

  // ==========================================
  // ✅ শেষ বোনাস কবে পেয়েছে
  // ==========================================
  lastWeeklyBonusAt: { type: Date, default: null },
  lastMonthlyBonusAt: { type: Date, default: null },

  // ==========================================
  // ✅ বোনাস হিস্ট্রি
  // ==========================================
  weeklyBonusHistory: [{
    amount: { type: Number, default: 0 },
    type: { type: String, enum: ['deposit', 'cashback'], default: 'deposit' },
    week: { type: String },
    givenAt: { type: Date, default: Date.now }
  }],

  monthlyBonusHistory: [{
    amount: { type: Number, default: 0 },
    type: { type: String, enum: ['top_ranker'], default: 'top_ranker' },
    month: { type: String },
    rank: { type: Number, default: 0 },
    givenAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

// Next.js ক্যাশ সমস্যা এড়াতে মডেল মুছে নতুন করে কম্পাইল
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);