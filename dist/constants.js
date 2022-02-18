export function getStr(name) {
    return `${/^[aeiou]$/gi.test(name.trim().charAt(0)) ? "an" : "a"} ${name}`;
}
