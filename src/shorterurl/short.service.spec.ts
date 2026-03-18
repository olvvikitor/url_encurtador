import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { UrlsService } from './short.service'

const mockUrlsRepository = {
  save: jest.fn(),
  findByCode: jest.fn(),
  delete: jest.fn(),
}

describe('UrlsService', () => {
  let service: UrlsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: UrlsRepository, useValue: mockUrlsRepository },
      ],
    }).compile()

    service = module.get<UrlsService>(UrlsService)
    jest.clearAllMocks()
  })

  describe('shorten', () => {
    it('salva a url no repositório com os dados corretos', async () => {
      mockUrlsRepository.save.mockResolvedValue(undefined)

      await service.shorten('https://google.com', 'user-123', null)

      expect(mockUrlsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          longUrl: 'https://google.com',
          userId: 'user-123',
          expiresAt: null,
        }),
      )
    })

    it('retorna um shortCode com no máximo 6 caracteres', async () => {
      mockUrlsRepository.save.mockResolvedValue(undefined)

      const result = await service.shorten('https://google.com', 'user-123', null)

      expect(result.shortCode).toBeDefined()
      expect(result.shortCode.length).toBeLessThanOrEqual(6)
    })

    it('calcula expiresAt corretamente quando expiresIn é informado', async () => {
      mockUrlsRepository.save.mockResolvedValue(undefined)

      const before = Date.now()
      await service.shorten('https://google.com', 'user-123', 3600)
      const after = Date.now()

      const savedArg = mockUrlsRepository.save.mock.calls[0][0]
      const expiresAt: Date = savedArg.expiresAt

      expect(expiresAt).toBeInstanceOf(Date)
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 3600 * 1000)
      expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 3600 * 1000)
    })
  })

  describe('resolve', () => {
    it('retorna a longUrl quando o código existe e não expirou', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        longUrl: 'https://google.com',
        expiresAt: null,
      })

      const result = await service.resolve('abc123')

      expect(result).toBe('https://google.com')
    })

    it('retorna null quando o código não existe', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue(null)

      const result = await service.resolve('naoexiste')

      expect(result).toBeNull()
    })

    it('lança NotFoundException quando a url está expirada', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        longUrl: 'https://google.com',
        expiresAt: new Date(Date.now() - 1000), // 1 segundo atrás
      })

      await expect(service.resolve('expirado')).rejects.toThrow(NotFoundException)
    })

    it('não lança erro quando expiresAt é no futuro', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        longUrl: 'https://google.com',
        expiresAt: new Date(Date.now() + 9999999),
      })

      const result = await service.resolve('valido')

      expect(result).toBe('https://google.com')
    })
  })

  describe('delete', () => {
    it('deleta quando o usuário é o dono', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        shortCode: 'abc123',
        userId: 'user-123',
      })
      mockUrlsRepository.delete.mockResolvedValue(undefined)

      await service.delete('abc123', 'user-123')

      expect(mockUrlsRepository.delete).toHaveBeenCalledWith('abc123')
    })

    it('lança NotFoundException quando o código não existe', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue(null)

      await expect(service.delete('naoexiste', 'user-123')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('lança ForbiddenException quando o usuário não é o dono', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        shortCode: 'abc123',
        userId: 'dono-original',
      })

      await expect(service.delete('abc123', 'outro-user')).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('não chama delete no repositório quando lança ForbiddenException', async () => {
      mockUrlsRepository.findByCode.mockResolvedValue({
        shortCode: 'abc123',
        userId: 'dono-original',
      })

      await service.delete('abc123', 'outro-user').catch(() => {})

      expect(mockUrlsRepository.delete).not.toHaveBeenCalled()
    })
  })
})