import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function TicketList({ refreshTrigger, onTicketUpdated }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        priority: '',
        status: ''
    });

    useEffect(() => { fetchTickets(); }, [filters]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('tickets/', { params: filters });
            setTickets(response.data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await apiClient.patch(`tickets/${ticketId}/`, { status: newStatus });
            
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
            
            if (onTicketUpdated) onTicketUpdated();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Could not update ticket status.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-base-200 p-4 rounded-lg flex flex-wrap gap-4 items-end">
                <div className="form-control flex-1 min-w-[200px]">
                    <label className="label"><span className="label-text">Search</span></label>
                    <input 
                        type="text" 
                        name="search"
                        placeholder="Search title or description..." 
                        className="input input-bordered w-full"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
                
                <div className="form-control w-full sm:w-auto">
                    <label className="label"><span className="label-text">Category</span></label>
                    <select name="category" className="select select-bordered" value={filters.category} onChange={handleFilterChange}>
                        <option value="">All Categories</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="account">Account</option>
                        <option value="general">General</option>
                    </select>
                </div>

                <div className="form-control w-full sm:w-auto">
                    <label className="label"><span className="label-text">Priority</span></label>
                    <select name="priority" className="select select-bordered" value={filters.priority} onChange={handleFilterChange}>
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                <div className="form-control w-full sm:w-auto">
                    <label className="label"><span className="label-text">Status</span></label>
                    <select name="status" className="select select-bordered" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
            ) : tickets.length === 0 ? (
                <div className="text-center p-10 bg-base-100 rounded-lg shadow border border-base-200 text-gray-500">
                    No tickets found matching your filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
                            <div className="card-body p-5 flex flex-col sm:flex-row gap-4 justify-between">
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="card-title text-lg m-0">{ticket.title}</h3>
                                        {/* Status Badge */}
                                        <span className={`badge badge-sm ${
                                            ticket.status === 'open' ? 'badge-error' : 
                                            ticket.status === 'in_progress' ? 'badge-warning' : 
                                            ticket.status === 'resolved' ? 'badge-success' : 'badge-neutral'
                                        }`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {ticket.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 items-center">
                                        <span className="font-semibold uppercase tracking-wider text-primary">{ticket.category}</span>
                                        <span>•</span>
                                        <span className={`font-semibold uppercase tracking-wider ${ticket.priority === 'critical' ? 'text-red-500' : ''}`}>
                                            Priority: {ticket.priority}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-base-200 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 min-w-[150px]">
                                    <label className="text-xs font-semibold text-gray-500 mb-1">Update Status:</label>
                                    <select 
                                        className="select select-bordered select-sm w-full"
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}