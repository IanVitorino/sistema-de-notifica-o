'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface GrupoProduto {
  id: number
  codigo: string
  descricao: string
  status?: boolean
}

interface GrupoProdutoAutocompleteProps {
  value: GrupoProduto | null
  onSelect: (grupoProduto: GrupoProduto | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function GrupoProdutoAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar grupo de produto...',
  disabled = false,
  className = ''
}: GrupoProdutoAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<GrupoProduto[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      setSearchTerm(`${value.codigo} - ${value.descricao}`)
    } else {
      setSearchTerm('')
    }
  }, [value])

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

  const fetchGruposProduto = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.set('q', query)

      const response = await fetch(`/api/paginas/parametros/grupo-produtos/autocomplete?${params}`)

      if (!response.ok) {
        throw new Error('Erro ao buscar grupos de produto')
      }

      const data = await response.json()
      setSuggestions(data)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar grupos de produto:', error)
      setSuggestions([])
      setHighlightedIndex(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!showSuggestions) return

    const handler = setTimeout(() => {
      fetchGruposProduto(searchTerm)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, showSuggestions])

  const handleClear = () => {
    setSearchTerm('')
    onSelect(null)
    setSuggestions([])
    setHighlightedIndex(-1)
  }

  const handleSelectGrupoProduto = (grupoProduto: GrupoProduto) => {
    onSelect(grupoProduto)
    setSearchTerm(`${grupoProduto.codigo} - ${grupoProduto.descricao}`)
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

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
      handleSelectGrupoProduto(suggestions[highlightedIndex])
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
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum grupo de produto encontrado'}
            </div>
          ) : (
            suggestions.map((grupoProduto, index) => (
              <div
                key={grupoProduto.id}
                onClick={() => handleSelectGrupoProduto(grupoProduto)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-2 cursor-pointer border-b last:border-0 ${
                  highlightedIndex === index ? 'bg-default-100' : 'hover:bg-default-50'
                }`}
              >
                <div className="font-medium">{grupoProduto.codigo} - {grupoProduto.descricao}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
