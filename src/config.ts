export interface IConfig {
    headerHeight: number;
    activeColorSelector: string;
    activeButtonColor: string;
    magnifier: {
        maxZoomFactor: number;
        minZoomFactor: number;
        defaultZoomFactor: number;
        size: number;
        gridSize: number;
        colorBoxSelector: string;
        gridColor: string;
        centralGridColor: string;
    }
}

export const defaultConfig: IConfig = {
    headerHeight: 50,
    activeColorSelector: '#currentColor',
    activeButtonColor: '#0D6EFD',
    magnifier: {
        maxZoomFactor: 5,
        minZoomFactor: 1,
        defaultZoomFactor: 2,
        size: 100,
        gridSize: 9,
        colorBoxSelector: '#colorContainer',
        gridColor: '#808080',
        centralGridColor: '#fff',
    },
}
