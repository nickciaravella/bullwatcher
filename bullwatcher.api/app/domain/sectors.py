from typing import Any, Dict
from app.domain.common import TimeWindow


class SectorId:
    CONSUMER_DISCRETIONARY = "ConsumerDiscretionary"
    CONSUMER_STAPLES = "ConsumerStaples"
    ENERGY = "Energy"
    FINANCIALS = "Financials"
    HEALTH_CARE = "HealthCare"
    INDUSTRIALS = "Industrials"
    MATERIALS = "Materials"
    REAL_ESTATE = "RealEstate"
    TECHNOLOGY = "Technology"
    TELECOMMUNICATION_SERVICES = "TelecommunicationServices"
    UNKNOWN = "Unknown"
    UTILITIES = "Utilities"


_SECTOR_ID_TO_NAME_MAP: Dict[str, str] = {
    SectorId.CONSUMER_DISCRETIONARY: "Consumer Discretionary",
    SectorId.CONSUMER_STAPLES: "Consumer Staples",
    SectorId.ENERGY: "Energy",
    SectorId.FINANCIALS: "Financials",
    SectorId.HEALTH_CARE: "Health Care",
    SectorId.INDUSTRIALS: "Industrials",
    SectorId.MATERIALS: "Materials",
    SectorId.REAL_ESTATE: "Real Estate",
    SectorId.TECHNOLOGY: "Technology",
    SectorId.TELECOMMUNICATION_SERVICES: "Telecommunication Services",
    SectorId.UNKNOWN: "Unknown",
    SectorId.UTILITIES: "Utilities",
}


class Sector:

    def __init__(self, id: str) -> None:
        self.id: str = id
        self.name: str = self.get_name_for_id(self.id)

    def get_name_for_id(self, sector_id: str) -> str:
        return (_SECTOR_ID_TO_NAME_MAP[sector_id]
                if sector_id in _SECTOR_ID_TO_NAME_MAP
                else _SECTOR_ID_TO_NAME_MAP[SectorId.UNKNOWN])

    @staticmethod
    def from_json(self, json: Dict[str, Any]) -> 'Sector':
        return Sector(id=json['id'])

    def to_json(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name
        }


class SectorPerformance:

    def __init__(self,
                 id: str,
                 time_window: TimeWindow,
                 percent_change: float) -> None:
        self.sector: Sector = Sector(id=id)
        self.time_window: TimeWindow = time_window
        self.percent_change: float = percent_change

    def to_json(self) -> Dict[str, Any]:
        return {
            'id': self.sector.id,
            'time_window': self.time_window,
            'name': self.sector.name,
            'percent_change': self.percent_change
        }
