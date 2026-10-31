import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { type SyntheticEvent } from 'react';

import { Navbar } from '@/components/navbar/navbar';
import type { PageProps } from '@/types';

interface ForgotPasswordProps extends PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ForgotPassword() {
    const { flash } = usePage<ForgotPasswordProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit = (event: SyntheticEvent) => {
        event.preventDefault();
        post('/forgot-password', { onFinish: () => reset('email') });
    };

    return (
        <>
            <Head title="Forgot password" />

            <div className="auth-page flex min-h-dvh flex-col bg-background text-foreground">
                <Navbar showNavigationLinks={false} />

                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-sm border border-border bg-card p-6 sm:p-8">
                        <p className="eyebrow mb-3">Portfolio / Admin</p>
                        <h1 className="font-display text-3xl font-medium tracking-tight">
                            Reset your password
                        </h1>
                        <p className="mt-2 mb-7 text-sm leading-6 text-muted-foreground">
                            Enter the email address for your administrator
                            account and we will send you a reset link.
                        </p>

                        {flash?.success ? (
                            <p
                                role="status"
                                className="mb-5 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                            >
                                {flash.success}
                            </p>
                        ) : null}

                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-card-foreground"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    aria-invalid={!!errors.email}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-shadow outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                />
                                {errors.email ? (
                                    <p
                                        id="email-error"
                                        role="alert"
                                        className="mt-2 text-sm text-destructive"
                                    >
                                        {errors.email}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                {processing ? 'Sending...' : 'Send reset link'}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
