export const getQueryParam = (key: string): string | undefined => {
    const resultPair: string[] = window.location.search
        .slice(1)
        .split('&').map((pair) => pair.split('='))
        .filter((pair) => pair[0] === key)[0]
    if (resultPair) {
        return resultPair[1]
    }
    return undefined
}

export const setQueryParam = (key: string, value: string | null): void => {
    const url = new URL(window.location.href);

    if (value === null) {
        url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }

    console.log(`updated query params: ${url}`);
    window.history.replaceState({}, '', url.search.toString());
}
