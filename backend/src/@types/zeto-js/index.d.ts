declare module 'zeto-js' {
    export function loadCircuit(type: any): any;
    export function newSalt(): any;
    export function tokenUriHash(tokenUri: string|undefined): any
    export function encodeProof(proofJson: any): ProofType

    export type arrayType = {
        number: ele[];
    }
    export type ProofType = {
        arrayType: pA;
        arrayType: pB[];
        arrayType: pC;
    }
}