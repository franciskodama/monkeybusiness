import { processRadarAlerts } from '@/lib/actions/radar';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple security check (should be matched in Vercel Cron settings)
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const result = await processRadarAlerts();

  if (result.success) {
    return NextResponse.json({ 
      message: 'Radar alerts processed successfully',
      processed: result.processed,
      sent: result.sent
    });
  } else {
    return NextResponse.json({ message: 'Error processing radar alerts' }, { status: 500 });
  }
}
