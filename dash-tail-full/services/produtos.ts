// services/produtos.ts
export async function buscarProdutosAutocomplete(query: string, fabricante?: number) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (fabricante) params.set('fabricante', String(fabricante))

    const res = await fetch(`/api/paginas/parametros/produto/autocomplete?${params}`)
    if (!res.ok) throw new Error('Erro ao buscar produtos')

    return await res.json()
  }
