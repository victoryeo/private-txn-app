import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { erc20Abi } from "@/config/erc20Abi";
import { zetoAnonAbi } from "@/config/zetoAnonAbi";

const erc20Address = "0x4a669e1267f6da8b51e21bc3c402a8614ae7cd1a";
const zetoTokenAddress = "0x26366dd4C51b84490e01233A491Af142a6Ab96Ba";

export const Transfer = () => {
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const { data: hash, writeContract } = useWriteContract();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit', amount, recipient)
        const amountInWei = parseEther(amount);
        console.log("amountInWei", amountInWei.toString());

        // Step1: Get approval
        writeContract({
            address: erc20Address,
            abi: erc20Abi,
            functionName: "approve",
            args: [zetoTokenAddress, amountInWei.toString()],
        });

        // Step2: Deposit
        writeContract({
            address: zetoTokenAddress,
            abi: zetoAnonAbi,
            functionName: "deposit",
            args: [amount, 0, 0],
        });
    }

    return (
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <form onSubmit={handleSubmit}>
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
            <div className="mb-3 text-2xl font-semibold">
                <label htmlFor="amount">Amount:</label>
                <input
                type="text"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                />
            </div>
            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
        </form>
        </div>
    )
}