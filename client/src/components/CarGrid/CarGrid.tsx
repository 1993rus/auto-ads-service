import React from "react";
import type { Car } from "../../types";
import CarCard from "../CarCard/CarCard";
import "./CarGrid.css";

interface CarGridProps {
    cars: Car[];
}

const CarGrid: React.FC<CarGridProps> = ({ cars }) => {
    return (
        <div className="car-grid">
            {cars.map((car) => (
                <CarCard key={car.id} car={car} />
            ))}
        </div>
    )
}

export default CarGrid
