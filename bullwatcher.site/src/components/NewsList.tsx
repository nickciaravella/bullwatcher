import * as React from 'react';
import * as styles from 'src/styles';

import { INews } from 'src/models/news';
import { BullWatcher } from 'src/services/bullwatcher';

interface INewsListProps {
    ticker?: string;
}

interface INewsListState {
    news: INews[];
}

export default class NewsList extends React.Component<INewsListProps, INewsListState> {
    private bullwatcher: BullWatcher = new BullWatcher()

    constructor(props: INewsListProps) {
        super(props);

        this.state = {
            news: []
        }

        this.loadNews();
    }

    public render() {
        const {news} = this.state;
        if (!news || news.length === 0) {
            return null;
        }

        return (
            <div>
                <h1 className={styles.pb3}>News</h1>
                { this.renderListItems() }
            </div>
        )
    }

    private renderListItems() {
        return this.state.news.map((article: INews) =>
            (
                <div className={styles.classNames(styles.flexContainer, styles.flexRow, styles.flexAlignItemsStart, styles.pb4)}>
                        <div className={styles.flexAlignSelfCenter}>
                            <img src={article.thumbnailUrl} height="120" width="240" style={{objectFit: "cover"}}/>
                        </div>
                        <div className={styles.classNames(styles.flexContainer, styles.flexColumn, styles.pl4)}>
                            <span className={styles.textSize125} >
                                <a className={styles.noStyle} href={article.newsUrl} target="_blank">{article.headline}</a>
                            </span>
                            <span className={styles.classNames(styles.textColorSecondary, styles.textSize0875)}>{article.source}, {article.publishedDate.toLocaleString()}</span>
                            <span className={styles.pt3}>{article.description}</span>
                        </div>
                </div>
            )
        );
    }

    private async loadNews() {
        const { ticker } = this.props;
        const news: INews[] = await this.bullwatcher.getNews(ticker);
        this.setState({
            news
        });
    }
}