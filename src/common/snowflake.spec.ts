import { setTimeout as sleep } from 'timers/promises'
import { generateShortCode, genereateSnowflakeId, toBase62 } from './snowflake'
describe('toBase62', () => {

  it('Converte 0 para "0"', () => {
    expect(toBase62(0n)).toBe('0')
  })

  it('converte 62 para "10" (como binario, mas em base 62)', ()=>{
    expect(toBase62(62n)).toBe('10')
  })
  it('Converte 61 para "Z"("ultimo caractere do alfabeto base62)', ()=>{
    expect(toBase62(61n)).toBe('Z')
  })

  it('Usa apenas caracteres válidos de base62', ()=>{
    const base62Chars = /^[0-9a-zA-Z]+$/
    const code = generateShortCode()
    expect(code).toMatch(base62Chars)
  })
  it('Codigos gerados em momentos diferentes são ordenáveis cronologicamente', async()=>{
    const code = generateShortCode()
    await sleep(1)
    const code2 = generateShortCode()
    expect(code < code2).toBe(true)
  })
})
