export const getQueryParam = (key: string): string | null => {
    const resultPair: string[] = window.location.search
        .slice(1)
        .split('&').map((pair) => pair.split('='))
        .filter((pair) => pair[0] === key)[0]
    if (resultPair) {
        return resultPair[1] || null
    }
    return null
}

export const setQueryParam = (key: string, value: string): void => {
    const formattedParam = key + '=' + value
    console.log(window.location.search)
    const newQueryString = window.location.search
        ? window.location.search.split('&').concat(formattedParam).join('&')
        : '?' + formattedParam
    window.history.replaceState({}, '', newQueryString)
}
