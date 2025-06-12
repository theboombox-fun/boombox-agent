export interface AnalyzerResponse {
    results: {
        label: string;
        probability: number;
    }[];
    caption: string;
}