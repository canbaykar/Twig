let lastId = -1;
/** Unique id */
export function uid() {
    return (++lastId).toString(36);
}

/** requestAnimationFrame as promise */
export const rafPromise = async () => new Promise((res) => requestAnimationFrame(res));