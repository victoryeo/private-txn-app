import { useState, useEffect } from "react";
import { parseEther, formatEther, PrivateKeyAccount } from "viem";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi } from "@/config/erc20Abi";
import { zetoAnonAbi } from "@/config/zetoAnonAbi";
import axios from "axios";
import { useReadContract } from 'wagmi'
import { privateKeyToAccount } from 'viem/accounts'

// the address is deployed from forge create
//const erc20Address = "0x7fbEB60f7275E99d115F9f409816C403bFf656Aa";
// the erc20 and zeto contract are deployed from script in https://github.com/hyperledger-labs/zeto.git
const erc20Address = "0x81075516bc67af29421bB85c2FD1cC0917AF27d7";
const zetoTokenAddress = "0xBf44A392daECE0576D9c0d2CCC3e2e9a6C603a47";

export const Transfer = () => {
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [acctbalance, setAcctbalance] = useState("0");
    const { data: hash1, error: error1, isPending: isPending1, writeContract: writeContractApprove} = useWriteContract();
    const { data: hash2, error: error2, isPending: isPending2, writeContract: writeContractDeposit } = useWriteContract();
    const { data: hash3, error: error3, writeContract: writeContractMint } = useWriteContract();
    let myAccount: PrivateKeyAccount;

    //useEffect(()=> {
        myAccount = privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`)
        console.log('account', myAccount.address)
    //}, [])

    const useGetBalance = ()=> {
        const {refetch, data} =  useReadContract({
            address: erc20Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [myAccount.address]
        })
        console.log('balance', data)
        return {refetch, data};
    } 

    const {refetch:refetchBalance, data} = useGetBalance();

    const handleBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handlebalance', amount, recipient)
        refetchBalance?.()
        console.log('balance', data)
        let balance2 = data as string
        console.log('balance', balance2)
        let balance3 = formatEther(data as bigint)
        console.log('balance', balance3)
        setAcctbalance(balance3)
    }

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleMint', amount, recipient)
        writeContractMint({
            address: erc20Address,
            abi: erc20Abi,
            functionName: "mint",
            args: [myAccount.address, amount.toString()],
        });
    }

    const handleApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleApprove', amount, recipient)
        //const amountInWei = parseEther(amount);
        //console.log("amountInWei", amountInWei.toString());

        // Step1: Get approval
        writeContractApprove({
            address: erc20Address,
            abi: erc20Abi,
            functionName: "approve",
            args: [zetoTokenAddress, amount.toString()],
        });
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleDeposit', amount, recipient)
        //const amountInWei = parseEther(amount);
        //console.log("amountInWei", amountInWei.toString());

        // Call api to generate the proof
        const response = await axios.post(
        "http://localhost:3001/api/generate-proof",
        { amount }
        );
        const { outputCommitments, encodedProof } = await response.data;
        console.log('result',{ outputCommitments, encodedProof });

        // Step2: Deposit
        writeContractDeposit({
            address: zetoTokenAddress,
            abi: zetoAnonAbi,
            functionName: "deposit",
            args: [amount, outputCommitments[0], encodedProof],
        });
    }

    const { isLoading: isConfirming1, isSuccess: isConfirmed1 } =
        useWaitForTransactionReceipt({
            hash1,
        })

    const { isLoading: isConfirming2, isSuccess: isConfirmed2 } =
        useWaitForTransactionReceipt({
            hash2,
        })

    return (
        <>
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
            <div className="mb-3 text-2xl font-semibold">
                <label htmlFor="recipient">Recipient:</label>
                <input
                type="text"
                name="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                />
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div className="mb-3 text-2xl font-semibold">
                <label htmlFor="amount">Amount: (in wei)</label>
                <input
                type="text"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                />
            </div>
            <div></div>
            <form onSubmit={handleBalance}>
                <button  type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Balance</button>
                {error3 && (
                    <div>Error: {(error3 as BaseError).shortMessage || error3.message}</div>
                )}
                <div>
                ERC20 token balance is : {acctbalance}</div>
            </form> 
            <form onSubmit={handleMint}>
                <button  type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Mint</button>
                {error3 && (
                    <div>Error: {(error3 as BaseError).shortMessage || error3.message}</div>
                )}
            </form> 
            <form onSubmit={handleApprove}>
                <button disabled={isPending1} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Approve</button>

                {isConfirming1 && <div>Waiting for confirmation...</div>}
                {isConfirmed1 && <div>Transaction confirmed.</div>}
                {error1 && (
                    <div>Error: {(error1 as BaseError).shortMessage || error1.message}</div>
                )}
            </form>
            <form onSubmit={handleDeposit}>
                <button disabled={isPending2} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deposit</button>

                {isConfirming2 && <div>Waiting for confirmation...</div>}
                {isConfirmed2 && <div>Transaction confirmed.</div>}
                {error2 && (
                    <div>Error: {(error2 as BaseError).shortMessage || error2.message}</div>
                )}
            </form>
        </div>
        </>
    )
}