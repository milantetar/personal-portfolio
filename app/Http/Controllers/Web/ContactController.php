<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
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

        // Persist message to database so it is never lost
        $contactMessage = ContactMessage::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_read' => false,
        ]);

        $settings = SiteSetting::query()->first(['email', 'site_name']);
        $recipient = $settings?->email;

        if (is_string($recipient) && $recipient !== '') {
            try {
                Mail::send(['html' => 'emails.contact-enquiry', 'text' => 'emails.contact-enquiry-text'], [
                    'siteName' => $settings->site_name ?: config('app.name'),
                    'senderName' => $data['name'],
                    'senderEmail' => $data['email'],
                    'enquirySubject' => $data['subject'],
                    'messageBody' => $data['message'],
                    'replyUrl' => 'mailto:'.str_replace('%40', '@', rawurlencode($data['email'])).'?subject='.rawurlencode('Re: '.$data['subject']),
                ], function (Message $mail) use ($data, $recipient): void {
                    $mail->to($recipient)
                        ->replyTo($data['email'], $data['name'])
                        ->subject('Portfolio enquiry: '.$data['subject']);
                });
            } catch (Throwable $exception) {
                Log::warning('Portfolio contact email notification could not be sent, but message was saved.', [
                    'message_id' => $contactMessage->id,
                    'exception' => $exception->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Thanks for reaching out. Your message has been received.');
    }
}
