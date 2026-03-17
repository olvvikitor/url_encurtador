import { Test, TestingModule } from "@nestjs/testing"
import { UrlsController } from "./short.controller"
import { UrlsService } from "./short.service"
import { NotFoundException } from "@nestjs/common"


const mockUrlsService = {
    shorten: jest.fn(),
    resolve: jest.fn(),
    delete: jest.fn()
}
describe('UrlsController', () => {
    let controller: UrlsController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UrlsController],
            providers: [
                {
                    provide: UrlsService, useValue: mockUrlsService
                }
            ],
        }).compile()
        controller = module.get<UrlsController>(UrlsController)
        jest.clearAllMocks()
    })

    describe('POST /urls', () => {
        it('Chama urlsService.shorten com a long_url e o user_id do JWT', async () => {
            const dto = {
                longUrl: 'https://google.com', expiresIn: null
            }
            const user = { id: 'user-123' }
            mockUrlsService.shorten.mockResolvedValue({ shortCode: 'abc1234' })

            await controller.shorten(dto, { user })

            expect(mockUrlsService.shorten).toHaveBeenCalledWith(
                'https://google.com',
                'user-123',
                null,
            )
        })
    })
    it('Retorna a short_url completa no body', async () => {
        const dto = { longUrl: 'https://google.com', expiresIn: null }
        const user = { id: 'user-123' }
        mockUrlsService.shorten.mockResolvedValue({ shortCode: 'abc123' })

        const result = await controller.shorten(dto, { user })
        expect(result).toEqual({ shortUrl: 'http://localhost:3000/abc123' })
    })
    it('Retorna a short_url com expiração quando expiresIn é informado', async () => {
        const dto = { longUrl: 'https://google.com', expiresIn: 3600 }
        const user = { id: 'user-123' }
        mockUrlsService.shorten.mockResolvedValue({ shortCode: 'xyz999' })
        const result = await controller.shorten(dto, { user })
        expect(result).toEqual({ shortUrl: 'http://localhost:3000/xyz999' })
    })
    describe('GET /:code', () => {
        it('Redireciona para a long_url quando o código existir', async () => {
            mockUrlsService.resolve.mockResolvedValue('https://google.com')
            const response = { redirect: jest.fn() }

            await controller.redirect('abc123', response as any)
            expect(response.redirect).toHaveBeenCalledWith(301, 'https://google.com')
        })

        it('Lança NotFoundExeption quando o código não existe', async () => {
            mockUrlsService.resolve.mockResolvedValue(null)
            const response = { redirect: jest.fn() }
            await expect(
                controller.redirect('naoexiste', response as any)
            ).rejects.toThrow(NotFoundException)
        })
        it('lança NotFoundException quando a URL está expirada', async () => {
            mockUrlsService.resolve.mockRejectedValue(new NotFoundException())
            const response = { redirect: jest.fn() }

            await expect(
                controller.redirect('expirado', response as any)
            ).rejects.toThrow(NotFoundException)
        })
    })
    describe('DELETE /urls/:code', () => {
        it('chama urlsService.delete com o código e o user_id', async () => {
            const user = { id: 'user-123' }
            mockUrlsService.delete.mockResolvedValue(undefined)

            await controller.delete('abc123', { user })

            expect(mockUrlsService.delete).toHaveBeenCalledWith('abc123', 'user-123')
        })
        it('retorna 204 sem body', async () => {
            const user = { id: 'user-123' }
            mockUrlsService.delete.mockResolvedValue(undefined)

            const result = await controller.delete('abc123', { user })

            expect(result).toBeUndefined()
        })
    })
})
