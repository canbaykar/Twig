import type { LogicState } from "./index.svelte";
import { attributeData, type AttributeState, type AttributeRecord, type DownAttributeData, type UpAttributeData } from "./data";

export interface DownAttribute extends DownAttributeData {
    name: string;
}
export interface UpAttribute extends UpAttributeData {
    name: string;
}

const attributes = {
    down: {
        record: {} as Record<string, DownAttribute>,
        array: [] as DownAttribute[],
    },
    up: {
        record: {} as Record<string, UpAttribute>,
        array: [] as UpAttribute[],
    },
};
export default attributes;

for (const name in attributeData) {
    const attr = { ...attributeData[name], name };
    const upOrDown = attr.type ? attributes.up : attributes.down;
    upOrDown.record[name] = attr;
    upOrDown.array.push(attr as any);
}

// Default propogators
export function defaultDownPropogateAttrs(childAttrs: AttributeRecord[]) {
    const out: AttributeRecord = {};
    for (const attr of attributes.down.array) {
        out[attr.name] = attr.default(childAttrs)
    }
    return out;
}
export function defaultUpPropogateAttrs(
    parentAttrData: AttributeState,
    index: number,
    parent: LogicState
): AttributeRecord {
    const out: AttributeRecord = {};
    for (const attr of attributes.up.array) {
        out[attr.name] = attr.default(parentAttrData, index, parent);
    }
    return out;
}
/** Up-propogation defaults when there's no parent */
export function defaultRootUpPropogateAttrs(): AttributeRecord {
    const out: AttributeRecord = {};
    for (const attr of attributes.up.array) {
        out[attr.name] = attr.defaultRoot();
    }
    return out;
}