import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking for schedules that need to be executed...');
    
    // Get current time
    const now = new Date();
    
    // Query for active schedules with nextRunTime in the past
    const schedulesRef = collection(db, 'blogSchedules');
    const q = query(
      schedulesRef,
      where('isActive', '==', true),
      where('nextRunTime', '<=', now.toISOString())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('✅ No schedules need to be executed at this time');
      return NextResponse.json({
        success: true,
        message: 'No schedules need to be executed',
        schedulesToExecute: 0
      });
    }
    
    console.log(`🚀 Found ${querySnapshot.size} schedules to execute`);
    
    const executionPromises = [];
    const scheduleIds = [];
    
    // Execute each schedule
    querySnapshot.forEach((docSnap) => {
      const scheduleId = docSnap.id;
      const schedule = docSnap.data();
      
      scheduleIds.push(scheduleId);
      
      // Call our own API route to execute the schedule
      const executionPromise = fetch(`/api/blog-scheduler/${scheduleId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to execute schedule ${scheduleId}: ${errorText}`);
        }
        
        // No need to update the schedule here as the execute endpoint does it
        return { scheduleId, success: true };
      }).catch((error) => {
        console.error(`Error executing schedule ${scheduleId}:`, error);
        return { scheduleId, success: false, error: error.message };
      });
      
      executionPromises.push(executionPromise);
    });
    
    // Wait for all executions to complete
    const results = await Promise.all(executionPromises);
    
    return NextResponse.json({
      success: true,
      message: `Executed ${results.length} schedules`,
      data: {
        scheduleIds,
        results
      }
    });
  } catch (error) {
    console.error('Error checking schedules:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check schedules',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Run this endpoint every minute
export const dynamic = 'force-dynamic';
export const revalidate = 0;
