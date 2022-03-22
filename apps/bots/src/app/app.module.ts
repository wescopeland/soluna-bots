import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DiscordBotManagerService } from "./discord-bot-manager.service";
import { JupiterService } from "./jupiter.service";
import { TerraDevService } from "./terra-dev.service";

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    AppService,
    DiscordBotManagerService,
    JupiterService,
    TerraDevService
  ]
})
export class AppModule {}
