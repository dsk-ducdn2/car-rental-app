export async function fetchMockUsers() {
  const res = await fetch('/mock-data/users.json');
  return res.json();
}

export async function fetchMockVehicles() {
  const res = await fetch('/mock-data/vehicles.json');
  return res.json();
}

export async function fetchMockBookings() {
  const res = await fetch('/mock-data/bookings.json');
  return res.json();
}

export async function fetchMockStats() {
  const res = await fetch('/mock-data/stats.json');
  return res.json();
} 