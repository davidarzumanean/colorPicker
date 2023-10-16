export const getContrastTextColor = (backgroundColor: string): "#000" | "#fff" => {
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000" : "#fff";
}

export const getColorFromPixelData = (pixelData: Uint8ClampedArray): string => {
    return "#" + ((1 << 24) | (pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16).slice(1);
}

export const getMagnifierImageYPos = (mouseY: number, magnifierHalfSize: number, zoom: number): number => {
    const headerHeight = 50;
    const scrollY = window.scrollY;
    const headerScrollDelta = headerHeight - scrollY;

    if (mouseY - headerHeight + scrollY <= magnifierHalfSize && scrollY <= headerHeight) {
        return -(mouseY - headerScrollDelta - magnifierHalfSize) / zoom;
    }
    return 0;
}
