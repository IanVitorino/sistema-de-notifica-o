'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface MarcaProduto {
  id: number
  codigo?: string | null
  descricao?: string | null
}

interface MarcaAutocompleteProps {
  value: MarcaProduto | null
  onSelect: (marca: MarcaProduto | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MarcaAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar marca...',
  disabled = false,
  className = ''
}: MarcaAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<MarcaProduto[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setSearchTerm(value.descricao || value.codigo || `Marca ${value.id}`)
    } else {
      setSearchTerm('')
    }
  }, [value])

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Buscar marcas do backend
  const fetchMarcas = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      // Buscar todas as marcas e filtrar no cliente
      const response = await fetch('/api/paginas/cadastros/marca-produto')

      if (!response.ok) {
        throw new Error('Erro ao buscar marcas')
      }

      const allData = await response.json()

      // Filtrar as marcas no cliente
      const filteredData = allData.filter((marca: MarcaProduto) => {
        const codigo = marca.codigo?.toLowerCase() || ''
        const descricao = marca.descricao?.toLowerCase() || ''
        const termo = query.toLowerCase()

        return codigo.includes(termo) || descricao.includes(termo)
      })

      setSuggestions(filteredData.slice(0, 20)) // Limitar a 20 resultados
    } catch (error) {
      console.error('Erro ao buscar marcas:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar marcas ao digitar
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm && searchTerm !== value?.descricao && searchTerm !== value?.codigo) {
        fetchMarcas(searchTerm)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, value])

  const handleSelectMarca = (marca: MarcaProduto) => {
    onSelect(marca)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    onSelect(null)
    setSuggestions([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setShowSuggestions(true)

    if (!newValue.trim()) {
      onSelect(null)
      setSuggestions([])
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-20"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
              title="Limpar"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <div className="p-1.5">
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((marca) => (
              <button
                key={marca.id}
                type="button"
                onClick={() => handleSelectMarca(marca)}
                className="w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent rounded-sm transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {marca.codigo} - {marca.descricao}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && searchTerm.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 shadow-md">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma marca encontrada
          </p>
        </div>
      )}
    </div>
  )
}
