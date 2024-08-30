declare module 'zeto-js' {
    export function loadCircuit(type: any): any;
    export function newSalt(): any;
    export function tokenUriHash(tokenUri: string|undefined): any
    export function encodeProof(proofJson: any): any
}