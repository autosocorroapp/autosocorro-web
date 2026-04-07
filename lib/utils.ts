export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function calculateDisplacement(distanceKm: number) {
  const raw = distanceKm * 3;

  if (raw < 10) return 10;
  if (raw > 40) return 40;

  return Math.round(raw);
}

export function calculateClosedPrice(basePrice: number, distanceKm: number) {
  return basePrice + calculateDisplacement(distanceKm);
}

export function calculateFuelPrice(
  liters: number,
  fuelPricePerLiter: number,
  distanceKm: number,
  serviceFee = 20
) {
  return liters * fuelPricePerLiter + calculateDisplacement(distanceKm) + serviceFee;
}

export function calculateTowPrice(distanceKm: number, activationFee = 100, pricePerKm = 6) {
  return activationFee + distanceKm * pricePerKm;
}
