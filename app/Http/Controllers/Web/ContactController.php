<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactController extends Controller
{
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Silently accept bot submissions to avoid revealing the honeypot field.
        if (filled($data['website'] ?? null)) {
            return back()->with('success', 'Thanks for reaching out. Your message has been sent.');
        }

        $recipient = SiteSetting::query()->value('email');

        if (! is_string($recipient) || $recipient === '') {
            return back()->with('error', 'The site owner has not configured a contact email yet.');
        }

        $body = implode("\n\n", [
            'From: ' . $data['name'],
            'Reply email: ' . $data['email'],
            'Subject: ' . $data['subject'],
            'Message:',
            $data['message'],
        ]);

        try {
            Mail::raw($body, function (Message $mail) use ($data, $recipient): void {
                $mail->to($recipient)
                    ->replyTo($data['email'], $data['name'])
                    ->subject('Portfolio enquiry: ' . $data['subject']);
            });
        } catch (Throwable $exception) {
            Log::error('Portfolio contact email could not be sent.', [
                'exception' => $exception->getMessage(),
            ]);

            return back()->with('error', 'We could not send your message right now. Please try again or use the email link.');
        }

        return back()->with('success', 'Thanks for reaching out. Your message has been sent.');
    }
}
