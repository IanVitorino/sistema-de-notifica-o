'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Fabricante {
  id: number
  fantasia?: string
  razao_social?: string
  cnpj?: string
}

interface FabricanteAutocompleteProps {
  value: Fabricante | null
  onSelect: (fabricante: Fabricante | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function FabricanteAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar fabricante...',
  disabled = false,
  className = ''
}: FabricanteAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Fabricante[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setSearchTerm(value.fantasia || value.razao_social || `Fabricante ${value.id}`)
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

  // Buscar fabricantes do backend
  const fetchFabricantes = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      const url = `/api/paginas/cadastros/fabricante/search?query=${encodeURIComponent(query)}`
      const response = await fetch(url)

      if (!response.ok) {
        // Fallback para endpoint tradicional se o endpoint de busca não existir
        const fallbackResponse = await fetch('/api/paginas/cadastros/fabricante')
        if (!fallbackResponse.ok) {
          throw new Error('Erro ao buscar fabricantes')
        }

        const allData = await fallbackResponse.json()

        // Filtrar os fabricantes no cliente
        const filteredData = allData.filter((fab: Fabricante) => {
          const fantasia = fab.fantasia?.toLowerCase() || ''
          const razaoSocial = fab.razao_social?.toLowerCase() || ''
          const cnpj = fab.cnpj?.toLowerCase() || ''
          const termo = query.toLowerCase()

          return fantasia.includes(termo) || razaoSocial.includes(termo) || cnpj.includes(termo)
        })

        setSuggestions(filteredData)
        return
      }

      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('Erro ao buscar fabricantes:', error)

      // Em caso de falha na busca, tentar obter todos os fabricantes e filtrar no cliente
      try {
        const fallbackResponse = await fetch('/api/paginas/cadastros/fabricante')
        if (fallbackResponse.ok) {
          const allData = await fallbackResponse.json()
          const filteredData = allData.filter((fab: Fabricante) => {
            const fantasia = fab.fantasia?.toLowerCase() || ''
            const razaoSocial = fab.razao_social?.toLowerCase() || ''
            const cnpj = fab.cnpj?.toLowerCase() || ''
            const termo = query.toLowerCase()

            return fantasia.includes(termo) || razaoSocial.includes(termo) || cnpj.includes(termo)
          })

          setSuggestions(filteredData)
        } else {
          setSuggestions([])
        }
      } catch {
        setSuggestions([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Debounce para a busca
  useEffect(() => {
    if (!showSuggestions) return

    const handler = setTimeout(() => {
      fetchFabricantes(searchTerm)
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
  }

  // Selecionar um fabricante
  const handleSelectFabricante = (fabricante: Fabricante) => {
    onSelect(fabricante)
    setSearchTerm(fabricante.fantasia || fabricante.razao_social || `Fabricante ${fabricante.id}`)
    setShowSuggestions(false)
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
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum fabricante encontrado'}
            </div>
          ) : (
            suggestions.map((fabricante) => (
              <div
                key={fabricante.id}
                onClick={() => handleSelectFabricante(fabricante)}
                className="p-2 hover:bg-default-100 cursor-pointer border-b last:border-0"
              >
                <div className="font-medium">{fabricante.fantasia || "Nome Fantasia não informado"}</div>
                {fabricante.razao_social && (
                  <div className="text-sm text-default-500 truncate">{fabricante.razao_social}</div>
                )}
                {fabricante.cnpj && (
                  <div className="text-xs text-default-400">{fabricante.cnpj}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
