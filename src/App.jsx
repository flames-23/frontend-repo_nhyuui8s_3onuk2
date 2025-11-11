import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function classNames(...c) { return c.filter(Boolean).join(' ') }

function ProductCard({ item, onOffer, onBuy }) {
  const lowestPrice = useMemo(() => {
    if (!item?.size_variants?.length) return null
    return Math.min(...item.size_variants.map(sv => sv.price))
  }, [item])

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No Image</div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">{item.brand}</div>
        <div className="text-lg font-semibold text-gray-900 truncate">{item.title}</div>
        <div className="text-sm text-gray-600 truncate">{item.model} • {item.colorway || '—'}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          {lowestPrice != null && (
            <div className="text-gray-900 font-semibold">From ${lowestPrice.toFixed(2)}</div>
          )}
          <div className="text-xs text-gray-500">{item.condition?.replaceAll('_',' ')}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onOffer(item)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Offer</button>
          <button onClick={() => onBuy(item)} className="px-3 py-1.5 text-sm rounded-lg bg-black text-white hover:bg-gray-900">Buy</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, per_page: 12 })

  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [createData, setCreateData] = useState({
    seller_id: 'seller_demo_1',
    product: {
      title: '', slug: '', brand: '', model: '', release_year: 2024,
      condition: 'new', size_variants: [{ size: 'US 9', sku: 'SKU-DEMO-9', price: 199, currency: 'USD', inventory_quantity: 5 }],
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'],
      description: '', materials: '', colorway: 'Black/White',
      tags: ['retro'], authenticity_certificate: false,
      seller_id: 'seller_demo_1', shipping_weight_grams: 1200,
      dimensions_mm: { length: 330, width: 220, height: 130 }
    },
    price: 199,
    listing_type: 'fixed_price'
  })

  useEffect(() => { fetchProducts(1) }, [])

  async function fetchProducts(page = 1) {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (brand) params.set('brand', brand)
      if (size) params.set('size', size)
      if (condition) params.set('condition', condition)
      params.set('page', String(page))
      params.set('per_page', String(meta.per_page))

      const res = await fetch(`${API_BASE}/products?${params.toString()}`)
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
      const data = await res.json()
      setProducts(data.items || [])
      setMeta({ total: data.total, page: data.page, per_page: data.per_page })
    } catch (e) {
      setError(e.message || 'Error loading products')
    } finally {
      setLoading(false)
    }
  }

  async function createListing(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to create listing')
      setShowCreate(false)
      await fetchProducts(1)
      alert('Listing created!')
    } catch (e) {
      setError(e.message)
    }
  }

  async function quickOffer(item) {
    const listingId = prompt('Enter listing ID to make an offer (demo):')
    if (!listingId) return
    const offer = { buyer_id: 'buyer_demo_1', listing_id: listingId, offer_price: Number(prompt('Offer price:') || '0') }
    try {
      const res = await fetch(`${API_BASE}/offers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(offer) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Offer failed')
      alert('Offer submitted!')
    } catch (e) { alert(e.message) }
  }

  async function quickBuy(item) {
    const listingId = prompt('Enter listing ID to checkout (demo):')
    if (!listingId) return
    const payload = { cart_id: null, listing_id: listingId, buyer_id: 'buyer_demo_1', payment_method: { method: 'demo' }, shipping_option: 'standard' }
    try {
      const res = await fetch(`${API_BASE}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Checkout failed')
      alert('Order confirmed: ' + data.order_id)
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-black text-white grid place-items-center font-bold">SS</div>
            <div>
              <div className="font-semibold text-lg">SneakSync Marketplace</div>
              <div className="text-xs text-zinc-500">Luxury drops, everyday kicks — buy, sell, resell.</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="px-3 py-2 rounded-lg bg-black text-white hover:bg-zinc-900">Sell / List item</button>
            <a href="#" className="px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50">Admin</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-black text-white p-8 md:p-12 overflow-hidden relative">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Find your next pair. Sell with trust.</h1>
            <p className="mt-3 text-white/80">Limited drops, authenticated resale, and offers — all in one place.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-white text-black font-semibold">Start Selling</button>
              <a href="#browse" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10">Browse</a>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-20 select-none" aria-hidden>
            <div className="h-64 w-64 rounded-full bg-gradient-to-tr from-fuchsia-500 to-blue-500 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Search/Filters */}
      <section id="browse" className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-3 pb-4">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search brand, model, colorway" className="md:col-span-2 px-3 py-2 rounded-lg border border-zinc-200" />
          <input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Brand" className="px-3 py-2 rounded-lg border border-zinc-200" />
          <div className="grid grid-cols-2 gap-3">
            <input value={size} onChange={e=>setSize(e.target.value)} placeholder="Size (e.g., US 9)" className="px-3 py-2 rounded-lg border border-zinc-200" />
            <select value={condition} onChange={e=>setCondition(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-200">
              <option value="">Condition</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="used">Used</option>
              <option value="open_box">Open Box</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 pb-6">
          <button onClick={()=>fetchProducts(1)} className="px-4 py-2 rounded-lg bg-black text-white">Search</button>
          {loading && <span className="text-sm text-zinc-500">Loading…</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {products.length === 0 && !loading ? (
          <div className="text-center text-zinc-500 py-10">No products yet. Create your first listing.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id || p.slug} item={p} onOffer={quickOffer} onBuy={quickBuy} />
            ))}
          </div>
        )}
      </section>

      {/* Create Listing Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-30 bg-black/40 grid place-items-center p-4" onClick={()=>setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Listing</h3>
              <button onClick={()=>setShowCreate(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={createListing} className="grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={createData.product.title} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, title: e.target.value } }))} placeholder="Title" className="px-3 py-2 rounded-lg border border-zinc-200" required />
                <input value={createData.product.brand} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, brand: e.target.value } }))} placeholder="Brand" className="px-3 py-2 rounded-lg border border-zinc-200" required />
                <input value={createData.product.model} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, model: e.target.value } }))} placeholder="Model" className="px-3 py-2 rounded-lg border border-zinc-200" required />
                <input value={createData.product.slug} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, slug: e.target.value } }))} placeholder="Slug (unique)" className="px-3 py-2 rounded-lg border border-zinc-200" />
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <input type="number" value={createData.product.release_year} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, release_year: Number(e.target.value) } }))} placeholder="Release Year" className="px-3 py-2 rounded-lg border border-zinc-200" />
                <select value={createData.product.condition} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, condition: e.target.value } }))} className="px-3 py-2 rounded-lg border border-zinc-200">
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="used">Used</option>
                  <option value="open_box">Open Box</option>
                </select>
                <input value={createData.product.size_variants[0].size} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, size_variants: [{ ...d.product.size_variants[0], size: e.target.value }] } }))} placeholder="Size" className="px-3 py-2 rounded-lg border border-zinc-200" />
                <input type="number" value={createData.price} onChange={e=>setCreateData(d=>({ ...d, price: Number(e.target.value), product: { ...d.product, size_variants: [{ ...d.product.size_variants[0], price: Number(e.target.value) }] } }))} placeholder="Price" className="px-3 py-2 rounded-lg border border-zinc-200" />
              </div>
              <input value={createData.product.images[0]} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, images: [e.target.value] } }))} placeholder="Image URL" className="px-3 py-2 rounded-lg border border-zinc-200" />
              <textarea value={createData.product.description} onChange={e=>setCreateData(d=>({ ...d, product: { ...d.product, description: e.target.value } }))} placeholder="Description" className="px-3 py-2 rounded-lg border border-zinc-200" rows={3} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg border border-zinc-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-black text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Backend: {API_BASE}
      </footer>
    </div>
  )
}
