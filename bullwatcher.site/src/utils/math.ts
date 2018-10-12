export function calculatePercentChange(current: number, base: number): number {
    return (current - base) / base * 100;
}