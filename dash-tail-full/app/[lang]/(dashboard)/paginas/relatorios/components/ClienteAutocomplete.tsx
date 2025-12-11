'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Cliente {
  id: number
  fantasia?: string
  razao_social?: string
  cnpj?: string
}

interface ClienteAutocompleteProps {
  value: Cliente | null
  onSelect: (cliente: Cliente | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ClienteAutocomplete({
  value,
  onSelect,
  placeholder = 'Buscar cliente...',
  disabled = false,
  className = ''
}: ClienteAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atualizar o termo de busca quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      setSearchTerm(value.fantasia || value.razao_social || `Cliente ${value.id}`)
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

  // Buscar clientes do backend
  const fetchClientes = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      const url = `/api/paginas/cadastros/cliente/search?query=${encodeURIComponent(query)}`
      const response = await fetch(url)

      if (!response.ok) {
        // Fallback para endpoint tradicional se o endpoint de busca não existir
        const fallbackResponse = await fetch('/api/paginas/cadastros/cliente')
        if (!fallbackResponse.ok) {
          throw new Error('Erro ao buscar clientes')
        }

        const allData = await fallbackResponse.json()

        // Filtrar os clientes no cliente
        const filteredData = allData.filter((cli: Cliente) => {
          const fantasia = cli.fantasia?.toLowerCase() || ''
          const razaoSocial = cli.razao_social?.toLowerCase() || ''
          const cnpj = cli.cnpj?.toLowerCase() || ''
          const termo = query.toLowerCase()

          return fantasia.includes(termo) || razaoSocial.includes(termo) || cnpj.includes(termo)
        })

        setSuggestions(filteredData)
        setHighlightedIndex(-1)
        return
      }

      const data = await response.json()
      setSuggestions(data)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)

      // Em caso de falha na busca, tentar obter todos os clientes e filtrar no cliente
      try {
        const fallbackResponse = await fetch('/api/paginas/cadastros/cliente')
        if (fallbackResponse.ok) {
          const allData = await fallbackResponse.json()
          const filteredData = allData.filter((cli: Cliente) => {
            const fantasia = cli.fantasia?.toLowerCase() || ''
            const razaoSocial = cli.razao_social?.toLowerCase() || ''
            const cnpj = cli.cnpj?.toLowerCase() || ''
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
      setHighlightedIndex(-1)
    } finally {
      setLoading(false)
    }
  }

  // Debounce para a busca
  useEffect(() => {
    if (!showSuggestions) return

    const handler = setTimeout(() => {
      fetchClientes(searchTerm)
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

  // Selecionar um cliente
  const handleSelectCliente = (cliente: Cliente) => {
    onSelect(cliente)
    setSearchTerm(cliente.fantasia || cliente.razao_social || `Cliente ${cliente.id}`)
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
      handleSelectCliente(suggestions[highlightedIndex])
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
              {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres' : 'Nenhum cliente encontrado'}
            </div>
          ) : (
            suggestions.map((cliente, index) => (
              <div
                key={cliente.id}
                onClick={() => handleSelectCliente(cliente)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-2 cursor-pointer border-b last:border-0 ${
                  highlightedIndex === index ? 'bg-default-100' : 'hover:bg-default-50'
                }`}
              >
                <div className="font-medium">{cliente.fantasia || "Nome Fantasia não informado"}</div>
                {cliente.razao_social && (
                  <div className="text-sm text-default-400 truncate">{cliente.razao_social}</div>
                )}
                {cliente.cnpj && (
                  <div className="text-xs text-default-400">{cliente.cnpj}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
