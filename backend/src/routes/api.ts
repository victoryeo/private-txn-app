import { Router, Request, Response } from "express";
import { ethers, BigNumberish } from "ethers";
import { newUser, newUTXO, User, UTXO } from "../libs/utils";
import { prepareDepositProof } from "../utils";
import 'dotenv/config'

const router = Router();

// Example API route
router.post("/generate-proof", async (req: Request, res: Response) => {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT
  );
  const privateKey = process.env.PRIVATE_KEY!;
  console.log(process.env.RPC_ENDPOINT)
  console.log(privateKey)
  console.log(req.body.amount)
  const signer = new ethers.Wallet(privateKey, provider);
  const sender = await newUser(signer);

  const utxo = newUTXO(req.body.amount, sender);

  const result = await prepareDepositProof(sender, utxo);

  const jsonString = JSON.stringify(result, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

  console.log("jsonString", jsonString);

  res.setHeader("Content-Type", "application/json");
  res.send(jsonString);
});

export default router;
