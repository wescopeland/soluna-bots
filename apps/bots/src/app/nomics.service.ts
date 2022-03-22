import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import urlcat from "urlcat";
import { lastValueFrom } from "rxjs";

// TODO, WIP

@Injectable()
export class NomicsService {
  #apiBaseUrl = "https://nomics.com/data";
  #logger = new Logger(NomicsService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchSlnaDailyPriceHistory() {
    const requestUrl = urlcat(this.#apiBaseUrl, "currency-history", {
      base: "SLNA",
      convert: "USD",
      interval: "24h"
    });

    this.#logger.log("Attempting to get SLNA price history from Nomics.");
    try {
      const dailyPriceHistoryResponse = await lastValueFrom(
        this.httpService.get<{ items: Array<{ close: string }> }>(requestUrl)
      );
    } catch (error) {
      this.#logger.error("SLNA price history call failed.");
      return null;
    }
  }
}
