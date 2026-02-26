import React, { useState } from "react";
import type { CarFilters as CarFiltersType, CarStats } from "../../types";
import "./CarFilters.css";

interface CarFiltersProps {
    filters: CarFiltersType;
    onFilterChange: (filters: CarFiltersType) => void;
    stats: CarStats;
}

const CarFilters: React.FC<CarFiltersProps> = ({ filters, onFilterChange, stats }) => {
    const [localFilters, setLocalFilters] = useState<CarFiltersType>(filters)

    const handleInputChange = (field: keyof CarFiltersType, value: string | number | undefined): void => {
        const newFilters = { ...localFilters, [field]: value || undefined }
        setLocalFilters(newFilters)
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        onFilterChange(localFilters)
    }

    const handleReset = (): void => {
        setLocalFilters({})
        onFilterChange({})
    }

    // Получаем модели для выбранного бренда
    const availableModels = localFilters.brand
        ? stats.models[localFilters.brand] || []
        : []

    return (
        <form className="car-filters" onSubmit={handleSubmit}>
            <div className="filters-grid">
                {/* Бренд */}
                <div className="filter-group">
                    <label htmlFor="brand">Марка</label>
                    <select
                        id="brand"
                        value={localFilters.brand || ''}
                        onChange={(e) => {
                            handleInputChange('brand', e.target.value)
                            handleInputChange('model', undefined) // Сбросить модель при смене бренда
                        }}
                    >
                        <option value="">Все марки</option>
                        {stats.brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                {/* Модель */}
                <div className="filter-group">
                    <label htmlFor="model">Модель</label>
                    <select
                        id="model"
                        value={localFilters.model || ''}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        disabled={!localFilters.brand}
                    >
                        <option value="">Все модели</option>
                        {availableModels.map((model) => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>

                {/* Цена от */}
                <div className="filter-group">
                    <label htmlFor="minPrice">Цена от (₽)</label>
                    <input
                        type="number"
                        id="minPrice"
                        value={localFilters.minPrice || ''}
                        onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`от ${stats.priceRange.min.toLocaleString()}`}
                    />
                </div>

                {/* Цена до */}
                <div className="filter-group">
                    <label htmlFor="maxPrice">Цена до (₽)</label>
                    <input
                        type="number"
                        id="maxPrice"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`до ${stats.priceRange.max.toLocaleString()}`}
                    />
                </div>

                {/* Год от */}
                <div className="filter-group">
                    <label htmlFor="minYear">Год от</label>
                    <input
                        type="number"
                        id="minYear"
                        value={localFilters.minYear || ''}
                        onChange={(e) => handleInputChange('minYear', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`от ${stats.yearRange.min}`}
                    />
                </div>

                {/* Год до */}
                <div className="filter-group">
                    <label htmlFor="maxYear">Год до</label>
                    <input
                        type="number"
                        id="maxYear"
                        value={localFilters.maxYear || ''}
                        onChange={(e) => handleInputChange('maxYear', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`до ${stats.yearRange.max}`}
                    />
                </div>

                {/* Цвет */}
                <div className="filter-group">
                    <label htmlFor="color">Цвет</label>
                    <select
                        id="color"
                        value={localFilters.color || ''}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                    >
                        <option value="">Все цвета</option>
                        {stats.colors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                </div>

                {/* КПП */}
                <div className="filter-group">
                    <label htmlFor="transmission">КПП</label>
                    <select
                        id="transmission"
                        value={localFilters.transmission || ''}
                        onChange={(e) => handleInputChange('transmission', e.target.value)}
                    >
                        <option value="">Все типы</option>
                        {stats.transmissions.map((trans) => (
                            <option key={trans} value={trans}>{trans}</option>
                        ))}
                    </select>
                </div>

                {/* Тип топлива */}
                <div className="filter-group">
                    <label htmlFor="fuel_type">Топливо</label>
                    <select
                        id="fuel_type"
                        value={localFilters.fuel_type || ''}
                        onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                    >
                        <option value="">Все типы</option>
                        {stats.fuelTypes.map((fuel) => (
                            <option key={fuel} value={fuel}>{fuel}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-actions">
                <button type="submit">Применить</button>
                <button type="button" onClick={handleReset}>Сбросить</button>
            </div>
        </form>
    )
}

export default CarFilters
