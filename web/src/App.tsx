import { FormEvent, useEffect, useMemo, useState } from "react"
import { createFood, deleteFood, listRestaurantFoods, updateFood, uploadFoodImage } from "./api"
import { tokens } from "./theme"
import type { FoodItem, FoodPayload } from "./types"

type FormState = {
  name: string
  description: string
  price: string
  image_url: string
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  image_url: "",
}

function mapFoodToForm(item: FoodItem): FormState {
  return {
    name: item.name,
    description: item.description,
    price: String(item.price),
    image_url: item.image_url,
  }
}

function toPayload(form: FormState): FoodPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    image_url: form.image_url.trim(),
  }
}

export function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem("discoverly.restaurant.token") ?? "")
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loadingFoods, setLoadingFoods] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const isEditing = editingId !== null
  const canSubmit = useMemo(
    () => Boolean(form.name.trim() && form.description.trim() && form.image_url.trim() && Number(form.price) > 0),
    [form.description, form.image_url, form.name, form.price],
  )

  useEffect(() => {
    localStorage.setItem("discoverly.restaurant.token", token)
  }, [token])

  const loadFoods = async () => {
    if (!token.trim()) {
      setFoods([])
      return
    }

    setLoadingFoods(true)
    setError(null)
    try {
      const data = await listRestaurantFoods(token.trim())
      setFoods(data.filter((item) => item.is_active !== false))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load foods"
      setError(message)
    } finally {
      setLoadingFoods(false)
    }
  }

  useEffect(() => {
    void loadFoods()
  }, [token])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!token.trim()) {
      setError("Add restaurant auth token before saving.")
      return
    }

    if (!canSubmit) {
      setError("Please fill name, description, valid price, and image URL.")
      return
    }

    setSaving(true)
    try {
      const payload = toPayload(form)
      if (editingId) {
        await updateFood(token.trim(), editingId, payload)
        setSuccess("Food item updated.")
      } else {
        await createFood(token.trim(), payload)
        setSuccess("Food item created.")
      }

      setForm(EMPTY_FORM)
      setEditingId(null)
      setPreviewUrl("")
      await loadFoods()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save item"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (file: File | null) => {
    if (!file) {
      return
    }

    setError(null)
    setSuccess(null)

    if (!token.trim()) {
      setError("Add restaurant auth token before uploading.")
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    setUploading(true)
    try {
      const url = await uploadFoodImage(token.trim(), file)
      setForm((prev) => ({ ...prev, image_url: url }))
      setSuccess("Image uploaded.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed"
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const onEdit = (item: FoodItem) => {
    setEditingId(item.id)
    setForm(mapFoodToForm(item))
    setPreviewUrl(item.image_url)
    setError(null)
    setSuccess(null)
  }

  const onDelete = async (item: FoodItem) => {
    if (!token.trim()) {
      setError("Add restaurant auth token before deleting.")
      return
    }

    setError(null)
    setSuccess(null)
    try {
      await deleteFood(token.trim(), item.id)
      setFoods((prev) => prev.filter((entry) => entry.id !== item.id))
      setSuccess("Food item removed.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed"
      setError(message)
    }
  }

  const clearForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setPreviewUrl("")
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">D</div>
          <div>
            <p className="label">Discoverly</p>
            <h1>Restaurant Portal</h1>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">Menu Builder</button>
          <button className="nav-item" disabled>
            Active Orders
          </button>
          <button className="nav-item" disabled>
            Analytics
          </button>
          <button className="nav-item" disabled>
            Settings
          </button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="label">Overview</p>
            <h2>Menu Builder</h2>
          </div>
          <div className="wallet-badge">
            <span className="dot" />
            Wallet Connected
          </div>
        </header>

        <section className="panel token-panel">
          <label htmlFor="token">Restaurant JWT</label>
          <input
            id="token"
            placeholder="Paste Bearer token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </section>

        <section className="content-grid">
          <section className="panel form-panel">
            <h3>{isEditing ? "Edit food item" : "Add food item"}</h3>
            <form onSubmit={(event) => void onSubmit(event)}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Spicy Chicken Burger"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="price">Price (USD)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="12.99"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Crispy chicken, house slaw, spicy aioli."
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="upload">Image upload</label>
                <input
                  id="upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void onUpload(event.target.files?.[0] ?? null)}
                />
                <small>{uploading ? "Uploading..." : "Upload to /api/upload and auto-fill image URL."}</small>
              </div>

              <div className="field">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  id="imageUrl"
                  value={form.image_url}
                  onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
                  placeholder="https://..."
                  required
                />
              </div>

              {(previewUrl || form.image_url) && (
                <div className="preview">
                  <img src={previewUrl || form.image_url} alt="food preview" />
                </div>
              )}

              <div className="actions">
                <button className="btn primary" type="submit" disabled={!canSubmit || saving || uploading}>
                  {saving ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
                </button>
                <button className="btn ghost" type="button" onClick={clearForm}>
                  Clear
                </button>
              </div>
            </form>
            {error ? <p className="feedback error">{error}</p> : null}
            {success ? <p className="feedback success">{success}</p> : null}
          </section>

          <section className="panel list-panel">
            <div className="list-header">
              <h3>Active menu items</h3>
              <button className="btn ghost" type="button" onClick={() => void loadFoods()} disabled={loadingFoods}>
                {loadingFoods ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loadingFoods ? <p className="muted">Loading menu...</p> : null}
            {!loadingFoods && foods.length === 0 ? (
              <div className="empty-state">
                <h4>No active menu items</h4>
                <p>Add your first dish to start getting discovered.</p>
              </div>
            ) : null}

            <div className="cards">
              {foods.map((item) => (
                <article className="food-card" key={item.id}>
                  <img src={item.image_url} alt={item.name} />
                  <div className="food-meta">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="row">
                      <strong>${item.price.toFixed(2)}</strong>
                      <span className={`status ${item.is_active === false ? "paused" : "active"}`}>
                        {item.is_active === false ? "Paused" : "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="row actions-inline">
                    <button className="btn ghost" type="button" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button className="btn danger" type="button" onClick={() => void onDelete(item)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <style>{`:root{--primary:${tokens.colors.primary};--crypto:${tokens.colors.crypto};--bg:${tokens.colors.background};--surface:${tokens.colors.surface};--text:${tokens.colors.text};--muted:${tokens.colors.muted};--border:${tokens.colors.border};--error:${tokens.colors.error};--success:${tokens.colors.success};--radius-md:${tokens.radius.md}px;}`}</style>
    </div>
  )
}
