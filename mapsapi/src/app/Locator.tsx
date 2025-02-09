'use client';

import { useEffect, useState } from "react";

export default function Location() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [doctors, setDoctors] = useState<{ place_id: string; name: string }[]>([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    return (
        <div>
            {location ? (
                <>
                    <p className="text-lg">
                        Latitude: {location.lat}, Longitude: {location.lng}
                    </p>
                    <button
                        onClick={() => {
                            getDoctors(location.lat, location.lng, "psychologist").then((doctors) => {
                                setDoctors(doctors);
                                console.log(doctors);
                            });
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Find Dentists
                    </button>
                    <ul>
                        {doctors.map((doctor) => (
                            <li key={doctor.place_id}>{doctor.name}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>Loading location...</p>
            )}
        </div>
    );
}

async function getDoctors(latitude: number, longitude: number, doctorType: string): Promise<{ place_id: string; name: string }[]> {
    const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, doctorType }),
    });
    
    const data = await response.json();
    return data.results;
}

// Example Usage
// getDoctors(31.255, 75.703, "dentist").then(doctors => console.log(doctors));
