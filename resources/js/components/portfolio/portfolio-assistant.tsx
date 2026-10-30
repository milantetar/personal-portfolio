import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Bot, LoaderCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AssistantResponse {
    answer?: string;
    message?: string;
}

interface PortfolioAssistantProps {
    enabled: boolean;
}

const starterMessage: Message = {
    role: 'assistant',
    content: "I can answer questions about Milan's experience, projects, skills, and certificates using the information on this portfolio.",
};

const suggestedQuestions = [
    'What Laravel projects has Milan built?',
    'What experience does Milan have?',
    'Which technologies does he use?',
];

export function PortfolioAssistant({ enabled }: PortfolioAssistantProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([starterMessage]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const endOfMessages = useRef<HTMLDivElement>(null);
    const previousMessageCount = useRef(messages.length);
    const reduceMotion = useReducedMotion() ?? false;

    useEffect(() => {
        if (messages.length === previousMessageCount.current) return;
        previousMessageCount.current = messages.length;
        endOfMessages.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
    }, [messages, reduceMotion]);

    const sendMessage = async (question: string) => {
        const content = question.trim();
        if (!content || isSending || !enabled) return;

        const history = messages.slice(1);
        if (history.at(-1)?.role === 'user') history.pop();
        const nextMessages = [...history, { role: 'user' as const, content }].slice(-12);
        setMessages((current) => [...current, { role: 'user' as const, content }]);
        setInput('');
        setError(null);
        setIsSending(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/portfolio-assistant', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ messages: nextMessages }),
            });
            const result = await response.json() as AssistantResponse;
            const answer = result.answer;

            if (!response.ok || typeof answer !== 'string' || !answer) {
                throw new Error(result.message || 'The assistant could not answer right now. Please try again.');
            }

            setMessages((current) => [...current, { role: 'assistant' as const, content: answer }].slice(-12));
        } catch (requestError) {
            setInput(content);
            setError(requestError instanceof Error ? requestError.message : 'The assistant could not answer right now. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendMessage(input);
    };

    const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void sendMessage(input);
        }
    };

    return (
        <section id="assistant" aria-labelledby="assistant-heading" className="portfolio-section portfolio-section--assistant portfolio-editorial-section scroll-mt-24 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="portfolio-section-inner flex flex-col gap-5 sm:gap-6">
                <header className="max-w-3xl">
                    <p className="eyebrow mb-2">Portfolio assistant</p>
                    <h2 id="assistant-heading" className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">Ask about my work</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">A quick way to explore Milan's experience, projects, tools, and credentials.</p>
                </header>

                <div className="portfolio-assistant-shell mx-auto w-full max-w-4xl overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
                        <span className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-background/60"><Bot className="size-4" aria-hidden="true" /></span>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">Milan's portfolio</h3>
                            <p className="text-xs text-muted-foreground">Answers are based on the published portfolio content.</p>
                        </div>
                        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={`size-1.5 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-muted-foreground'}`} aria-hidden="true" />
                            {enabled ? 'Configured' : 'Unavailable'}
                        </span>
                    </div>

                    <div className="flex max-h-[28rem] min-h-56 flex-col overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" aria-relevant="additions text">
                        <div className="space-y-5">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={`${message.role}-${index}`}
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="flex max-w-[92%] items-start gap-3 sm:max-w-[84%]">
                                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/50"><Bot className="size-3.5" aria-hidden="true" /></span>
                                            <p className="whitespace-pre-wrap py-1 text-sm leading-6 text-foreground">{message.content}</p>
                                        </div>
                                    ) : (
                                        <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl border border-border/70 bg-muted/65 px-4 py-2.5 text-sm leading-6 text-foreground sm:max-w-[82%]">{message.content}</p>
                                    )}
                                </motion.div>
                            ))}
                            {isSending ? (
                                <p className="flex items-center gap-2 pl-10 text-sm text-muted-foreground" role="status">
                                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Preparing an answer...
                                </p>
                            ) : null}
                            {!enabled ? (
                                <p className="ml-10 text-sm leading-6 text-muted-foreground">The assistant is temporarily unavailable. You can contact Milan using the email link below.</p>
                            ) : null}
                            {error ? <p className="ml-10 text-sm text-destructive" role="alert">{error}</p> : null}
                            {messages.length === 1 && enabled ? (
                                <div className="flex flex-wrap gap-2 pl-10 pt-1">
                                    {suggestedQuestions.map((question) => (
                                        <button key={question} type="button" disabled={isSending} onClick={() => void sendMessage(question)} className="rounded-full border border-border/80 bg-background/35 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            <div ref={endOfMessages} />
                        </div>
                    </div>

                    <form onSubmit={submit} className="border-t border-border/70 p-3 sm:px-4">
                        <div className="portfolio-assistant-composer flex items-end gap-2 rounded-2xl border border-border/80 bg-background/75 p-2 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                            <textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder={enabled ? 'Message the portfolio assistant...' : 'Assistant unavailable'}
                                aria-label="Your question"
                                maxLength={1200}
                                rows={2}
                                disabled={!enabled || isSending}
                                className="max-h-36 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <Button type="submit" size="icon" className="mb-0.5 rounded-full" disabled={!enabled || isSending || !input.trim()} aria-label="Send question">
                                {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </Button>
                        </div>
                        <p className="mt-2 px-1 text-[11px] leading-4 text-muted-foreground">
                            {enabled ? 'AI answers can be inaccurate. Messages are sent to an external AI provider; do not share sensitive information.' : 'AI-generated answers can be inaccurate. Do not share sensitive information.'}
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
