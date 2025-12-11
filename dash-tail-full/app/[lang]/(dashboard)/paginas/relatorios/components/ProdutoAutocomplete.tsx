'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Produto {
  id: number
  codigo: string
  descricao: string
  desc_reduzida?: string
}

interface ProdutoAutocompleteProps {
  value: Produto | null
  onSelect: (produto: Produto | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ProdutoAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar produto...',
  disabled = false,
  className = ''
}: ProdutoAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setSearchTerm(`${value.codigo} - ${value.descricao}`)
    } else {
      setSearchTerm('')
    }
  }, [value])

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Buscar produtos do backend
  const fetchProdutos = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      // Tenta endpoint de autocomplete
      const params = new URLSearchParams()
      params.set('q', query)

      const response = await fetch(`/api/paginas/parametros/produto/autocomplete?${params}`)

      if (!response.ok) {
        // Fallback: buscar todos e filtrar no cliente
        const fallbackResponse = await fetch('/api/paginas/parametros/produto')
        if (!fallbackResponse.ok) {
          throw new Error('Erro ao buscar produtos')
        }

        const allData = await fallbackResponse.json()
        const filteredData = allData.filter((prod: Produto) => {
          const codigo = prod.codigo?.toLowerCase() || ''
          const descricao = prod.descricao?.toLowerCase() || ''
          const descReduzida = prod.desc_reduzida?.toLowerCase() || ''
          const termo = query.toLowerCase()

          return codigo.includes(termo) || descricao.includes(termo) || descReduzida.includes(termo)
        })

        setSuggestions(filteredData)
        setHighlightedIndex(-1)
        return
      }

      const data = await response.json()
      setSuggestions(data)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)

      // Fallback em caso de erro
      try {
        const fallbackResponse = await fetch('/api/paginas/parametros/produto')
        if (fallbackResponse.ok) {
          const allData = await fallbackResponse.json()
          const filteredData = allData.filter((prod: Produto) => {
            const codigo = prod.codigo?.toLowerCase() || ''
            const descricao = prod.descricao?.toLowerCase() || ''
            const descReduzida = prod.desc_reduzida?.toLowerCase() || ''
            const termo = query.toLowerCase()

            return codigo.includes(termo) || descricao.includes(termo) || descReduzida.includes(termo)
          })

          setSuggestions(filteredData)
        } else {
          setSuggestions([])
        }
      } catch {
        setSuggestions([])
      }
      setHighlightedIndex(-1)
    } finally {
      setLoading(false)
    }
  }

  // Debounce para a busca
  useEffect(() => {
    if (!showSuggestions) return

    const handler = setTimeout(() => {
      fetchProdutos(searchTerm)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, showSuggestions])

  // Limpar a seleção
  const handleClear = () => {
    setSearchTerm('')
    onSelect(null)
    setSuggestions([])
    setHighlightedIndex(-1)
  }

  // Selecionar um produto
  const handleSelectProduto = (produto: Produto) => {
    onSelect(produto)
    setSearchTerm(`${produto.codigo} - ${produto.descricao}`)
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelectProduto(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-default-400 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!showSuggestions) setShowSuggestions(true)
            if (e.target.value === '') onSelect(null)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 pr-10 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        />
        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-default-400 hover:text-default-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-card shadow-lg rounded-md border max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-center text-default-500">Buscando...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-2 text-sm text-center text-default-500">
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum produto encontrado'}
            </div>
          ) : (
            suggestions.map((produto, index) => (
              <div
                key={produto.id}
                onClick={() => handleSelectProduto(produto)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-2 cursor-pointer border-b last:border-0 ${
                  highlightedIndex === index ? 'bg-default-100' : 'hover:bg-default-50'
                }`}
              >
                <div className="font-medium">
                  {produto.codigo} - {produto.descricao}
                </div>
                {produto.desc_reduzida && (
                  <div className="text-xs text-default-400 truncate">{produto.desc_reduzida}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
