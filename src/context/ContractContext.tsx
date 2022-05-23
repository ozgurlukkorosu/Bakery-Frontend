import React, { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONFIG } from '../config'
import contract from './SugarPretzels.json'
import { useWeb3 } from "./Web3Context";


interface IContractContext {
    contractRead: ethers.Contract | undefined,
    contractGaselessWrite: ethers.Contract | undefined,
    contractStandardWrite: ethers.Contract | undefined,
    mintGaseless: () => void,
    mintSugarPretzel: () => void
}

const ContractContext = createContext<IContractContext>({} as IContractContext);

const ContractProvider = ({ children }: { children: React.ReactNode }) => {
    const [contractGaselessWrite, setContractGaselessWrite] = useState<ethers.Contract>()
    const [contractStandardWrite, setContractStandardWrite] = useState<ethers.Contract>()
    const [contractRead, setContractRead] = useState<ethers.Contract>()
    const [txHash, setTxHash] = useState<String>()
    const [blockNumber, setBlockNumber] = useState<Number>()
    const [errorMessage, setErrorMessage] = useState<String>()

    const { provider, gaselessSigner, standardSigner } = useWeb3()

    const mintGaseless = async () => {
        console.log(contractGaselessWrite);
        if (contractGaselessWrite === undefined) return

        try {
            const txPending = await contractGaselessWrite?.mintWithoutGas()
            console.log(txPending.hash);
            setTxHash(txPending.hash)

            const txMined = await txPending.wait()
            console.log(txMined.blockNumber);
            setBlockNumber(txMined.blockNumber)
        } catch (error: any) {

            if (error?.code === -32603) {
                const errorMessage = error.data.message.split(': ')[1]
                console.log(errorMessage);
                setErrorMessage(errorMessage)
            }


        }
        return
    }

    const mintSugarPretzel = async () => {
        console.log(contractStandardWrite);
        if (contractStandardWrite === undefined) return

        try {
            const txPending = await contractStandardWrite?.mint()
            console.log(txPending.hash);
            setTxHash(txPending.hash)

            const txMined = await txPending.wait()
            console.log(txMined.blockNumber);
            setBlockNumber(txMined.blockNumber)
        } catch (error: any) {

            if (error?.code === -32603) {
                const errorMessage = error.data.message.split(': ')[1]
                console.log(errorMessage);
                setErrorMessage(errorMessage)
            }


        }
        return
    }


    useEffect(() => {
        if (provider === undefined) return
        setContractRead(new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            contract.abi,
            provider
        ))
        console.log('provider set');

        if (standardSigner === undefined) return
        setContractStandardWrite(new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            contract.abi,
            standardSigner
        ))
        console.log('standardSigner set');

        if (gaselessSigner === undefined) return
        setContractStandardWrite(new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            contract.abi,
            gaselessSigner
        ))
        console.log('gaselessSigner set');
    }, [provider, standardSigner, gaselessSigner])


    return (
        <ContractContext.Provider value={{
            contractRead,
            contractGaselessWrite,
            contractStandardWrite,
            mintGaseless,
            mintSugarPretzel
        }}>
            {children}
        </ContractContext.Provider>
    )

}




const useContract = () => React.useContext(ContractContext)

export { ContractProvider, useContract }