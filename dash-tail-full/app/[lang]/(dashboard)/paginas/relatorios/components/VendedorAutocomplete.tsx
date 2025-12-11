'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Vendedor {
  id: number
  apelido?: string
  nome?: string
  cpf?: string
}

interface VendedorAutocompleteProps {
  value: Vendedor | null | string
  onSelect?: (vendedor: Vendedor | null) => void
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function VendedorAutocomplete({
  value,
  onSelect,
  onChange,
  placeholder = 'Buscar vendedor...',
  disabled = false,
  className = ''
}: VendedorAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        setSearchTerm(value)
      } else {
        setSearchTerm(value.apelido || value.nome || `Vendedor ${value.id}`)
      }
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

  // Buscar vendedores do backend
  const fetchVendedores = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      const url = `/api/paginas/cadastros/vendedor/search?query=${encodeURIComponent(query)}`
      const response = await fetch(url)

      if (!response.ok) {
        // Fallback para endpoint tradicional se o endpoint de busca não existir
        const fallbackResponse = await fetch('/api/paginas/cadastros/vendedor')
        if (!fallbackResponse.ok) {
          throw new Error('Erro ao buscar vendedores')
        }

        const allData = await fallbackResponse.json()

        // Filtrar os vendedores no cliente
        const filteredData = allData.filter((vend: Vendedor) => {
          const apelido = vend.apelido?.toLowerCase() || ''
          const nome = vend.nome?.toLowerCase() || ''
          const cpf = vend.cpf?.toLowerCase() || ''
          const termo = query.toLowerCase()

          return apelido.includes(termo) || nome.includes(termo) || cpf.includes(termo)
        })

        setSuggestions(filteredData)
        setHighlightedIndex(-1)
        return
      }

      const data = await response.json()
      setSuggestions(data)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error)

      // Em caso de falha na busca, tentar obter todos os vendedores e filtrar no cliente
      try {
        const fallbackResponse = await fetch('/api/paginas/cadastros/vendedor')
        if (fallbackResponse.ok) {
          const allData = await fallbackResponse.json()
          const filteredData = allData.filter((vend: Vendedor) => {
            const apelido = vend.apelido?.toLowerCase() || ''
            const nome = vend.nome?.toLowerCase() || ''
            const cpf = vend.cpf?.toLowerCase() || ''
            const termo = query.toLowerCase()

            return apelido.includes(termo) || nome.includes(termo) || cpf.includes(termo)
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
      fetchVendedores(searchTerm)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, showSuggestions])

  // Limpar a seleção
  const handleClear = () => {
    setSearchTerm('')
    if (onSelect) onSelect(null)
    if (onChange) onChange('')
    setSuggestions([])
    setHighlightedIndex(-1)
  }

  // Selecionar um vendedor
  const handleSelectVendedor = (vendedor: Vendedor) => {
    if (onSelect) onSelect(vendedor)
    if (onChange) onChange(vendedor.id.toString())
    setSearchTerm(vendedor.apelido || vendedor.nome || `Vendedor ${vendedor.id}`)
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
      handleSelectVendedor(suggestions[highlightedIndex])
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
            if (e.target.value === '') {
              if (onSelect) onSelect(null)
              if (onChange) onChange('')
            }
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
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum vendedor encontrado'}
            </div>
          ) : (
            suggestions.map((vendedor, index) => (
              <div
                key={vendedor.id}
                onClick={() => handleSelectVendedor(vendedor)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-2 cursor-pointer border-b last:border-0 ${
                  highlightedIndex === index ? 'bg-default-100' : 'hover:bg-default-50'
                }`}
              >
                <div className="font-medium">{vendedor.apelido || "Apelido não informado"}</div>
                {vendedor.nome && (
                  <div className="text-sm text-default-400 truncate">{vendedor.nome}</div>
                )}
                {vendedor.cpf && (
                  <div className="text-xs text-default-400">{vendedor.cpf}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
