import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { UrlsService } from "./short.service";

@Controller()
export class UrlsController {
    constructor(
        private readonly urlsService: UrlsService) { }


    @Post('urls')
    @UseGuards(JwtAuthGuard)
    async shorten(@Body() body: { longUrl: string; expiresIn: number | null }, @Req() req: any) {
        
    }
}