let lastId = -1;
/** Unique id */
export function uid() {
    return (++lastId).toString(36);
}

/** Use this instead of JSON.parse, removes key-value pairs with key \_\_proto__. */
// https://stackoverflow.com/questions/63926663/how-should-untrusted-json-be-sanitized-before-using-json-parse
export function safeParseJSON(string: string) {
	return JSON.parse(string, (key, value) => key === "__proto__" ? undefined : value);
}