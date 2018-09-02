import { TimeWindow } from "src/models/common";

export interface ISectorPerformance {
    id: string;
    sectorName: string;
    timeWindow: TimeWindow;
    percentChange: number;
}