export function getStr(name: string) {
	return `${/^[aeiou]$/gi.test(name.trim().charAt(0)) ? "an" : "a"} ${name}`;
}
