import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDebounce } from 'usehooks-ts'
import { useGeolocation } from '@/hooks/useGeolocation'
import { track } from '@vercel/analytics'
import { Select } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import UnifiedRestaurantsGrid from './UnifiedRestaurantsGrid'
import OptimizedFiltersManager from './OptimizedFiltersManager'
import SearchBar from './SearchBar'

interface UnifiedRestaurantsTabProps {
  searchQuery?: string
  userLat?: number
  userLng?: number
  maxDistance?: number
  onLocationChange?: (lat: number, lng: number) => void
  filterKey?: string
}

export default function UnifiedRestaurantsTab({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  onLocationChange,
  filterKey = 'unified'
}: UnifiedRestaurantsTabProps) {
  const searchParams = useSearchParams()
  const [isHighRated, setIsHighRated] = useState(false)
  const [isOpenNow, setIsOpenNow] = useState(false)
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'favorites'>('distance')
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([])
  const [selectedDietCategories, setSelectedDietCategories] = useState<string[]>([])
  const [distance, setDistance] = useState<number>(maxDistance)
  const debouncedDistance = useDebounce(distance, 500)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const {
    location: geolocation,
    loading: geolocationLoading,
    error: geolocationError,
    enableLocation,
    disableLocation
  } = useGeolocation()

  // Update locationEnabled state based on geolocation status
  useEffect(() => {
    if (geolocationLoading) return

    if (geolocationError) {
      console.warn('Geolocation error:', geolocationError)
      setLocationEnabled(false)
    } else if (geolocation) {
      setLocationEnabled(true)
    }
  }, [geolocation, geolocationLoading, geolocationError])

  // Function to handle enabling location
  const handleEnableLocation = async () => {
    const success = await enableLocation()
    if (success) {
      setLocationEnabled(true)
      track('enable_location', { filterKey })
    }
  }

  // Function to handle disabling location
  const handleDisableLocation = () => {
    disableLocation()
    setLocationEnabled(false)
    track('disable_location', { filterKey })
  }

  // Update parent component when location changes
  useEffect(() => {
    if (geolocation?.latitude && geolocation?.longitude) {
      onLocationChange?.(geolocation.latitude, geolocation.longitude)
    }
  }, [geolocation?.latitude, geolocation?.longitude, onLocationChange])

  // Track filter changes
  useEffect(() => {
    track('filter_restaurants', {
      searchQuery,
      distance: debouncedDistance,
      isHighRated,
      isOpenNow,
      sortBy,
      selectedCuisines,
      selectedPriceRanges,
      selectedEstablishmentTypes,
      selectedDietCategories,
      filterKey
    })
  }, [
    searchQuery,
    debouncedDistance,
    isHighRated,
    isOpenNow,
    sortBy,
    selectedCuisines,
    selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietCategories,
    filterKey
  ])

  return (
    <div className="space-y-6">
      {/* Search and filters section */}
      <div className="space-y-4">
        {/* Search bar */}
        <SearchBar />

        {/* Unified Filters Manager */}
        <OptimizedFiltersManager
          selectedCuisines={selectedCuisines}
          onCuisineChange={setSelectedCuisines}
          selectedPriceRanges={selectedPriceRanges}
          onPriceRangeChange={setSelectedPriceRanges}
          selectedEstablishmentTypes={selectedEstablishmentTypes}
          onEstablishmentTypeChange={setSelectedEstablishmentTypes}
          selectedDietCategories={selectedDietCategories}
          onDietCategoryChange={setSelectedDietCategories}
          userLat={userLat}
          userLng={userLng}
        />

        {/* Additional filters row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort selector */}
          <Select
            label="Ordenar por"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'favorites')}
            options={[
              { value: 'distance', label: 'Distancia' },
              { value: 'rating', label: 'Rating' },
              { value: 'favorites', label: 'Favoritos' }
            ]}
          />

          {/* High rated filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="high-rated"
              checked={isHighRated}
              onCheckedChange={(checked) => setIsHighRated(checked as boolean)}
            />
            <Label htmlFor="high-rated" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Solo alta calificación
            </Label>
          </div>

          {/* Open now filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open-now"
              checked={isOpenNow}
              onCheckedChange={(checked) => setIsOpenNow(checked as boolean)}
            />
            <Label htmlFor="open-now" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Abierto ahora
            </Label>
          </div>
        </div>
      </div>

      {/* Results section */}
      <UnifiedRestaurantsGrid
        searchQuery={searchQuery}
        userLat={userLat}
        userLng={userLng}
        maxDistance={maxDistance}
        cuisineTypeIds={selectedCuisines}
        priceRanges={selectedPriceRanges}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        selectedDietCategories={selectedDietCategories}
        isHighRated={isHighRated}
        isOpenNow={isOpenNow}
        sortBy={sortBy}
        onDietCategoryChange={setSelectedDietCategories}
      />
    </div>
  )
}
