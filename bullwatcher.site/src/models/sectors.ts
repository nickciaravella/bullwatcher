import { TimeWindow } from "src/models/common";

export interface ISector {
    id: string;
    sectorName: string;
}

export interface ISectorPerformance {
    id: string;
    sectorName: string;
    timeWindow: TimeWindow;
    percentChange: number;
}