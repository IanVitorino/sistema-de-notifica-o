'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Regiao {
  id: number
  codigo_regiao: string
  descricao_regiao: string
  descricao_reduzida?: string
}

interface RegiaoAutocompleteProps {
  value: Regiao | null
  onSelect: (regiao: Regiao | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RegiaoAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar região...',
  disabled = false,
  className = ''
}: RegiaoAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Regiao[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setSearchTerm(value.descricao_regiao || value.codigo_regiao || `Região ${value.id}`)
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

  // Buscar regiões do backend
  const fetchRegioes = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/paginas/parametros/regiao-zona')

      if (!response.ok) {
        throw new Error('Erro ao buscar regiões')
      }

      const allData = await response.json()

      // Filtrar as regiões no cliente
      const filteredData = allData.filter((regiao: Regiao) => {
        const codigoRegiao = regiao.codigo_regiao?.toLowerCase() || ''
        const descricaoRegiao = regiao.descricao_regiao?.toLowerCase() || ''
        const descricaoReduzida = regiao.descricao_reduzida?.toLowerCase() || ''
        const termo = query.toLowerCase()

        return (
          codigoRegiao.includes(termo) ||
          descricaoRegiao.includes(termo) ||
          descricaoReduzida.includes(termo)
        )
      })

      setSuggestions(filteredData)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar regiões:', error)
      setSuggestions([])
      setHighlightedIndex(-1)
    } finally {
      setLoading(false)
    }
  }

  // Debounce para a busca
  useEffect(() => {
    if (!showSuggestions) return

    const handler = setTimeout(() => {
      fetchRegioes(searchTerm)
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

  // Selecionar uma região
  const handleSelectRegiao = (regiao: Regiao) => {
    onSelect(regiao)
    setSearchTerm(regiao.descricao_regiao || regiao.codigo_regiao || `Região ${regiao.id}`)
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
      handleSelectRegiao(suggestions[highlightedIndex])
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
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhuma região encontrada'}
            </div>
          ) : (
            suggestions.map((regiao, index) => (
              <div
                key={regiao.id}
                onClick={() => handleSelectRegiao(regiao)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-2 cursor-pointer border-b last:border-0 ${
                  highlightedIndex === index ? 'bg-default-100' : 'hover:bg-default-50'
                }`}
              >
                <div className="font-medium">{regiao.codigo_regiao} - {regiao.descricao_regiao}</div>
                {regiao.descricao_reduzida && (
                  <div className="text-sm text-default-400 truncate">{regiao.descricao_reduzida}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
