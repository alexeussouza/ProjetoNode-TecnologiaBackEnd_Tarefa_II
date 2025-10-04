import { PrismaClient } from "./generated/prisma/index";

const prisma = new PrismaClient()

async function test(){
    //busca todos os produtos
    const produtos = await prisma.product.findMany()

    produtos.forEach(product => {

        console.log(`${product.titulo} - R$ ${product.preco}`)
    })
}

test()