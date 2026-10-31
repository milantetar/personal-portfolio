<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status', 'all')->toString();
        $search = $request->string('search')->trim()->toString();

        $query = ContactMessage::query()->latest('id');

        if ($status === 'unread') {
            $query->where('is_read', false);
        } elseif ($status === 'read') {
            $query->where('is_read', true);
        }

        if ($search !== '') {
            $query->where(function ($sub) use ($search): void {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate(15)->withQueryString();
        $unreadCount = ContactMessage::query()->where('is_read', false)->count();

        return inertia('admin/messages', [
            'messages' => $messages,
            'unreadCount' => $unreadCount,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function update(Request $request, ContactMessage $message): RedirectResponse
    {
        $validated = $request->validate([
            'is_read' => ['sometimes', 'boolean'],
            'mark_replied' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['is_read'])) {
            $message->update(['is_read' => (bool) $validated['is_read']]);
        }

        if (! empty($validated['mark_replied'])) {
            $message->update([
                'is_read' => true,
                'replied_at' => now(),
            ]);
        }

        return back()->with('success', 'Message status updated.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return back()->with('success', 'Message deleted.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:contact_messages,id'],
        ]);

        ContactMessage::query()->whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']).' messages deleted.');
    }

    public function bulkMarkRead(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:contact_messages,id'],
        ]);

        ContactMessage::query()->whereIn('id', $validated['ids'])->update(['is_read' => true]);

        return back()->with('success', count($validated['ids']).' messages marked as read.');
    }
}
