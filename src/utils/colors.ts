import { hashCode } from "./hash";

const chatNameColors = [
    'rgb(0, 231, 0)',
    'rgb(0, 255, 127)',
    'rgb(10, 255, 0)',
    'rgb(53, 155, 255)',
    'rgb(53, 163, 205)',
    'rgb(61, 185, 116)',
    'rgb(80, 255, 255)',
    'rgb(95, 158, 160)',
    'rgb(106, 147, 206)',
    'rgb(120, 120, 255)',
    'rgb(124, 124, 213)',
    'rgb(124, 124, 225)',
    'rgb(138, 138, 138)',
    'rgb(154, 205, 50)',
    'rgb(170, 100, 234)',
    'rgb(173, 108, 221)',
    'rgb(179, 105, 239)',
    'rgb(208, 88, 128)',
    'rgb(218, 165, 32)',
    'rgb(224, 91, 91)',
    'rgb(225, 118, 42)',
    'rgb(241, 92, 92)',
    'rgb(242, 49, 255)',
    'rgb(244, 154, 255)',
    'rgb(245, 71, 137)',
    'rgb(247, 168, 184)',
    'rgb(253, 135, 33)',
    'rgb(255, 105, 180)',
    'rgb(255, 107, 159)',
    'rgb(255, 120, 187)',
    'rgb(255, 127, 80)',
    'rgb(255, 157, 238)',
    'rgb(255, 255, 255)',
    'rgb(255, 49, 233)',
    'rgb(255, 70, 142)',
    'rgb(255, 88, 26)',
    'rgb(255, 88, 88)',
]

export const getColor = (commenterName: string): string => {
    let colorHash = Math.abs(hashCode(commenterName));
    return chatNameColors[colorHash % chatNameColors.length];
};
