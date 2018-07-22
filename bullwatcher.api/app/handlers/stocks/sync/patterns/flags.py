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
    return has_spike(dailies[:5], 5) and not has_spike(dailies[5:], 1)


def has_spike(dailies, percentage):
    '''
    Returns True if there is any difference of the percentage amount from
    one StockDaily.low and another StockDaily.high
    '''
    current_high = dailies[0].high
    current_low = dailies[0].low
    for daily in dailies:
        if is_larger_percent_difference(current_low, daily.high, percentage) or \
           is_larger_percent_difference(current_high, daily.low, percentage) or \
           is_larger_percent_difference(daily.high, daily.low, percentage):
            return True
        current_high = max(current_high, daily.high)
        current_low = min(current_low, daily.low)
    return False


def is_larger_percent_difference(one, two, percent):
    return abs(one-two)/one > (percent / 100)
