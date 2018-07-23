def pick_tickers(dailies_dict):
    '''
    Given a dictionary of ticker => StockDaily objects, this returns a list of tickers that are considered to
    be flags.
    In: Dict<string, domain.StockDaily>
    Out: List<string>
    '''
    return [ ticker for ticker, dailies in dailies_dict.items() if is_flag(dailies) ]


def is_flag(dailies):
    '''
    Given a list of dailies, returns True if it is a flag pattern and False if it is not. Here are the requirements
    of a flag.
    1. Must have a minimum of 8 days sample. If more than 10 days are provided, only 10 will be used.
    2. There must be a change greater than 5 percent in the price from the first 5 days.
    3. The remaining days must have a change of less than 1 percent.

    In the future, these should be configurable:
        a) Number of days, percentage change, and direction for (2)
        b) Number of days and percentage change for (3)
    '''
    if len(dailies) < 8:
        return False
    if any([not daily.high or not daily.low for daily in dailies]):
        return False

    for still_days in range(4, 8):
        is_flag = not has_spike(dailies[:still_days], 1.75) and has_spike(dailies[still_days:10], 5.25)
        if is_flag:
            return True
    return False


def has_spike(dailies, percentage):
    '''
    Returns True if there is any difference of the percentage amount from
    one StockDaily.low and another StockDaily.high
    '''
    current_high = max(dailies[0].open, dailies[0].close)
    current_low = min(dailies[0].open, dailies[0].close)
    for daily in dailies:
        if is_larger_percent_difference(current_low, max(daily.open, daily.close), percentage) or \
           is_larger_percent_difference(current_high, min(daily.open, daily.close), percentage) or \
           is_larger_percent_difference(daily.high, daily.low, percentage):
            return True
        current_high = max(current_high, max(daily.open, daily.close))
        current_low = min(current_low, min(daily.open, daily.close))
    return False


def is_larger_percent_difference(one, two, percent):
    return abs(one-two)/one > (percent / 100)
