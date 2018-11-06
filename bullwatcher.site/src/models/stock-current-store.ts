import { observable, ObservableMap } from 'mobx';

import { IStockCurrentPrice } from 'src/models/stock-current'
import { BullWatcher } from 'src/services/bullwatcher';

export class StockCurrentPriceStore {
    @observable public currentPriceByTicker: ObservableMap = new ObservableMap<string, IStockCurrentPrice>();

    private bullwatcher = new BullWatcher();
    private lastUpdatedTime: any = {}

    public async getStockCurrentPrice(ticker: string): Promise<IStockCurrentPrice> {
        if (this.currentPriceByTicker.has(ticker)) {
            const timeSinceUpdate: number = Date.now() - this.lastUpdatedTime[ticker];
            console.log(timeSinceUpdate)
            if (timeSinceUpdate < 5 * 60 * 1000) { // 5 minutes
                return this.currentPriceByTicker.get(ticker);
            }
        }

        const price: IStockCurrentPrice = await this.bullwatcher.getStockCurrentPrice(ticker);
        this.currentPriceByTicker.set(ticker, price);
        this.lastUpdatedTime[ticker] = Date.now()
        return price;
    }
}