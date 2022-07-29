import { CosmWasmSigner } from "@confio/relayer";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin } from "@cosmjs/stargate";

export interface AccountInfo {
  channel_id: string;
  last_update_time: string; // nanoseconds as string
  remote_addr?: string;
  remote_balance: Coin[];
}

export interface AccountResponse {
  last_update_time: string; // nanoseconds as string
  remote_addr?: string;
  remote_balance: Coin[];
}

export async function listAccounts(cosmwasm: CosmWasmSigner, controllerAddr: string): Promise<AccountInfo[]> {
  const query = { list_accounts: {} };
  const res = await cosmwasm.sign.queryContractSmart(controllerAddr, query);
  return res.accounts;
}

export async function showAccount(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string
): Promise<AccountResponse> {
  const query = { account: { channel_id: channelId } };
  const res = await cosmwasm.sign.queryContractSmart(controllerAddr, query);
  return res;
}

export async function fundRemoteAccount(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string,
  ics20Channel: string,
  funds: Coin
): Promise<ExecuteResult> {
  const msg = { send_funds: { reflect_channel_id: channelId, transfer_channel_id: ics20Channel } };
  const res = await cosmwasm.sign.execute(cosmwasm.senderAddress, controllerAddr, msg, "auto", undefined, [funds]);
  return res;
}

export async function checkRemoteBalance(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string
): Promise<ExecuteResult> {
  const msg = { check_remote_balance: { channel_id: channelId } };
  const res = await cosmwasm.sign.execute(cosmwasm.senderAddress, controllerAddr, msg, "auto");
  return res;
}

export function remoteBankSend(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string,
  to_address: string,
  amount: Coin[]
): Promise<ExecuteResult> {
  const msgs = [
    {
      bank: {
        send: { to_address, amount },
      },
    },
  ];
  return remoteCall(cosmwasm, controllerAddr, channelId, msgs);
}

export function remoteBankMultiSend(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string,
  content: {
    to_address: string;
    amount: Coin[];
  }[]
): Promise<ExecuteResult> {
  const msgs = content.map(({ to_address, amount }) => ({
    bank: {
      send: { to_address, amount },
    },
  }));
  return remoteCall(cosmwasm, controllerAddr, channelId, msgs);
}

export async function remoteCall(
  cosmwasm: CosmWasmSigner,
  controllerAddr: string,
  channelId: string,
  msgs: unknown[]
): Promise<ExecuteResult> {
  const msg = {
    send_msgs: {
      channel_id: channelId,
      msgs,
    },
  };
  const res = await cosmwasm.sign.execute(cosmwasm.senderAddress, controllerAddr, msg, "auto");
  return res;
}
