import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// Setup uploads folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

// Multer config for 10MB limit
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const JWT_SECRET = 'mda-super-secret-key-change-in-prod';

// --- AUTH --- //

// Create default user on startup
const setupDefaultUser = async () => {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('anderson@mda.com.br');
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('@Anderson', 10);
        db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('anderson@mda.com.br', hashedPassword);
        console.log('Default user created: anderson@mda.com.br');
    }
};
setupDefaultUser();

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, email: user.email });
});

// Middleware to protect routes
const authGuard = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token ausente' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// --- CATEGORIES --- //

app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
});

app.post('/api/categories', authGuard, (req, res) => {
    const { id, name, icon } = req.body;
    try {
        const result = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)').run(id, name, icon || 'Leaf');
        res.json({ id, name, icon });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao criar categoria ou ID já existe' });
    }
});

app.delete('/api/categories/:id', authGuard, (req, res) => {
    try {
        db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao excluir' });
    }
});

// --- PRODUCTS --- //

app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    res.json(products);
});

// Create product
app.post('/api/products', authGuard, upload.single('image'), (req, res) => {
    const { category, name, weight, desc } = req.body;

    // Imagem pode vir do upload ou ser uma URL predefinida se já tiver no bd fake
    let imgPath = req.body.img;
    if (req.file) {
        imgPath = '/uploads/' + req.file.filename;
    }

    if (!imgPath) {
        return res.status(400).json({ error: 'Imagem é obrigatória' });
    }

    const result = db.prepare(`
    INSERT INTO products (category, name, weight, desc, img, hidden) 
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(category, name, weight, desc, imgPath);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.json(newProduct);
});

// Update product
app.put('/api/products/:id', authGuard, upload.single('image'), (req, res) => {
    const { category, name, weight, desc, hidden } = req.body;
    const isHidden = hidden === 'true' || hidden === true ? 1 : 0;

    let imgPath = req.body.img;
    if (req.file) {
        imgPath = '/uploads/' + req.file.filename;
    }

    db.prepare(`
    UPDATE products 
    SET category = ?, name = ?, weight = ?, desc = ?, img = COALESCE(?, img), hidden = ?
    WHERE id = ?
  `).run(category, name, weight, desc, imgPath, isHidden, req.params.id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
});

app.delete('/api/products/:id', authGuard, (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

const setupInitialData = () => {
    const hasCategories = db.prepare('SELECT count(*) as count FROM categories').get() as any;
    if (hasCategories.count === 0) {
        const insertCat = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
        insertCat.run('temperos', 'Temperos', 'Leaf');
        insertCat.run('chas', 'Chás e Ervas', 'Coffee');
        insertCat.run('graos', 'Grãos e Oleaginosas', 'Wheat');

        const insertProd = db.prepare('INSERT INTO products (category, name, weight, desc, img) VALUES (?, ?, ?, ?, ?)');

        // --- 10 Temperos ---
        insertProd.run('temperos', 'Açafrão da Terra', '150g', 'Puro e vibrante, ideal para dar cor e sabor.', 'https://images.unsplash.com/photo-1615486171448-4afd3710501f?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Alecrim', '50g', 'Aroma fresco e intenso para carnes e batatas.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Chimichurri', '100g', 'O clássico argentino para o seu churrasco.', 'https://images.unsplash.com/photo-1599909618035-773a65573489?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Pápricas (Doce, Defumada, Picante)', '100g', 'Escolha a sua versão favorita.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Pimenta do Reino', '100g', 'O tempero essencial para qualquer cozinha.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Orégano', '50g', 'Perfeito para pizzas, molhos e saladas.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Tempero Baiano', '150g', 'Mistura arretada para pratos cheios de sabor.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Tempero FIT', '150g', 'Sabor sem culpa para suas refeições saudáveis.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Tempero para Feijão', '150g', 'O segredo do feijão perfeito e encorpado.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('temperos', 'Vinagrete', '100g', 'Praticidade e sabor para o seu churrasco.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop');

        // --- 10 Chás ---
        insertProd.run('chas', 'Canela em Casca', '50g', 'Aroma quente e adocicado para chás e doces.', 'https://images.unsplash.com/photo-1559144490-8328294fab4d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Flor de Camomila', '50g', 'Calmante natural para noites tranquilas.', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Capim Limão', '50g', 'Refrescante e digestivo, ótimo quente ou gelado.', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Chá Verde', '100g', 'Antioxidante poderoso e estimulante natural.', 'https://images.unsplash.com/photo-1627492276010-4ce2688b7277?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Hibisco', '100g', 'Sabor marcante e propriedades diuréticas.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Melissa', '50g', 'Erva cidreira para relaxar o corpo e a mente.', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Espinheira Santa', '50g', 'Aliada da digestão e saúde estomacal.', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Cavalinha', '50g', 'Ação diurética e rica em minerais.', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Erva Doce', '50g', 'Sabor suave e propriedades digestivas.', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop');
        insertProd.run('chas', 'Cravo da Índia', '50g', 'Especiaria aromática e termogênica.', 'https://images.unsplash.com/photo-1559144490-8328294fab4d?q=80&w=600&auto=format&fit=crop');

        // --- 10 Grãos ---
        insertProd.run('graos', 'Amendoim Torrado', '200g', 'Energia pura e sabor irresistível.', 'https://images.unsplash.com/photo-1599576822557-41a457199709?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Castanha de Caju', '150g', 'Torrada e crocante, fonte de boas gorduras.', 'https://images.unsplash.com/photo-1599576822557-41a457199709?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Castanha do Pará', '150g', 'Rica em selênio e muito nutritiva.', 'https://images.unsplash.com/photo-1599576822557-41a457199709?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Nozes', '150g', 'Perfeitas para lanches e receitas saudáveis.', 'https://images.unsplash.com/photo-1599576822557-41a457199709?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Mix de Castanhas', '200g', 'A combinação perfeita para o seu lanche.', 'https://images.unsplash.com/photo-1536588974558-812068804c86?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Ameixas', '200g', 'Doces, suculentas e ricas em fibras.', 'https://images.unsplash.com/photo-1536588974558-812068804c86?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Aveia', '200g', 'Base nutritiva para o seu café da manhã.', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Semente de Chia', '150g', 'Superalimento rico em fibras e ômega 3.', 'https://images.unsplash.com/photo-1588600878108-578307a3cc9d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Semente de Abóbora', '150g', 'Rica em ferro e zinco, ideal para saladas.', 'https://images.unsplash.com/photo-1588600878108-578307a3cc9d?q=80&w=600&auto=format&fit=crop');
        insertProd.run('graos', 'Semente de Girassol', '150g', 'Crocante e nutritiva para os seus lanches.', 'https://images.unsplash.com/photo-1588600878108-578307a3cc9d?q=80&w=600&auto=format&fit=crop');
    }
};
setupInitialData();

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});
