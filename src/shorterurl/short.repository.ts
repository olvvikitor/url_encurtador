import { url } from "inspector"


export interface UrlEntity {
    shortCode: string,
    userId: string,
    longUrl: string,
    expiresAt: string
}
const urls:UrlEntity[] = []

export class UrlsRepository {
    constructor() {
    }

    async save(payload: UrlEntity): Promise<void> {
        urls.push(payload)
    }
    async findByCode(code: string): Promise<UrlEntity | null> {
        return urls.map()

    }
    async delete(code: string): Promise<void> {

    }
}