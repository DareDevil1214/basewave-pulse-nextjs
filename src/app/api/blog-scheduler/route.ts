import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define the interface for blog schedule data
interface BlogSchedule {
  id: string;
  portal: string;
  title: string;
  keywords: string[];
  scheduledFor: any;
  status: string;
  createdAt: any;
  [key: string]: any; // Allow for additional properties
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching all blog schedules...');
    
    const portal = request.nextUrl.searchParams.get('portal');
    
    let schedulesQuery;
    if (portal) {
      schedulesQuery = query(
        collection(db, 'blogSchedules'),
        where('portal', '==', portal),
        orderBy('createdAt', 'desc')
      );
    } else {
      schedulesQuery = query(
        collection(db, 'blogSchedules'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(schedulesQuery);
    
    if (querySnapshot.empty) {
      console.log('❌ No blog schedules found');
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    const schedules: BlogSchedule[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      schedules.push({
        id: doc.id,
        ...data
      } as BlogSchedule);
    });
    
    console.log(`✅ Fetched ${schedules.length} blog schedules`);
    
    return NextResponse.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching blog schedules:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blog schedules',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
