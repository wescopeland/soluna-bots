import { Injectable, Logger } from "@nestjs/common";
import { Client as DiscordClient, Intents } from "discord.js";
import * as numbro from "numbro";

import { JupiterService } from "./jupiter.service";
import { TerraDevService } from "./terra-dev.service";

const slnaAddress = "SLNAAQ8VT6DRDc3W9UPDjFyRt7u4mzh8Z4WYMDjJc35";
const stablecoinAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Creates an interval, but also executes the given function
 * immediately. This is useful for running the bot functions
 * right when they start up instead of waiting for the timer
 * to kick in.
 */
function setIntervalImmediately(func, interval) {
  func();
  return setInterval(func, interval);
}

@Injectable()
export class DiscordBotManagerService {
  #logger = new Logger(DiscordBotManagerService.name);

  constructor(
    private readonly jupiterService: JupiterService,
    private readonly terraDevService: TerraDevService
  ) {}

  async initializeAllBots() {
    this.initializeTvlBot();
    this.initializeSlnaPriceBot();
  }

  private async initializeSlnaPriceBot() {
    this.#logger.log("Initializing Discord bot for SLNA price.");

    const discordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    try {
      // When the client is ready, immediately fetch the SLNA price.
      discordClient.once("ready", () => {
        setIntervalImmediately(async () => {
          this.#logger.log("Cycling SLNA price bot.");

          const currentPriceResponse = await this.jupiterService.fetchSwapPrice(
            slnaAddress,
            stablecoinAddress
          );

          // Set the bot's nickname and presence for all servers.
          discordClient.guilds.cache.forEach((guild) => {
            const nicknameLabel = this.buildPriceNicknameLabel(
              "SLNA",
              currentPriceResponse,
              { mantissa: 4 }
            );

            guild.me.setNickname(nicknameLabel);
            this.#logger.log(
              `Updated SLNA bot with ${nicknameLabel} nickname.`
            );
          });
        }, FIVE_MINUTES);
      });
    } catch (error) {
      this.#logger.error(
        "There was a problem cycling the SLNA price bot.",
        error
      );
    }

    // Have the bot log in to Discord and start doing things.
    discordClient.login(process.env.SLNA_BOT_TOKEN ?? "");
  }

  private async initializeTvlBot() {
    this.#logger.log("Initializing Discord bot for solUST TVL.");

    const discordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    try {
      // When the client is ready, immediately fetch the solUST TVL.
      discordClient.once("ready", () => {
        setIntervalImmediately(async () => {
          this.#logger.log("Cycling solUST TVL bot.");

          const currentTvlResponse =
            await this.terraDevService.fetchSolunaTvl();

          // Set the bot's nickname and presence for all servers.
          discordClient.guilds.cache.forEach((guild) => {
            const nicknameLabel =
              this.buildTvlNicknameLabel(currentTvlResponse);

            guild.me.setNickname(nicknameLabel);

            discordClient.user.setPresence({
              activities: [{ type: "WATCHING", name: "solUST TVL" }]
            });

            this.#logger.log(
              `Updated solUST TVL bot with ${nicknameLabel} nickname.`
            );
          });
        }, FIVE_MINUTES);
      });
    } catch (error) {
      this.#logger.error(
        "There was a problem cycling the solUST TVL bot.",
        error
      );
    }

    // Have the bot log in to Discord and start doing things.
    discordClient.login(process.env.SOLUNA_TVL_BOT_TOKEN ?? "");
  }

  private buildTvlNicknameLabel(givenTvl: number) {
    return numbro(givenTvl).formatCurrency({
      mantissa: 0,
      thousandSeparated: true
    });
  }

  private buildPriceNicknameLabel(
    assetSymbol: string,
    givenPrice: number,
    options: Partial<{ mantissa: number }>
  ) {
    const { mantissa } = options;

    const decimalsToDisplay = mantissa ?? 2;

    const formattedPrice = numbro(givenPrice).formatCurrency({
      mantissa: decimalsToDisplay
    });

    const priceLabel = `${assetSymbol.toUpperCase()}: ${formattedPrice}`;

    return priceLabel;
  }
}
