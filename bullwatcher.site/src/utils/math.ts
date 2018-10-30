export function calculatePercentChange(current: number, base: number): number {
    return (current - base) / base * 100;
}

export function roundToTwoPlaces(value: number): number {
    return Math.round(value*100) / 100.0;
}