import { INews } from "src/models/news";


export class Iex {
    private baseUrl = 'https://api.iextrading.com/1.0'

    public getNews(ticker: string): Promise<INews[]> {
        const url: string = this.baseUrl + `/stock/${ticker}/news`;
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                return json.map((value: any) => { return {
                    date: new Date(value.datetime),
                    headline: value.headline,
                    source: value.source,
                    url: value.url,
                }}).sort((a: INews, b: INews) => b.date.getTime() - a.date.getTime());
            });
    }
}