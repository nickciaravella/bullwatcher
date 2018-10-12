import { observable } from 'mobx';

import { IStockDailyHistory } from 'src/models/stock-history';
import { AlphaVantage } from 'src/services/alphavantage';
import { BullWatcher } from 'src/services/bullwatcher';

export class StockHistoryStore {
    @observable public stockDailyHistory: IStockDailyHistory;

    private alphavantage = new AlphaVantage();
    private bullwatcher = new BullWatcher();
    private cache = {}

    public async fetchDailyDataAsync(ticker: string): Promise<void> {
        this.stockDailyHistory = null;

        if (ticker in this.cache) {
            this.stockDailyHistory = this.cache[ticker];
            return;
        }

        let history: IStockDailyHistory = null;
        if (ticker.startsWith('^')) {
            // Indicies are not available through IEX, only AlphaVantage
            history = await this.alphavantage.getStockDaily(ticker)
        }
        else {
            history = await this.bullwatcher.getStockDailyHistory(ticker);
        }

        if (history !== null) {
            this.cache[ticker] = history;
            this.stockDailyHistory = history;
        }
    }
}
