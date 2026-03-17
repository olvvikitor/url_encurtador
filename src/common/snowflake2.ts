import { generateShortCode } from './snowflake'

// gera 5 códigos e imprime
for (let i = 0; i < 5; i++) {
  console.log(generateShortCode())
}