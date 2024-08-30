declare module 'zeto-js' {
    export function loadCircuit(type: any): any;
    export function newSalt(): any;
    export function tokenUriHash(tokenUri: string|undefined): any
    export function encodeProof(proofJson: any): any

    export type arrayType = {
        number: ele[];
    }
    export type anyN = {
        arrayType: pA;
        arrayType: pB[];
        arrayType: pC;
    }
}