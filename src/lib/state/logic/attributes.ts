import type { LogicData } from "./index.svelte";
import { attributeOptions, type AttributeData, type AttributeRecord, type DownAttributeOption, type UpAttributeOption } from "./options";

export interface DownAttribute extends DownAttributeOption {
    name: string;
}
export interface UpAttribute extends UpAttributeOption {
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

for (const name in attributeOptions) {
    const attr = { ...attributeOptions[name], name };
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
    parentAttrData: AttributeData,
    index: number,
    parent: LogicData
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