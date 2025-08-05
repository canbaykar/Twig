let lastId = -1;

export function uid() {
    return (++lastId).toString(36);
}

/** 
 * Some invalid uid value. 
 * Useful with element.closest when assigning uids to elements
 * to set a search limit.
 */
// Right now uid can't have uppercase letters
uid.null = "NULL";