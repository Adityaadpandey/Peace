'use client';
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";

export default function FitnessPage() {
  const { user } = useUser();
  const [fitnessData, setFitnessData] = useState<{
    data: {
      [key: number]: {
        steps?: number,
        distance?: number,
        calories?: number,
        heartRate?: number,
        activity?: number,
        sleep?: number
      }
    }
  } | {data:{}}>({ data: {} });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFitnessData() {
      try {
        const response = await fetch('/api/fit');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);

        setFitnessData(data);
      } catch (e: any) {
        setError(e.message);
      }
    }

    if (user) {
      fetchFitnessData();
    }
  }, [user]);

  if (error) return <div>Error loading fitness data: {error}</div>;
  if (!user) return <div>Please sign in to view your fitness data</div>;
  if (!fitnessData) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Step Count History</h1>
      <div className="grid grid-cols-8 w-full p-4 border-black border-2 text-center overflow-auto">
        <div className="border p-4 rounded font-semibold min-w-fit">Date</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Step Count</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Distance</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Calories Expended</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Heart Rate</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Activity</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Sleep</div>
        <div className="border p-4 rounded font-semibold min-w-fit">Blood Glucose</div>

        {
          Object.entries(fitnessData.data).map(([key, day]: [string, any], index) => {
            // console.log(day);
            
            return (<React.Fragment key={index}>
              <div className="border p-4 rounded">{new Date(Number(key)).toLocaleDateString()}</div>
                <div className="border p-4 rounded">{Math.round(day.steps || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.distance || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.calories || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.heartRate || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.activity || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.sleep || 0)}</div>
                <div className="border p-4 rounded">{Math.round(day.bloodGlucose || 0)}</div>
            </React.Fragment>)
          })
        }
      </div>
    </div>
  );
}