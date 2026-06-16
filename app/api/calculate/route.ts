import { NextRequest, NextResponse } from 'next/server';
import { calculateRetirementOptionsDB } from '@/lib/calculator-db';
import db, { initializeDatabase } from '@/lib/db';

// Initialize DB on startup
try {
  initializeDatabase();
} catch (e) {
  // DB already initialized
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      status,
      dogumTarihi,
      cinsiyet,
      ilkGirisTarihi,
      priGunu,
      borçlanmaOption,
      borçlanmaGunu,
      askerlikGunu,
      askerlikNedir,
      malulukTuru,
      derece,
      malulTarihi,
    } = body;

    // Parse dates
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('.').map(Number);
      return new Date(year, month - 1, day);
    };

    const dogum = parseDate(dogumTarihi);
    const ilkGiris = parseDate(ilkGirisTarihi);
    const malulTarih = malulTarihi ? parseDate(malulTarihi) : null;

    // Calculate
    const results = calculateRetirementOptionsDB({
      status,
      dogumTarihi: dogum,
      cinsiyet,
      ilkGirisTarihi: ilkGiris,
      priGunu: parseInt(priGunu) || 0,
      borçlanmaOption,
      borçlanmaGunu: parseInt(borçlanmaGunu) || 0,
      askerlikGunu: parseInt(askerlikGunu) || 0,
      askerlikNedir,
      malulukTuru,
      derece: derece || null,
      malulTarihi: malulTarih,
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Hesaplama başarısız' },
      { status: 400 }
    );
  }
}
