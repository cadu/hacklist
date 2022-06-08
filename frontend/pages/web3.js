import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import Footer from "../components/Footer";
import ConnectWeb3 from "../components/ConnectWeb3";

export default function Web3() {
  const walletConnected = false;
  
  // console.log(provider);

  return (
    <div>
      <ConnectWeb3 />
      <Head>
        <title>Hackalist</title>
        <meta name="description" content="Hacklist - The whitelist for your Hackathon" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to HackShare Whitelist, the best whitelist for your Hackathon!</h1>
          {
            walletConnected && 
            <div className={styles.description}>
              <p>{numberOfWhitelisted} hacker has already joined the Whitelist.</p>
              <p>We still have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> spots available. Hurry up!</p>
            </div> }
          {
            // renderButton()
          }
          
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <Footer/>
    </div>
  );
}