export function getCookies(): { [key: string]: string } {
  return document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    return { ...acc, [key]: decodeURIComponent(value) };
  }, {});
}

export function getCookie(key: string): string | undefined {
  return getCookies()[key];
}
