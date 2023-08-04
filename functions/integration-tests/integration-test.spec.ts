import axios from "axios";
import { expect } from "chai";
import { getApp, initializeApp } from "firebase/app";
import { Functions, connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

describe("greet-the-world", () => {
  let functions: Functions;

  before(() => {
    initializeApp({ projectId: 'demo-test' });
    functions = getFunctions(getApp());
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  })

  it("should respond with the configured greeting", async () => {
    const expected = "Hello World from greet-the-world";

    const httpFunctionUri = "http://localhost:5001/demo-test/us-central1/ext-greet-the-world-greetTheWorld/";
    const res = await axios.get(httpFunctionUri);

    expect(res.data).to.eql(expected);
  }).timeout(10000);

  it("should respond with a message to sign", async () => {
    const data = {
      "address": "addr1q8ezcmwg9auy30vdfgpk5tmxsurv5jv8me50h9nz390we8w7e28nn969w0auevwz6dylkf8hg8l8knwpj6flp53g0naqga9k8f",
      "networkType": "cardano",
      "network": "testnet",
      "wallet": 'Eternl'
    }

    const response = await httpsCallable<any, any>(functions, 'ext-greet-the-world-requestMessage')(data);
    expect(response.data.id.length).to.equal(32);
    expect(response.data.profileId.length).to.equal(58);
  }).timeout(10000);
});
