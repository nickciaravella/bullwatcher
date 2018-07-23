from datetime import datetime, timedelta


def next_market_day():
    '''
    Returns the Date of the next day the market will be open. This is not
    sophisticated and does not take into account holidays, only weekends.
    If the market is still open, then it will return today. To avoid daylight
    saving time, 8:30-5:30 Eastern is considered open.
    '''
    utc_now = datetime.utcnow()
    market_open = datetime(utc_now.year, utc_now.month, utc_now.day,
                           12, 30, 0, 0)
    market_close = datetime(utc_now.year, utc_now.month, utc_now.day,
                            21, 30, 0, 0)

    days_to_add = 0
    if utc_now.weekday() == 5: # Saturday
        days_to_add = 2
    elif utc_now.weekday() == 6: # Sunday
        days_to_add = 1
    elif utc_now <= market_close:
        days_to_add = 0
    else:
        if utc_now.weekday() == 4: # Friday
            days_to_add = 3
        else:
            days_to_add = 1

    return (utc_now + timedelta(days=days_to_add)).date()


def previous_market_day():
    '''
    Returns the Date of the previous day the market was  open. This is not
    sophisticated and does not take into account holidays, only weekends.
    If the market is still open, then it will return yesterday. To avoid daylight
    saving time, 8:30-5:30 Eastern is considered open.
    '''
    utc_now = datetime.utcnow()
    market_open = datetime(utc_now.year, utc_now.month, utc_now.day,
                           12, 30, 0, 0)
    market_close = datetime(utc_now.year, utc_now.month, utc_now.day,
                            21, 30, 0, 0)

    days_to_add = 0
    if utc_now.weekday() == 5: # Saturday
        days_to_add = -1
    elif utc_now.weekday() == 6: # Sunday
        days_to_add = -2
    elif utc_now <= market_close:
        if utc_now.weekday() == 0: # Monday
            days_to_add = -3
        else:
            days_to_add = -1
    else:
        days_to_add = 0

    return (utc_now + timedelta(days=days_to_add)).date()
