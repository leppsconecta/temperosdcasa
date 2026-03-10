import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, EyeOff, Eye, LogOut, Package, Tags, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard({ tab = 'products' }: { tab?: 'products' | 'categories' }) {
    const { logout, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>(tab);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);


    // Modals
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    // Forms
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Load Initial Data
    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) setCategories(await res.json());
        } catch (err) { console.error('Error fetching categories'); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (err) { console.error('Error fetching products'); }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm('Excluir este produto permanentemente?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
        } catch (err) { alert('Erro ao excluir'); }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Excluir esta categoria permanentemente? Os produtos desta categoria podem ficar sem filtro!')) return;
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchCategories();
        } catch (err) { alert('Erro ao excluir categoria'); }
    };

    const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (selectedFile) formData.append('image', selectedFile);
        // If we are appending hidden as string from a checkbox
        const isHidden = formData.get('hidden') === 'true' ? 'true' : 'false';
        formData.set('hidden', isHidden);

        const isEdit = !!editingProduct;
        const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type for FormData
                body: formData
            });
            if (!res.ok) throw new Error(await res.text());
            fetchProducts();
            closeProductModal();
        } catch (err: any) { alert('Erro ao salvar produto: ' + err.message); }
    };

    const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            id: formData.get('id'),
            name: formData.get('name'),
            icon: formData.get('icon') || 'Leaf'
        };

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) { fetchCategories(); closeCategoryModal(); }
        } catch (err) { alert('Erro ao criar categoria. Verifique se a ID já existe.'); }
    };

    const toggleProductVisibility = async (product: any) => {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('category', product.category);
        formData.append('weight', product.weight);
        formData.append('desc', product.desc);
        formData.append('hidden', product.hidden === 1 ? 'false' : 'true'); // toggle

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (res.ok) fetchProducts();
        } catch (err) { alert('Erro ao alterar visibilidade'); }
    };

    const openProductModal = (product: any = null) => {
        setEditingProduct(product);
        setSelectedFile(null);
        setProductModalOpen(true);
    };
    const closeProductModal = () => {
        setProductModalOpen(false);
        setEditingProduct(null);
        setSelectedFile(null);
    };

    const openCategoryModal = () => setCategoryModalOpen(true);
    const closeCategoryModal = () => setCategoryModalOpen(false);

    return (
        <div className="w-full animate-in fade-in duration-500">
            <main className="w-full">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-red">
                        {activeTab === 'products' ? 'Gerenciar Produtos' : 'Gerenciar Categorias'}
                    </h1>
                    {activeTab === 'products' ? (
                        <button onClick={() => openProductModal()} className="flex items-center gap-2 bg-primary-red hover:bg-primary-red-dark text-white px-4 py-2 rounded-xl font-bold shadow-md">
                            <Plus className="w-4 h-4" /> Novo Produto
                        </button>
                    ) : (
                        <button onClick={openCategoryModal} className="flex items-center gap-2 bg-primary-red hover:bg-primary-red-dark text-white px-4 py-2 rounded-xl font-bold shadow-md">
                            <Plus className="w-4 h-4" /> Nova Categoria
                        </button>
                    )}
                </div>

                {/* Dynamic Context */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-earth-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-earth-100/50 border-b border-earth-200 text-earth-600 text-sm">
                                        <th className="p-4 font-semibold w-16 text-center">Img</th>
                                        <th className="p-4 font-semibold w-56">Nome</th>
                                        <th className="p-4 font-semibold w-32">Categoria</th>
                                        <th className="p-4 font-semibold w-24">Peso</th>
                                        <th className="p-4 font-semibold w-20 text-center">Status</th>
                                        <th className="p-4 font-semibold w-32 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className={`border-b border-earth-100 hover:bg-earth-50 ${p.hidden === 1 ? 'opacity-60' : ''}`}>
                                            <td className="p-4 text-center">
                                                <img src={p.img} className="w-10 h-10 object-cover rounded-lg inline-block border border-earth-200" alt={p.name} />
                                            </td>
                                            <td className="p-4 font-bold text-primary-red">{p.name}</td>
                                            <td className="p-4"><span className="bg-accent-yellow/10 text-accent-yellow px-2 py-1 rounded text-xs font-bold uppercase">{categories.find(c => c.id === p.category)?.name || p.category}</span></td>
                                            <td className="p-4 text-earth-600 text-sm">{p.weight}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.hidden === 1 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {p.hidden === 1 ? 'Oculto' : 'Visível'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => toggleProductVisibility(p)} title={p.hidden ? 'Mostrar' : 'Ocultar'} className="p-2 bg-earth-100 hover:bg-earth-200 text-earth-600 rounded-lg">
                                                        {p.hidden === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => openProductModal(p)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (<tr><td colSpan={6} className="text-center p-8 text-earth-500">Nenhum produto cadastrado.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-earth-200 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-mustard-500/10 rounded-xl flex items-center justify-center text-mustard-600">
                                        <Tags className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-olive-900 text-lg">{c.name}</h3>
                                        <p className="text-sm text-earth-500">ID: {c.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </main>

            {/* --- Modals --- */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-offwhite sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-olive-900">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={closeProductModal} className="text-earth-500 hover:text-red-500 p-2"><Trash2 className="w-5 h-5 hidden" /></button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-earth-800 mb-2">Nome do Produto *</label>
                                    <input type="text" name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none" placeholder="Ex: Açafrão da Terra" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-earth-800 mb-2">Categoria *</label>
                                    <select name="category" defaultValue={editingProduct?.category || ''} required className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none bg-white">
                                        <option value="" disabled>Selecione uma categoria</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-earth-800 mb-2">Peso / Quantidade *</label>
                                    <input type="text" name="weight" defaultValue={editingProduct?.weight} required className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none" placeholder="Ex: 150g" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-earth-800 mb-2">Visibilidade</label>
                                    <label className="flex items-center gap-3 cursor-pointer py-3">
                                        <input type="checkbox" name="hidden" value="true" defaultChecked={editingProduct?.hidden === 1} className="w-5 h-5 text-mustard-500 rounded focus:ring-mustard-500" />
                                        <span className="text-earth-600 font-medium">Ocultar produto da loja</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-earth-800 mb-2">Descrição Breve *</label>
                                <textarea name="desc" defaultValue={editingProduct?.desc} required rows={3} className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none resize-none" placeholder="Ideal para dar cor e sabor..."></textarea>
                            </div>

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-medium text-earth-800 mb-2">Imagem do Produto (Máx 10MB)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-earth-300 hover:border-mustard-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-earth-50 group flex flex-col items-center justify-center relative overflow-hidden"
                                >
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }} className="hidden" />

                                    {selectedFile ? (
                                        <p className="text-olive-900 font-bold z-10 pointer-events-none">{selectedFile.name}</p>
                                    ) : (editingProduct?.img && !editingProduct.img.startsWith('blob:')) ? (
                                        <>
                                            <img src={editingProduct.img} className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
                                            <p className="text-earth-600 z-10 bg-white/80 px-4 py-2 rounded-full font-medium shadow-sm">Clique para alterar imagem</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="w-8 h-8 text-earth-400" />
                                            </div>
                                            <p className="text-earth-600 font-medium"><span className="text-mustard-600">Clique para enviar</span> ou arraste a foto</p>
                                            <p className="text-earth-400 text-xs mt-2">Suporta JPG, PNG, WEBP</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-earth-100 flex justify-end gap-4">
                                <button type="button" onClick={closeProductModal} className="px-6 py-3 text-earth-600 hover:bg-earth-100 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-3 bg-mustard-500 hover:bg-mustard-600 text-olive-900 rounded-xl font-bold shadow-md transition-colors">Salvar Produto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 border-b border-earth-100 bg-offwhite">
                            <h2 className="text-xl font-bold text-olive-900">Nova Categoria</h2>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-earth-800 mb-2">URL ID (sem espaços) *</label>
                                <input type="text" name="id" required className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none" placeholder="Ex: graos" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-earth-800 mb-2">Nome de Exibição *</label>
                                <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:ring-2 focus:ring-mustard-500 outline-none" placeholder="Ex: Grãos e Cia" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-earth-100">
                                <button type="button" onClick={closeCategoryModal} className="px-4 py-2 text-earth-600 hover:bg-earth-100 rounded-xl font-bold">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-mustard-500 text-olive-900 rounded-xl font-bold shadow-md">Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
