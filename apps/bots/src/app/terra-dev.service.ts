import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class TerraDevService {
  #logger = new Logger(TerraDevService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchSolunaTvl() {
    const { data: tvlResponse } = await lastValueFrom(
      this.httpService.get<{ query_result: { amount: string } }>(
        "https://lcd.terra.dev/terra/wasm/v1beta1/contracts/terra1aug2pyftq4e85kq5590ud30yswnewa42n9fmr8/store?query_msg=eyJ0b3RhbF9kZXBvc2l0X2Ftb3VudCI6e319"
      )
    );

    const sanitizedAmount = Number(tvlResponse.query_result.amount);

    return sanitizedAmount / 1_000_000;
  }
}
