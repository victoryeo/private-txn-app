// Copyright © 2024 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { expect } = require('chai');
const { join } = require('path');
const { wasm: wasm_tester } = require('circom_tester');
const { genKeypair, genEcdhSharedKey, formatPrivKeyForBabyJub, stringifyBigInts } = require('maci-crypto');

describe('Ecdh circuit tests', () => {
  let circuit;
  let senderPrivKey, senderPubKey, receiverPrivKey, receiverPubKey;
  before(async function () {
    this.timeout(60000);

    circuit = await wasm_tester(join(__dirname, '../circuits/ecdh.circom'));

    let keypair = genKeypair();
    senderPrivKey = keypair.privKey;
    senderPubKey = keypair.pubKey;

    keypair = genKeypair();
    receiverPrivKey = keypair.privKey;
    receiverPubKey = keypair.pubKey;
  });

  it('should generate the shared secret in the proof circuit, which can be reproduced by the receiver', async () => {
    const circuitInputs = stringifyBigInts({
      privKey: formatPrivKeyForBabyJub(senderPrivKey),
      pubKey: receiverPubKey,
    });
    const witness = await circuit.calculateWitness(circuitInputs);

    const sharedSecret = [witness[1], witness[2]];
    // we now reproduce the shared secret using the receiver's private key and the sender's public key
    const recoveredKey = genEcdhSharedKey(receiverPrivKey, senderPubKey);
    // assert that the shared secret generated by the circuit is the same as the one recovered
    expect(sharedSecret).to.deep.equal(recoveredKey);
  });
});
