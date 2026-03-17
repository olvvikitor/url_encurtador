const EPOCH = 1700000000000n
const MACHINE_ID = 1n

let sequence = 0n
let lastTimestamp = -1n

export function genereateSnowflakeId():bigint{
    let timestamp = BigInt(Date.now())

    if(timestamp === lastTimestamp){
        sequence = (sequence + 1n) & 0xfffn
        if(sequence === 0n){
            while (timestamp <= lastTimestamp){
                timestamp = BigInt(Date.now())
            }
        }
    }
    else{
        sequence =0n
    }
    lastTimestamp = timestamp
    return ((timestamp - EPOCH) << 22n) | (MACHINE_ID << 12n) | sequence
}
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
export function toBase62(num:bigint):string{
    if(num === 0n) return '0'
    let result = ''
    while (num > 0n){
        result = BASE62[Number(num % 62n)] + result 
        num = num /62n
    }
    return result.slice(-7)
}
export function generateShortCode():string{
    return toBase62(genereateSnowflakeId())
}