from typing import Dict, Optional

import datetime

from app.data_access import bullwatcherdb
from app.handlers.stocks import patterns_handler, rankings_handler, stocks_sync
from app.domain.common import SyncJob
from app.utils import date_utils


def sync() -> Dict[str, any]:
    sync_status: Dict[SyncJob, datetime.datetime] = bullwatcherdb.get_sync_statuses()
    sync_date: datetime.date = date_utils.previous_market_day()

    sync_job: Optional[str] = None
    is_complete: bool = False
    if not has_been_synced(sync_status=sync_status,
                           sync_job=SyncJob.STOCK_SYNC,
                           sync_date=sync_date):
        sync_job = SyncJob.STOCK_SYNC
        is_complete = stocks_sync.sync(count=100, sync_date=sync_date)

    elif not has_been_synced(sync_status=sync_status,
                             sync_job=SyncJob.PATTERNS_SYNC,
                             sync_date=sync_date):
        sync_job = SyncJob.PATTERNS_SYNC
        is_complete = patterns_handler.sync_patterns(sync_date=sync_date)

    elif not has_been_synced(sync_status=sync_status,
                             sync_job=SyncJob.RANKINGS_SYNC,
                             sync_date=sync_date):
        sync_job = SyncJob.RANKINGS_SYNC
        is_complete = rankings_handler.sync_rankings(sync_date=sync_date)

    if sync_job and is_complete:
        bullwatcherdb.set_sync_job_synced_until(sync_job=sync_job,
                                                synced_until=datetime.datetime.combine(sync_date, datetime.datetime.min.time()))

    return {
        'sync_job': sync_job if sync_job else 'All',
        'is_complete': is_complete if sync_job else True
    }


def has_been_synced(sync_status: Dict[SyncJob, datetime.datetime],
                    sync_job: SyncJob,
                    sync_date: datetime.date) -> bool:
    if sync_job not in sync_status:
        return False
    return sync_status[sync_job].date() >= sync_date