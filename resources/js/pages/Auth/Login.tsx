import { SyntheticEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Navbar } from '@/components/navbar/navbar';
import { cn } from '@/lib/utils';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e: SyntheticEvent) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="auth-page flex min-h-dvh flex-col bg-background text-foreground">
                <Navbar showNavigationLinks={false} />

                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-sm border border-border bg-card p-6 sm:p-8">
                        <p className="eyebrow mb-3">Portfolio / Admin</p>
                        <h1 className="font-display text-3xl font-medium tracking-tight">Sign in</h1>
                        <p className="mt-2 mb-7 text-sm leading-6 text-muted-foreground">Use your administrator account to manage portfolio content.</p>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            {/* Email */}
                            <Field label="Email address" htmlFor="email" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    invalid={!!errors.email}
                                    describedBy={errors.email ? 'email-error' : undefined}
                                />
                            </Field>

                            {/* Password */}
                            <Field label="Password" htmlFor="password" error={errors.password}>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        invalid={!!errors.password}
                                        describedBy={errors.password ? 'password-error' : undefined}
                                        className="pr-11"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </Field>

                            {/* Remember me */}
                            <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                Remember me
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                {processing ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

/* ---------------- helpers ---------------- */

function Field({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-card-foreground">
                {label}
            </label>
            {children}
            {error && (
                <p id={`${htmlFor}-error`} role="alert" className="mt-2 text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function Input({
    invalid,
    describedBy,
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
    describedBy?: string;
}) {
    return (
        <input
            {...props}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn(
                'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none',
                'placeholder:text-muted-foreground transition-shadow',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                className
            )}
        />
    );
}
