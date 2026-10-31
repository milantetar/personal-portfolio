import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUp, Bot, LoaderCircle } from 'lucide-react';

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

const suggestedQuestions = [
    'What Laravel projects has Milan built?',
    'What experience does Milan have?',
    'Which technologies does he use?',
];

export function PortfolioAssistant({ enabled }: PortfolioAssistantProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
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

        const history = [...messages];
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
            setMessages((current) => current.at(-1)?.role === 'user' ? current.slice(0, -1) : current);
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
        <section id="assistant" aria-labelledby="assistant-heading" className="portfolio-section portfolio-section--assistant portfolio-assistant-page">
            <div className={`portfolio-section-inner portfolio-assistant-layout ${messages.length ? 'has-messages' : 'is-empty'}`}>
                {messages.length === 0 ? (
                    <motion.header
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="portfolio-assistant-welcome"
                    >
                        <span className="portfolio-assistant-mark"><Bot className="size-5" aria-hidden="true" /></span>
                        <p className="eyebrow">Portfolio assistant</p>
                        <h1 id="assistant-heading" className="font-display">What would you like to know?</h1>
                        <p className="portfolio-assistant-description">Ask about Milan's projects, Laravel experience, skills, or certificates.</p>
                    </motion.header>
                ) : (
                    <div className="portfolio-assistant-conversation" aria-live="polite" aria-relevant="additions text">
                        {messages.map((message, index) => (
                            <motion.div
                                key={`${message.role}-${index}`}
                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className={`portfolio-assistant-message portfolio-assistant-message--${message.role}`}
                            >
                                {message.role === 'assistant' ? <Bot className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
                                <p>{message.content}</p>
                            </motion.div>
                        ))}
                        {isSending ? <p className="portfolio-assistant-pending" role="status"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Thinking…</p> : null}
                        <div ref={endOfMessages} />
                    </div>
                )}

                <div className="portfolio-assistant-compose-area">
                    {!enabled ? <p className="portfolio-assistant-unavailable" role="status">The assistant is temporarily unavailable. Please try again later.</p> : null}
                    {error ? <p className="portfolio-assistant-error" role="alert">{error}</p> : null}
                    <form onSubmit={submit}>
                        <div className="portfolio-assistant-composer-box">
                            <textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder={enabled ? "Ask about Milan's work…" : 'Assistant unavailable'}
                                aria-label="Ask the portfolio assistant a question"
                                maxLength={1200}
                                rows={2}
                                disabled={!enabled || isSending}
                            />
                            <div className="portfolio-assistant-composer-footer">
                                <span>Enter to send · Shift + Enter for a new line</span>
                                <Button type="submit" size="icon" className="portfolio-assistant-send" disabled={!enabled || isSending || !input.trim()} aria-label="Send question">
                                    {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                    <p className="portfolio-assistant-disclaimer">Answers use published portfolio content and may be inaccurate. Do not share sensitive information.</p>
                </div>

                {messages.length === 0 && enabled ? (
                    <div className="portfolio-assistant-suggestions" aria-label="Suggested questions">
                        {suggestedQuestions.map((question) => (
                            <button key={question} type="button" disabled={isSending} onClick={() => void sendMessage(question)}>
                                {question}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
