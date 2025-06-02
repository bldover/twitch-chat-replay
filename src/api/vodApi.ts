import { VodSummary } from '../types';

export const fetchVodSummaries = async (): Promise<VodSummary[]> => {
    const response = await fetch('/content/vod-summaries.json');

    if (!response.ok) {
        throw new Error(`Failed to fetch vod summaries: ${response.status}`);
    }

    const summaries = await response.json();
    return summaries;
};
