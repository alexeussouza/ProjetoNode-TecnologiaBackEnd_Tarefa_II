import { PrismaClient } from "../src/generated/prisma/index";

const prisma = new PrismaClient() // instancia prisma client

async function main(){
    console.log("Iniciando seed do banco de dados...")

    //limpa a tabela antes de popular 
    await prisma.product.deleteMany();

    const produtos = await prisma.product.createMany({
        data:  [
            {
                titulo: "Caneta esferografica preta",
                descricao: "Caneta ponta fina",
                preco: 4.00,
                destaque: true
            },
            {
                titulo: "Celular A40",
                descricao: "Celular LG",
                preco: 1205.00,  
                destaque: false
            },
            {
                titulo: "Caderno 20 Matérias",
                descricao: "caderno 20 matérias brochura",
                preco: 40.00,  
                destaque: false
            },
            {
                titulo: "Borracha escolar",
                descricao: "borracha escolar duas cores",
                preco: 5.00,  
                destaque: false
            },
            {
                titulo: "Lapiseira 1.5",
                descricao: "lapiseira fabercaster 1.5",
                preco: 12.00,  
                destaque: false
            }
        ]
    })
    console.log(`${produtos.count} produtos criados com sucesso!`)
}
main()
    .catch((e) => {
        console.log("Erro ao popular o banco", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })