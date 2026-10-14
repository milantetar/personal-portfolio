import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Login</h2>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="mt-1 w-full rounded border px-3 py-2"
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="mt-1 w-full rounded border px-3 py-2"
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
}