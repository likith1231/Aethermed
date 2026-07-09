import { PrismaClient } from '@prisma/client'
import fs from 'fs'
// Let's look at the PrismaClient constructor type in node_modules
console.log(fs.readFileSync('./node_modules/@prisma/client/index.d.ts', 'utf-8').slice(0, 1000))
