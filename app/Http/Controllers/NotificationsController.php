<?php

namespace App\Http\Controllers;

use App\Notifications\NewFeedbackNotification;
use Illuminate\Http\Request;
use App\Notifications\NewSubscriberNotification;
use Illuminate\Support\Facades\Notification;

class NotificationsController extends Controller
{
    public function subscribe(Request $request) {

        $this->validate(request(), [
            'emailaddress' => 'required|string|email|max:40',
        ]);

        $data = [
            'subject' => "Подписка",
            'email' => $request->get('emailaddress')
        ];

        if (!empty(setting('site.notifications_email'))) {
            Notification::route('mail', setting('site.notifications_email'))->notify(new NewSubscriberNotification($data));
        }
    }

    public function feedback(Request $request) {
        $this->validate(request(), [
            'fio' => 'required|string|max:150',
            'phone' => 'max:25',
            'eMail' => 'required|string|email|max:40',
            'message' => 'required|string|max:2000',
        ]);

        $data = [
            'subject' => "Заявка онлайн",
            'email' => $request->get('eMail'),
            'phone' => $request->get('tel'),
            'fullname' => $request->get('fio'),
            'message' => $request->get('message'),
        ];

        if (!empty(setting('site.notifications_email'))) {
            Notification::route('mail', setting('site.notifications_email'))->notify(new NewFeedbackNotification($data));
        }
    }
}
