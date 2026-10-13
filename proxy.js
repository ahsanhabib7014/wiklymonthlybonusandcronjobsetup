// import { NextResponse } from 'next/server';

// // ইন-মেমোরি রেট লিমিট স্টোরেজ
// const rateLimitMap = new Map();

// // Timer ছাড়া মেমোরি পরিষ্কার করার ফাংশন
// function cleanupRateLimit() {
//   try {
//     const now = Date.now();
//     for (const [ip, data] of rateLimitMap.entries()) {
//       if (now > data.resetTime) {
//         rateLimitMap.delete(ip);
//       }
//     }
//   } catch (e) {}
// }

// export function proxy(req) {
//   try {
//     // --- ১. রেট লিমিট লজিক ---
//     try {
//       const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
//               || req.headers.get('x-real-ip')
//               || '127.0.0.1';

//       const now = Date.now();
//       const windowMs = 60 * 1000;
//       const maxRequests = 60;

//       if (rateLimitMap.size > 500) {
//         cleanupRateLimit();
//       }

//       if (!rateLimitMap.has(ip)) {
//         rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
//       } else {
//         const userInfo = rateLimitMap.get(ip);
//         if (now > userInfo.resetTime) {
//           userInfo.count = 1;
//           userInfo.resetTime = now + windowMs;
//         } else {
//           userInfo.count++;
//           if (userInfo.count > maxRequests) {
//             return new NextResponse(
//               JSON.stringify({ success: false, message: 'Too many requests, please try again later.' }),
//               { status: 429, headers: { 'Content-Type': 'application/json' } }
//             );
//           }
//         }
//       }
//     } catch (rateLimitErr) {
//       // রেট লিমিটে সমস্যা হলে কোড চলবে
//     }
//     // ------------------------------------------------------------

//     const { pathname } = req.nextUrl;

//     // ২. পাবলিক API পাথ (লগইন ছাড়াই অ্যাক্সেসযোগ্য)
//     const publicApiPaths = [
//       '/api/auth/login',
//       '/api/auth/register',
//       '/api/auth/reset-password',
//       "/api/admin/seed"
      
//     ];
//     const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

//     // ৩. ✅ সম্পূর্ণ protected routes list (lgame, deposit, withdraw সহ)
//     const protectedRoutes = [
//       '/profile',
//       '/wallet',
//       '/game',
//       '/gameroom',
//       '/referral',
//       '/admin',
//       '/api',
//       '/deposit',         // ✅ যোগ
//       '/withdraw'         // ✅ যোগ
//     ];
//     const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

//     // ৪. সিকিউরিটি চেক — শুধু HttpOnly token cookie
//     if (isProtectedRoute && !isPublicApi) {
//       const token = req.cookies.get('token')?.value;

//       if (!token) {
//         // API request → JSON response
//         if (pathname.startsWith('/api')) {
//           return NextResponse.json(
//             { success: false, message: 'অনুমোদিত নয়! সিকিউর কুকি বা সেশন পাওয়া যায়নি।' },
//             { status: 401, headers: { 'Content-Type': 'application/json' } }
//           );
//         }

//         // Page request → login-এ redirect
//         const loginUrl = new URL('/login', req.url);
//         return NextResponse.redirect(loginUrl);
//       }
//     }

//     // ৫. সব ঠিক থাকলে সিকিউরিটি হেডার সহ পাস
//     const response = NextResponse.next();

//     response.headers.set('X-Content-Type-Options', 'nosniff');
//     response.headers.set('X-Frame-Options', 'DENY');
//     response.headers.set('X-XSS-Protection', '1; mode=block');
//     response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//     response.headers.set('Pragma', 'no-cache');
//     response.headers.set('Expires', '0');

//     return response;

//   } catch (error) {
//     return NextResponse.next();
//   }
// }

// // ✅ সম্পূর্ণ matcher — lgame, deposit, withdraw সহ
// export const config = {
//   matcher: [
//     '/profile/:path*',
//     '/wallet/:path*',
//     '/game/:path*',
//     '/gameroom/:path*',
//     '/referral/:path*',
//     '/api/:path*',
//     '/admin/:path*',
//     '/deposit/:path*',      // ✅ যোগ
//     '/withdraw/:path*'      // ✅ যোগ
//   ],
// };

// ////////////////////////////////////////////////////////////////////////////

import { NextResponse } from 'next/server';

// ==========================================
// Rate Limit (in-memory — dev/small scale only)
// ==========================================
const rateLimitMap = new Map();

function cleanupRateLimit() {
  try {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  } catch (e) {}
}

export function proxy(req) {
  try {
    // --- ১. Rate Limit ---
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              || req.headers.get('x-real-ip')
              || '127.0.0.1';

      const now = Date.now();
      const windowMs = 60 * 1000;
      const maxRequests = 60;

      if (rateLimitMap.size > 500) {
        cleanupRateLimit();
      }

      if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        const userInfo = rateLimitMap.get(ip);
        if (now > userInfo.resetTime) {
          userInfo.count = 1;
          userInfo.resetTime = now + windowMs;
        } else {
          userInfo.count++;
          if (userInfo.count > maxRequests) {
            return new NextResponse(
              JSON.stringify({ success: false, message: 'Too many requests, please try again later.' }),
              { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    } catch (rateLimitErr) {
      // ignore
    }

    const { pathname } = req.nextUrl;

    // ==========================================
    // ২. Public API paths (login ছাড়াই access)
    // ==========================================
    const publicApiPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/reset-password',
      '/api/auth/logout',
      // ✅ '/api/admin/seed' সরানো হয়েছে — security risk
    ];
    const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

    // ==========================================
    // ৩. Public Pages (login ছাড়াই access)
    // ==========================================
    const publicPages = [
      '/login',
      '/register',
      '/reset-password',
      '/admin/login',         // ✅ admin login exempt
      '/admin/register',      // ✅ যদি থাকে
    ];
    const isPublicPage = publicPages.some((path) => 
      pathname === path || pathname.startsWith(path + '/')
    );

    // ==========================================
    // ৪. Protected routes
    // ==========================================
    const protectedRoutes = [
      '/profile',
      '/wallet',
      '/game',
      '/gameroom',
      '/referral',
      '/admin',
      '/api',
      '/deposit',
      '/withdraw'
    ];
    const isProtectedRoute = protectedRoutes.some((route) => 
      pathname === route || pathname.startsWith(route + '/')
    );

    // ==========================================
    // ৫. Security check
    // ==========================================
    if (isProtectedRoute && !isPublicApi && !isPublicPage) {
      const token = req.cookies.get('token')?.value;

      if (!token) {
        // API request → JSON
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { success: false, message: 'অনুমোদিত নয়! সিকিউর কুকি বা সেশন পাওয়া যায়নি।' },
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Page request → login
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // ==========================================
    // ৬. Security headers
    // ==========================================
    const response = NextResponse.next();

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('[Proxy Error]:', error);
    return NextResponse.next();
  }
}

// ==========================================
// Config — সম্পূর্ণ matcher
// ==========================================
export const config = {
  matcher: [
    '/profile',
    '/profile/:path*',
    '/wallet',
    '/wallet/:path*',
    '/game',
    '/game/:path*',
    '/gameroom',
    '/gameroom/:path*',
    '/referral',
    '/referral/:path*',
    '/api',
    '/api/:path*',
    '/admin',
    '/admin/:path*',
    '/deposit',
    '/deposit/:path*',
    '/withdraw',
    '/withdraw/:path*'
  ],
};