import React, { useEffect, useState } from 'react';
import BookService from '../../services/BookService';
import Spinner from '../Spinner/Spinner';
import './Winners.css';

interface Winner {
    _id: string;
    bookNumber: string;
    name: string;
    phone: string;
    wonDate: string;
    wonMonth: string;
    prizeNumber: number;
}

const Winners: React.FC = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMonth, setActiveMonth] = useState<string>('');

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const response: any = await BookService.getWinners();
                if (response.success && response.data) {
                    setWinners(response.data);
                } else if (Array.isArray(response)) {
                    setWinners(response);
                }
            } catch (error) {
                console.error("Error fetching winners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWinners();
    }, []);

    const groupedWinners = winners.reduce((acc, winner) => {
        const month = winner.wonMonth ? `Month ${winner.wonMonth}` : 'Unknown Month';
        if (!acc[month]) acc[month] = [];
        acc[month].push(winner);
        return acc;
    }, {} as Record<string, Winner[]>);

    const monthsList = Object.keys(groupedWinners).sort((a, b) => {
        return a.localeCompare(b);
    });

    useEffect(() => {
        if (monthsList.length > 0 && !activeMonth) {
            setActiveMonth(monthsList[0]);
        }
    }, [monthsList, activeMonth]);

    return (
        <div className="winners-page fade-in-up">
            <div className="winners-header-actions">
                <div>
                    <h2>🏆 Monthly Winners</h2>
                    {/* <p className="subtitle">All the lucky winners so far</p> */}
                </div>
            </div>

            <div className="winners-container">
                {loading && <Spinner />}
                {!loading && winners.length === 0 ? (
                    <div className="glass-card empty-state">No winners yet.</div>
                ) : !loading && (
                    <>
                        <div className="month-tabs">
                            {monthsList.map(month => (
                                <button
                                    key={month}
                                    className={`month-tab ${activeMonth === month ? 'active' : ''}`}
                                    onClick={() => setActiveMonth(month)}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>

                        <div className="month-group glass-card">
                            <h3 className="month-title">{activeMonth} Winners</h3>
                            <div className="table-responsive">
                                <table className="books-table">
                                    <thead>
                                        <tr>
                                            <th>Book No.</th>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Won Date</th>
                                            <th>Prize Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedWinners[activeMonth]?.map(winner => (
                                            <tr key={winner._id}>
                                                <td><span className="book-id-badge">#{winner.bookNumber}</span></td>
                                                <td>
                                                    <div className="book-name-cell">
                                                        <div className="avatar-small">
                                                            {winner.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="fw-bold">{winner.name}</span>
                                                    </div>
                                                </td>
                                                <td>{winner.phone}</td>
                                                <td>{winner.wonDate ? new Date(winner.wonDate).toLocaleDateString() : '—'}</td>
                                                <td>
                                                    {winner.prizeNumber ? (
                                                        <span className="prize-value">Prize {winner.prizeNumber}</span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Winners;
