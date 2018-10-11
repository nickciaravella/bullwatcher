import { IStockCurrentPrice } from 'src/models/stock-current'
import { BullWatcher } from 'src/services/bullwatcher';

export class StockCurrentPriceStore {
    private bullwatcher = new BullWatcher()
    private cache: any = {}
    private lastUpdatedTime: any = {}

    public async getStockCurrentPrice(ticker: string): Promise<IStockCurrentPrice> {
        if (ticker in this.cache) {
            const timeSinceUpdate: number = Date.now() - this.lastUpdatedTime[ticker];
            console.log(timeSinceUpdate)
            if (timeSinceUpdate < 5 * 60 * 1000) { // 5 minutes
                return this.cache[ticker] as IStockCurrentPrice;
            }
        }

        const price: IStockCurrentPrice = await this.bullwatcher.getStockCurrentPrice(ticker);
        this.cache[ticker] = price;
        this.lastUpdatedTime[ticker] = Date.now()
        return price;
    }
}