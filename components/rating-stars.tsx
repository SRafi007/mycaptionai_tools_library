export default function RatingStars({
    score,
    count,
}: {
    score: number;
    count?: number;
}) {
    const fullStars = Math.floor(score);
    const hasHalf = score - fullStars >= 0.25 && score - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="rating-stars" title={`${score.toFixed(1)} out of 5`}>
            <div className="rating-stars-icons">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <svg key={`f${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#EAB308">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
                {hasHalf && (
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="halfGrad">
                                <stop offset="50%" stopColor="#EAB308" />
                                <stop offset="50%" stopColor="#3F3F46" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill="url(#halfGrad)"
                        />
                    </svg>
                )}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <svg key={`e${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#3F3F46">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
            </div>
            {score > 0 && (
                <span className="rating-stars-score">{score.toFixed(1)}</span>
            )}
            {count !== undefined && count > 0 && (
                <span className="rating-stars-count">({count})</span>
            )}
        </div>
    );
}
