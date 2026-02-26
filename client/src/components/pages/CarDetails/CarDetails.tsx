import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { $api } from "../../../utils/axios.instance";
import type { Car } from "../../../types";
import "./CarDetails.css";

const CarDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [car, setCar] = useState<Car | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (!id) {
            setError('ID автомобиля не указан')
            setLoading(false)
            return
        }

        $api.get<Car>(`/cars/${id}`)
            .then((res) => {
                setCar(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Ошибка загрузки автомобиля:', err)
                if (err.response?.status === 404) {
                    setError('Автомобиль не найден')
                } else {
                    setError('Не удалось загрузить данные автомобиля')
                }
                setLoading(false)
            })
    }, [id])

    if (loading) {
        return <div className="car-details-loading">Загрузка...</div>
    }

    if (error || !car) {
        return (
            <div className="car-details-error">
                <p>{error}</p>
                <button onClick={() => navigate('/cars')}>Вернуться к каталогу</button>
            </div>
        )
    }

    return (
        <div className="car-details-container">
            <Link to="/cars" className="car-details-back">← Вернуться к каталогу</Link>

            <div className="car-details-content">
                <div className="car-details-image">
                    {car.image_url && !imageError ? (
                        <img
                            src={car.image_url}
                            alt={`${car.brand} ${car.model}`}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="car-details-image-placeholder">
                            Нет изображения
                        </div>
                    )}
                </div>

                <div className="car-details-info">
                    <h1>{car.brand} {car.model}</h1>
                    <p className="car-details-price">{car.price.toLocaleString('ru-RU')} ₽</p>

                    <div className="car-details-specs">
                        <div className="spec-row">
                            <span className="spec-label">Год выпуска:</span>
                            <span className="spec-value">{car.year}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Пробег:</span>
                            <span className="spec-value">{car.mileage.toLocaleString()} км</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Коробка передач:</span>
                            <span className="spec-value">{car.transmission}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Тип топлива:</span>
                            <span className="spec-value">{car.fuel_type}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Кузов:</span>
                            <span className="spec-value">{car.body_type}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Цвет:</span>
                            <span className="spec-value">{car.color}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Местоположение:</span>
                            <span className="spec-value">{car.location}</span>
                        </div>
                    </div>

                    {car.description && (
                        <div className="car-details-description">
                            <h2>Описание</h2>
                            <p>{car.description}</p>
                        </div>
                    )}

                    {car.url && (
                        <a
                            href={car.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="car-details-link"
                        >
                            Посмотреть оригинальное объявление →
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CarDetails
