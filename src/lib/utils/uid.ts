let lastId = -1;

export function uid() {
    return (++lastId).toString(36);
}