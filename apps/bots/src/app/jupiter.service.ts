import { Injectable } from "@nestjs/common";
import { Jupiter } from "@jup-ag/core";
import { Connection, PublicKey } from "@solana/web3.js";

@Injectable()
export class JupiterService {
  #solanaRpcUrl = "https://solana-api.projectserum.com";

  async fetchSwapPrice(
    inputTokenMintAddress: string,
    outputTokenMintAddress: string,
    options: { inputDecimals: number; outputDecimals: number } = {
      inputDecimals: 6,
      outputDecimals: 6
    }
  ) {
    const connection = new Connection(this.#solanaRpcUrl);

    const jupiter = await Jupiter.load({
      connection,
      cluster: "mainnet-beta"
    });

    const { routesInfos } = await jupiter.computeRoutes({
      inputMint: new PublicKey(inputTokenMintAddress),
      outputMint: new PublicKey(outputTokenMintAddress),
      inputAmount: 1 * 10 ** options.inputDecimals,
      slippage: 0.1
    });

    if (routesInfos?.[0]?.outAmount) {
      const currentPrice =
        routesInfos[0].outAmount / 10 ** options.outputDecimals;

      return currentPrice;
    }
  }
}
