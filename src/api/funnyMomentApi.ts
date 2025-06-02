export const fetchFunnyMoments = async (twitchId: string): Promise<number[]> => {
    const url = 'http://localhost:8083/clickityclack.co.uk/content/funny-moments/' + twitchId + '.json';
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch funny moments: ${response.status}`);
    }

    const funnyMoments: number[] = await response.json();
    return funnyMoments.sort((a, b) => a - b);
};
