export const getThemeFromRequest = (request) => {
    const cookie = request.headers.get("Cookie");
    const match = cookie?.match(/theme=(dark|light)/);
    return match ? match[1] : "light"; // Default to light if no cookie found
};
