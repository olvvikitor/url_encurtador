import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Req,
    Res,
    UseGuards,
    HttpCode,
    NotFoundException,
} from '@nestjs/common'
import { UrlsService } from './short.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller()
export class UrlsController {
    constructor(private readonly urlsService: UrlsService) { }

    @Post('urls')
    @UseGuards(JwtAuthGuard)
    async shorten(@Body() body: { longUrl: string; expiresIn: number | null }, @Req() req: any) {
        const { shortCode } = await this.urlsService.shorten(
            body.longUrl,
            req.user.id,
            body.expiresIn,
        )
        return { shortUrl: `${process.env.BASE_URL}/${shortCode}` }
    }

    @Get(':code')
    async redirect(@Param('code') code: string, @Res() res: any) {
        const longUrl = await this.urlsService.resolve(code)
        if (!longUrl) throw new NotFoundException()
        res.redirect(301, longUrl)
    }

    @Delete('urls/:code')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async delete(@Param('code') code: string, @Req() req: any) {
        await this.urlsService.delete(code, req.user.id)
    }
}