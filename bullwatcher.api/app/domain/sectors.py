from app.domain.common import TimeWindow


class SectorId:
    TECHNOLOGY = "Technology"
    CONSUMER_DISCRETIONARY = "ConsumerDiscretionary"
    FINANCIALS = "Financials"
    INDUSTRIALS = "Industrials"
    MATERIALS = "Materials"
    HEALTH_CARE = "HealthCare"
    UTILITIES = "Utilities"
    ENERGY = "Energy"
    CONSUMER_STAPLES = "ConsumerStaples"
    TELECOMMUNICATION_SERVICES = "TelecommunicationServices"
    REAL_ESTATE = "RealEstate"


class SectorPerformance:

    def __init__(self,
                 id: SectorId,
                 time_window: TimeWindow,
                 name: str,
                 percent_change: float):
        self.id: str = id
        self.time_window: TimeWindow = time_window
        self.name: str = name
        self.percent_change: float = percent_change


    def to_json(self):
        return {
            'id': self.id,
            'time_window': self.time_window,
            'name': self.name,
            'percent_change': self.percent_change
        }
