// app/api/admin/settings/auto-crypto/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

// ==========================================
// ✅ Helper: Admin verify
// ==========================================
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') return null;

    return decoded;
  } catch (err) {
    return null;
  }
}

// ==========================================
// ✅ GET: Auto Crypto status (public — user-ও access করবে)
// ==========================================
export async function GET() {
  try {
    await dbConnect();

    const setting = await Setting.findOne({ key: 'autoCryptoEnabled' });

    return NextResponse.json({
      success: true,
      enabled: setting ? setting.value === true : true, // ✅ default ON
    });
  } catch (err) {
    console.error('Auto crypto status error:', err);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর', enabled: true },
      { status: 500 }
    );
  }
}

// ==========================================
// ✅ POST: Auto Crypto ON/OFF (admin only)
// ==========================================
export async function POST(req) {
  try {
    // ✅ Admin verify
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'অনুমোদিত নয়!' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'enabled (true/false) দিতে হবে!' },
        { status: 400 }
      );
    }

    // ✅ Upsert
    const setting = await Setting.findOneAndUpdate(
      { key: 'autoCryptoEnabled' },
      { value: enabled },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      enabled: setting.value,
      message: enabled
        ? '✅ Auto Crypto চালু করা হয়েছে!'
        : '🔴 Auto Crypto বন্ধ করা হয়েছে!',
    });
  } catch (err) {
    console.error('Auto crypto update error:', err);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}