import React from "react";
import "./Pagination.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Генерируем массив номеров страниц для отображения
    const getPageNumbers = (): number[] => {
        const delta = 2 // Количество страниц до и после текущей
        const pages: number[] = []

        for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
            pages.push(i)
        }

        return pages
    }

    const pageNumbers = getPageNumbers()

    if (totalPages <= 1) {
        return null // Не показываем пагинацию если только одна страница
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
            >
                ← Предыдущая
            </button>

            <div className="pagination-numbers">
                {currentPage > 3 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="pagination-number">
                            1
                        </button>
                        {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                        <button onClick={() => onPageChange(totalPages)} className="pagination-number">
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
            >
                Следующая →
            </button>
        </div>
    )
}

export default Pagination
