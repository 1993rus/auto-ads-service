import React from "react";
import { Link } from "react-router-dom";
import type { Car } from "../../types";
import "./CarCard.css";

interface CarCardProps {
    car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
    const [imageError, setImageError] = React.useState(false)

    return (
        <Link to={`/cars/${car.id}`} className="car-card">
            <div className="car-card-image">
                {car.image_url && !imageError ? (
                    <img
                        src={car.image_url}
                        alt={`${car.brand} ${car.model}`}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="car-card-image-placeholder">
                        Нет изображения
                    </div>
                )}
            </div>

            <div className="car-card-content">
                <h3 className="car-card-title">
                    {car.brand} {car.model}
                </h3>

                <p className="car-card-year">{car.year} год</p>

                <p className="car-card-price">
                    {car.price.toLocaleString('ru-RU')} ₽
                </p>

                <div className="car-card-details">
                    <span>{car.mileage.toLocaleString()} км</span>
                    <span>{car.transmission}</span>
                    <span>{car.fuel_type}</span>
                </div>

                <p className="car-card-location">{car.location}</p>
            </div>
        </Link>
    )
}

export default CarCard
