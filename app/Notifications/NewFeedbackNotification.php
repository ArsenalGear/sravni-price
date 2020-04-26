<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class NewFeedbackNotification extends Notification
{
    use Queueable;

    public $subject;
    public $email;
    public $phone;
    public $fullname;
    public $message;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->subject = $data['subject'];
        $this->email = $data['email'];
        $this->phone = $data['phone'];
        $this->fullname = $data['fullname'];
        $this->message = $data['message'];
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->greeting($this->subject)
            ->from(env('MAIL_USERNAME'))
            ->subject($this->subject)
            ->line('Ф.И.О: ' . $this->fullname)
            ->line('Телефон: ' . $this->phone)
            ->line('Email: ' . $this->email)
            ->line('Сообщение: ' . $this->message);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
