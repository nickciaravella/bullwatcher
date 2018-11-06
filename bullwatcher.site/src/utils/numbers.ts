export const ONE_THOUSAND = 1000;
export const ONE_MILLION = ONE_THOUSAND * ONE_THOUSAND;
export const ONE_BILLION = ONE_MILLION * ONE_THOUSAND;

export function percentageString(value: number): string {
    return `${numberWithCommas(Math.round(value * 100) / 100)}%`;
}

export function currencyString(value: number): string {
    const formatter = Intl.NumberFormat(
        'en-us',
        {
            currency: 'USD',
            minimumFractionDigits: 2,
            style: 'currency',
        });
    return formatter.format(value);
}

export function numberWithIllions(value: number): string {
    let newVal: number = value;
    let suffix: string = '';
    if (value > 1000000000000) {
        newVal = value / 1000000000000;
        suffix = 'trillion'
    } else if (value > 1000000000) {
        newVal = value / 1000000000;
        suffix = 'billion';
    } else if (value > 1000000) {
        newVal = value / 1000000;
        suffix = 'million';
    }

    if (newVal >= 100) {
        newVal = Math.round(newVal);
    } else if (newVal >= 10) {
        newVal = Math.round(newVal * 10) / 10;
    } else {
        newVal = Math.round(newVal * 100) / 100;
    }

    return `${numberWithCommas(newVal)} ${suffix}`.trimRight();
}

export function numberWithCommas(value: number): string {
    return new Intl.NumberFormat('en-us').format(value);
}