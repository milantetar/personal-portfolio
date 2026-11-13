<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New portfolio enquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{ $senderName }} sent you a message: {{ $enquirySubject }}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
                    <tr>
                        <td style="padding:0 8px 20px;font-size:13px;font-weight:bold;letter-spacing:2px;color:#475569;">{{ $siteName }}</td>
                    </tr>
                    <tr>
                        <td style="padding:0;border-radius:16px;background-color:#ffffff;border:1px solid #e2e8f0;overflow:hidden;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr><td height="5" style="height:5px;background-color:#0d9488;font-size:0;line-height:0;">&nbsp;</td></tr>
                                <tr>
                                    <td style="padding:32px 28px 24px;">
                                        <p style="margin:0 0 12px;color:#0f766e;font-size:11px;font-weight:bold;letter-spacing:2px;">NEW PORTFOLIO ENQUIRY</p>
                                        <h1 style="margin:0 0 12px;font-size:28px;line-height:36px;letter-spacing:-0.5px;">Someone wants to connect.</h1>
                                        <p style="margin:0;font-size:15px;line-height:24px;color:#64748b;">{{ $senderName }} reached out through your portfolio. Here's their message.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:0 28px 24px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                                            <tr>
                                                <td style="padding:18px 20px;word-break:break-word;">
                                                    <p style="margin:0 0 5px;font-size:16px;line-height:24px;font-weight:bold;">{{ $senderName }}</p>
                                                    <a href="{{ $replyUrl }}" style="color:#0f766e;font-size:14px;line-height:22px;text-decoration:none;">{{ $senderEmail }}</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:0 28px 28px;word-break:break-word;">
                                        <p style="margin:0 0 8px;font-size:11px;letter-spacing:1.5px;font-weight:bold;color:#64748b;">SUBJECT</p>
                                        <h2 style="margin:0 0 20px;font-size:20px;line-height:28px;">{{ $enquirySubject }}</h2>
                                        <div style="font-size:16px;line-height:27px;color:#334155;">{!! nl2br(e($messageBody)) !!}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:0 28px 32px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="background-color:#0f766e;border-radius:8px;text-align:center;">
                                                    <a href="{{ $replyUrl }}" style="display:inline-block;padding:14px 24px;border:1px solid #0f766e;border-radius:8px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Reply to message &rarr;</a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:16px 0 0;font-size:12px;line-height:20px;color:#64748b;">You can also reply to this email directly to reach the sender.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:20px 12px;font-size:12px;line-height:20px;color:#64748b;">Sent from the contact form on {{ $siteName }}.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
