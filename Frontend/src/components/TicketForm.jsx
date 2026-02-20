import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function TicketForm({ onTicketCreated }) {
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: 'general',
            priority: 'low',
        }
    });

    const [isClassifying, setIsClassifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleDescriptionBlur = async () => {
        const description = getValues('description');
        
        if (!description || description.trim().length < 10) return;

        setIsClassifying(true);
        
        try {
            const response = await apiClient.post('tickets/classify/', { description });
            console.log("LLM Classification response:", response.data);
            const { suggested_category, suggested_priority } = response.data;

            if (suggested_category) setValue('category', suggested_category);
            if (suggested_priority) setValue('priority', suggested_priority);
        } catch (error) {
            console.error("LLM Classification failed:", error);
        } finally {
            setIsClassifying(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('tickets/', data);
            navigate('/');
            reset();
            
            if (onTicketCreated) onTicketCreated(); 
        } catch (error) {
            console.error("Ticket submission failed:", error);
            alert("Failed to create ticket. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Submit a Ticket</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-bold">Title*</span></label>
                        <input 
                            type="text" 
                            placeholder="Brief summary of the issue" 
                            className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                            {...register('title', { required: true, maxLength: 200 })}
                        />
                        {errors.title && <span className="text-error text-sm mt-1">Title is required (max 200 chars).</span>}
                    </div>

                    <div className="form-control w-full flex flex-col">
                        <label className="label">
                            <span className="label-text font-bold">Description*</span>
                            {isClassifying && <span className="label-text-alt text-primary flex items-center gap-2">
                                <span className="loading loading-spinner loading-xs"></span> AI Classifying...
                            </span>}
                        </label>
                        <textarea 
                            className={`textarea textarea-bordered h-24 w-full ${errors.description ? 'textarea-error' : ''}`}
                            placeholder="Describe your problem in detail... (Click outside when done to auto-categorize!)"
                            {...register('description', { required: true })}
                            onBlur={handleDescriptionBlur}
                        ></textarea>
                        {errors.description && <span className="text-error text-sm mt-1">Description is required.</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text font-bold">Category</span></label>
                            <select className="select select-bordered w-full" {...register('category')}>
                                <option value="billing">Billing</option>
                                <option value="technical">Technical</option>
                                <option value="account">Account</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        <div className="form-control w-full">
                            <label className="label"><span className="label-text font-bold">Priority</span></label>
                            <select className="select select-bordered w-full" {...register('priority')}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSubmitting || isClassifying}>
                            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}