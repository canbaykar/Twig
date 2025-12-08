let lastId = -1;
/** Unique id */
export function uid() {
    return (++lastId).toString(36);
}