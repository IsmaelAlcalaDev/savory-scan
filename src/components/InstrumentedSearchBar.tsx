
import { useEffect } from 'react'
import SearchBar from './SearchBar'
import { useAnalytics } from '@/hooks/useAnalytics'

interface InstrumentedSearchBarProps {
  onSearch: (query: string, location?: string) => void
  placeholder?: string
  defaultQuery?: string
  defaultLocation?: string
  showLocationFilter?: boolean
  className?: string
}

export default function InstrumentedSearchBar(props: InstrumentedSearchBarProps) {
  const { trackSearch } = useAnalytics()

  const handleSearch = (query: string, location?: string) => {
    // Track the search event
    trackSearch(query, { location })
    
    // Call the original handler
    props.onSearch(query, location)
  }

  return <SearchBar {...props} onSearch={handleSearch} />
}
