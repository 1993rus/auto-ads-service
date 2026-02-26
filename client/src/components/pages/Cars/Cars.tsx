import React, { useEffect, useState } from "react";
import { $api } from "../../../utils/axios.instance";
import type { CarsResponse, CarFilters, CarStats } from "../../../types";
import CarFilters from "../../CarFilters/CarFilters";
import CarGrid from "../../CarGrid/CarGrid";
import Pagination from "../../Pagination/Pagination";
import "./Cars.css";

const Cars: React.FC = () => {
    const [cars, setCars] = useState<CarsResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [filters, setFilters] = useState<CarFilters>({})
    const [page, setPage] = useState<number>(1)
    const [stats, setStats] = useState<CarStats | null>(null)
    const limit = 20

    // Загрузка статистики для фильтров (один раз при монтировании)
    useEffect(() => {
        $api.get<CarStats>('/cars/stats')
            .then((res) => {
                setStats(res.data)
            })
            .catch((err) => {
                console.error('Ошибка загрузки статистики:', err)
            })
    }, [])

    // Загрузка автомобилей при изменении фильтров или страницы
    useEffect(() => {
        setLoading(true)
        setError('')

        // Формируем query параметры
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        if (filters.brand) params.append('brand', filters.brand)
        if (filters.model) params.append('model', filters.model)
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
        if (filters.minYear) params.append('minYear', filters.minYear.toString())
        if (filters.maxYear) params.append('maxYear', filters.maxYear.toString())
        if (filters.color) params.append('color', filters.color)
        if (filters.transmission) params.append('transmission', filters.transmission)
        if (filters.fuel_type) params.append('fuel_type', filters.fuel_type)

        $api.get<CarsResponse>(`/cars?${params.toString()}`)
            .then((res) => {
                setCars(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Ошибка загрузки автомобилей:', err)
                setError('Не удалось загрузить автомобили. Попробуйте позже.')
                setLoading(false)
            })
    }, [filters, page])

    const handleFilterChange = (newFilters: CarFilters): void => {
        setFilters(newFilters)
        setPage(1) // При изменении фильтров сбрасываем на первую страницу
    }

    if (loading && !cars) {
        return <div className="cars-loading">Загрузка автомобилей...</div>
    }

    if (error && !cars) {
        return <div className="cars-error">{error}</div>
    }

    return (
        <div className="cars-container">
            <h1>Каталог автомобилей</h1>

            {stats && (
                <CarFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    stats={stats}
                />
            )}

            {loading && <div className="cars-loading">Загрузка...</div>}

            {!loading && error && <div className="cars-error">{error}</div>}

            {!loading && !error && cars && cars.cars.length > 0 ? (
                <>
                    <div className="cars-count">
                        Найдено: {cars.total} автомобилей
                    </div>

                    <CarGrid cars={cars.cars} />

                    <Pagination
                        currentPage={cars.page}
                        totalPages={cars.totalPages}
                        onPageChange={setPage}
                    />
                </>
            ) : !loading && !error && (
                <div className="cars-empty">
                    Автомобили не найдены. Попробуйте изменить фильтры.
                </div>
            )}
        </div>
    )
}

export default Cars
