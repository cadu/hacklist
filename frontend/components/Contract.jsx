import React from 'react'
import { HACKLIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Contract() {
  const hackListContract = new Contract(
        HACKLIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
  return hackListContract;
}
