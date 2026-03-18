import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { generateShortCode } from '../common/snowflake'
import { UrlsRepository } from './urls.repository'

@Injectable()
export class UrlsService {
    constructor(private urlsRepository: UrlsRepository) { }

    async shorten(longUrl: string, userId: string, expiresIn: number | null) {
        const shortCode = generateShortCode()

        const expiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000)
            : null

        await this.urlsRepository.save({
            shortCode,
            longUrl,
            userId,
            expiresAt,
        })

        return { shortCode }
    }

    async resolve(code: string): Promise<string | null> {
        const response = await this.urlsRepository.findByCode(code)

        if (!response) return null

        if (response.expiresAt && response.expiresAt < new Date()) {
            throw new NotFoundException()
        }

        return response.longUrl
    }

    async delete(code: string, userId: string): Promise<void> {
        // 1. busca a url
        const response = await this.urlsRepository.findByCode(code)
        // 2. se não existe → NotFoundException
        if (!response) throw new NotFoundException
        // 3. se userId !== url.userId → ForbiddenException
        if(response.userId !== userId) throw new ForbiddenException
        // 4. deleta
        await this.urlsRepository.delete(response.shortCode)
    }
}