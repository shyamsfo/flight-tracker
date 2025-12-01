// Mock flight data
const mockFlights = [
  {
    id: 1,
    flightNumber: 'AA123',
    airline: 'American Airlines',
    departureTime: '2025-11-19T08:00:00',
    arrivalTime: '2025-11-19T11:30:00',
    departureLocation: 'New York (JFK)',
    arrivalLocation: 'Los Angeles (LAX)',
    departureTimezone: 'EST (UTC-5)',
    arrivalTimezone: 'PST (UTC-8)',
    status: 'On Time'
  },
  {
    id: 2,
    flightNumber: 'UA456',
    airline: 'United Airlines',
    departureTime: '2025-11-19T14:00:00',
    arrivalTime: '2025-11-19T17:45:00',
    departureLocation: 'Chicago (ORD)',
    arrivalLocation: 'Miami (MIA)',
    departureTimezone: 'CST (UTC-6)',
    arrivalTimezone: 'EST (UTC-5)',
    status: 'Delayed'
  },
  {
    id: 3,
    flightNumber: 'DL789',
    airline: 'Delta Airlines',
    departureTime: '2025-11-19T09:30:00',
    arrivalTime: '2025-11-19T12:15:00',
    departureLocation: 'Atlanta (ATL)',
    arrivalLocation: 'Seattle (SEA)',
    departureTimezone: 'EST (UTC-5)',
    arrivalTimezone: 'PST (UTC-8)',
    status: 'On Time'
  },
  {
    id: 4,
    flightNumber: 'SW202',
    airline: 'Southwest Airlines',
    departureTime: '2025-11-19T16:00:00',
    arrivalTime: '2025-11-19T18:30:00',
    departureLocation: 'Dallas (DFW)',
    arrivalLocation: 'Denver (DEN)',
    departureTimezone: 'CST (UTC-6)',
    arrivalTimezone: 'MST (UTC-7)',
    status: 'On Time'
  },
  {
    id: 5,
    flightNumber: 'BA101',
    airline: 'British Airways',
    departureTime: '2025-11-19T20:00:00',
    arrivalTime: '2025-11-20T08:30:00',
    departureLocation: 'London (LHR)',
    arrivalLocation: 'New York (JFK)',
    departureTimezone: 'GMT (UTC+0)',
    arrivalTimezone: 'EST (UTC-5)',
    status: 'On Time'
  }
];

/**
 * Mock API function to search for flights by flight number
 * @param {string} flightNumber - The flight number to search for
 * @returns {Promise<Array>} - Promise that resolves to array of matching flights
 */
export const searchFlights = async (flightNumber) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!flightNumber || flightNumber.trim() === '') {
    return [];
  }

  // Search for flights that match the flight number (case-insensitive, partial match)
  const searchTerm = flightNumber.trim().toLowerCase();
  const results = mockFlights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchTerm)
  );

  return results;
};

/**
 * Get all available flights
 * @returns {Promise<Array>} - Promise that resolves to all flights
 */
export const getAllFlights = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockFlights;
};
