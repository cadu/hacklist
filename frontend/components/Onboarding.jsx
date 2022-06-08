import {useState, useEffect} from 'react';
import Button from "./Button";

export default function Onboarding({justJoinedWhitelist, joinedWhitelist, loading, showingConfetti, setShowingConfetti, walletConnected, maxWhitelisted, numberOfWhitelisted, connectWallet, addAddressToWhitelist}) 
{
    
  
  if (!joinedWhitelist && numberOfWhitelisted < maxWhitelisted) {
    return (
      <div className="description">
      { numberOfWhitelisted == 0 &&
        <p className="py-4">You're <span className="italic">The One</span>! Nobody has joined the Whitelist yet.</p>
      }
      { numberOfWhitelisted > 0 && numberOfWhitelisted < 4 &&
        <p className="py-4">You're an OG! Only {numberOfWhitelisted} {numberOfWhitelisted > 1 ? 'hackers' : 'hacker'} have joined the Whitelist.</p>
      }
      { numberOfWhitelisted > 3 &&
        <p className="py-4">{numberOfWhitelisted} hackers have joined the Whitelist.</p>
      }
        <p>We have <strong>{maxWhitelisted - numberOfWhitelisted}</strong> spots available. Hurry up!</p>
        <Button onClick={addAddressToWhitelist}>Apply now</Button>
      </div>
    );
  }
  
  if (loading) {
    return <button className="button">Loading...</button>;
  }

}