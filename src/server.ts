import express, { type Request, type Response } from 'express';
import { describe } from 'node:test';
import { PrismaClient, Prisma } from './generated/prisma/index';
import cors from 'cors';
import { z, ZodError } from 'zod';
import path from 'path';

// cria uma instancia da aplicação express
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));
// configuração do CORS para permitir requisições do frontend

const prisma = new PrismaClient;

// permite ao Express entender e processar requisições com corpo em JSON.
app.use(express.json())

export const createProdutoSchema = z.object({
  titulo: z.string().min(5, 'O nome deve ter no minimo 3 caracteres.'),
  descricao: z.string().min(10, 'A descricao deve ter no minimo 10 caracteres.'),
  preco: z.coerce.number().positive('O preco deve ser maior que zero.'),
  destaque: z.coerce.boolean().optional().default(false),
  //coerce tenta converte o valor para o tipo desejado, antes de validar
});


//Prisma espera que os campos enviados para data em prisma.product.update() sejam do tipo:string | number | StringFieldUpdateOperationsInput mas esta passando apenas o tipo string | undefined por isso o uso do transform
export const updateProdutoSchema = createProdutoSchema.partial().transform((data) => {
  const prismaData: Prisma.ProductUpdateInput = {};
  if (data.titulo !== undefined) prismaData.titulo = data.titulo;
  if (data.descricao !== undefined) prismaData.descricao = data.descricao;
  if (data.preco !== undefined) prismaData.preco = data.preco;
  if (data.destaque !== undefined) prismaData.destaque = data.destaque;
  return prismaData;
});


// define a rota inicial endpoint para o servidor
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'status: ok' });
});

// endpoint para listar todos os produtos
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany()
    res.status(200).json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    res.status(500).json({ error: 'Erro ao buscar produtos no banco de dados.' })
  }
})

//Lista um produto por id
app.get('/api/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'ID inválido. Deve ser um número inteiro positivo.' })
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' })
    }

    res.status(200).json(product)
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error)
    res.status(500).json({ error: 'Erro interno ao buscar produto.' })
  }
})

/**
 * Post /api/products
 */
app.post('/api/products', async (req: Request, res: Response) => {

  try {
    const data = createProdutoSchema.parse(req.body);
    const newProduct = await prisma.product.create({ data });
    return res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        issues: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        })),
      });
    }
    console.error('Post /api/produtos error: ', error)

    return res.status(500).json({ message: 'Erro ao criar produto.' });
  }
})

/**
 * PUT /api/products
 */
app.put('/api/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID do produto invalido. Deve ser um numero inteiro positivo.' });
  }
  try {

    const data = updateProdutoSchema.parse(req.body);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data,
    })
    res.status(200).json(updatedProduct)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Erro de validacao',
        issues: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Produto nao encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao atualizar produto.' })
  }
})

// Excluir um produto
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID do produto invalido. Deve ser um numero inteiro positivo.' });
  }

  try {
    await prisma.product.delete({ where: { id: productId } })
    res.status(204).json({ message: 'Produto excluído com sucesso.' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    console.error('Erro ao excluir produto:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir produto.' });
  }
})


//Define a porta em que o servidor vai rodar
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});
