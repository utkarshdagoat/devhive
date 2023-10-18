"use client";

import { useState } from "react";
import {
  SismoConnectButton,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-react";

import './app.css';
import {
  CONFIG,
  AUTHS,
  CLAIMS,
  SIGNATURE_REQUEST,
  AuthType,
  ClaimType,
} from "./sismo-connect-config";
// import { ModeToggle } from "@/components/modeToggle";

export default function Home() {
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] =
    useState<SismoConnectVerifiedResult>();
  const [sismoConnectResponse, setSismoConnectResponse] = useState<SismoConnectResponse>();
  const [pageState, setPageState] = useState<string>("init");
  const [error, setError] = useState<string>("");

  return (
    <>
      <main className="main p-16 shadow-lg">
        <h1 className="text-8xl text-green-500 tracking-tight font-extrabold">DevHive</h1>
        <p className="text-xl py-5">A Web3 Job portal for developers, by developers.</p>
        {pageState == "init" ? (
          <>
            <SismoConnectButton
              config={CONFIG}
              auths={AUTHS}
              claims={CLAIMS}
              signature={SIGNATURE_REQUEST}
              text="Prove With Sismo"
              onResponse={async (response: SismoConnectResponse) => {
                setSismoConnectResponse(response);
                setPageState("verifying");
                const verifiedResult = await fetch("/api/verify", {
                  method: "POST",
                  body: JSON.stringify(response),
                });
                const data = await verifiedResult.json();
                if (verifiedResult.ok) {
                  setSismoConnectVerifiedResult(data);
                  console.log(data);
                  setPageState("verified");
                } else {
                  setPageState("error");
                  setError(data);
                }
              }}
            />
          </>
        ) : (
          <>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
            >
              {" "}
              RESET{" "}
            </button>
            <br></br>
            <div className="status-wrapper">
              {pageState == "verifying" ? (
                <span className="verifying"> Verifying ZK Proofs... </span>
              ) : (
                <>
                  {Boolean(error) ? (
                    <span className="error"> Error verifying ZK Proofs: {error} </span>
                  ) : (
                    <span className="verified"> ZK Proofs verified!</span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function readibleHex(userId: string, startLength = 6, endLength = 4, separator = "...") {
  if (!userId.startsWith("0x")) {
    return userId;
  }
  return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}

function getProofDataForAuth(
  sismoConnectResponse: SismoConnectResponse,
  authType: AuthType
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.auths) {
      for (const auth of proof.auths) {
        if (auth.authType === authType) {
          return proof.proofData;
        }
      }
    }
  }

  return null;
}

function getProofDataForClaim(
  sismoConnectResponse: SismoConnectResponse,
  claimType: number,
  groupId: string,
  value: number
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.claims) {
      for (const claim of proof.claims) {
        if (claim.claimType === claimType && claim.groupId === groupId && claim.value === value) {
          return proof.proofData;
        }
      }
    }
  }

  return null;
}
