import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function StatsDashboard({ refreshTrigger }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [refreshTrigger]);

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('tickets/stats/');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Overview</h2>
            
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full border border-base-200">
                <div className="stat text-center">
                    <div className="stat-title">Total Tickets</div>
                    <div className="stat-value">{stats.total_tickets}</div>
                    <div className="stat-desc">All time</div>
                </div>
                
                <div className="stat text-center">
                    <div className="stat-title">Open Tickets</div>
                    <div className="stat-value text-error">{stats.open_tickets}</div>
                    <div className="stat-desc">Requires attention</div>
                </div>
                
                <div className="stat text-center">
                    <div className="stat-title">Avg / Day</div>
                    <div className="stat-value text-primary">{stats.avg_tickets_per_day}</div>
                    <div className="stat-desc">Since first ticket</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="card bg-base-100 shadow border border-base-200">
                    <div className="card-body p-5">
                        <h3 className="card-title text-sm text-gray-500 uppercase tracking-wider border-b pb-2">By Category</h3>
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center text-sm"><span>Technical</span> <span className="badge badge-neutral">{stats.category_breakdown.technical}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>Billing</span> <span className="badge badge-neutral">{stats.category_breakdown.billing}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>Account</span> <span className="badge badge-neutral">{stats.category_breakdown.account}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>General</span> <span className="badge badge-neutral">{stats.category_breakdown.general}</span></div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow border border-base-200">
                    <div className="card-body p-5">
                        <h3 className="card-title text-sm text-gray-500 uppercase tracking-wider border-b pb-2">By Priority</h3>
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center text-sm"><span>Critical</span> <span className="badge badge-error">{stats.priority_breakdown.critical}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>High</span> <span className="badge badge-warning">{stats.priority_breakdown.high}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>Medium</span> <span className="badge badge-info">{stats.priority_breakdown.medium}</span></div>
                            <div className="flex justify-between items-center text-sm"><span>Low</span> <span className="badge badge-success">{stats.priority_breakdown.low}</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}