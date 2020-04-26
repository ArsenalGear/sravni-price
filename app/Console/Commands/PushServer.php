<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

use App\Socket\Pusher;
use React\EventLoop\Factory as ReactLoop;
use React\ZMQ\Context as ReactContext;
use React\Socket\Server as ReactServer;
use Ratchet\Wamp\WampServer;

class PushServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'socketpush:serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start ratchet socket push server';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $loop = ReactLoop::create();
        $pusher = new Pusher;
        $context = new ReactContext($loop);
        $pull = $context->getSocket(\ZMQ::SOCKET_PULL);

        $pull->bind('tcp://127.0.0.1:' . env("APP_ZMQ_PORT"));
        $pull->on('message', [$pusher, 'broadcast']);

        $port = env("APP_PUSH_PORT");

        $webSock = new ReactServer('tcp://0.0.0.0:' . $port, $loop);
        $webSock->listeners($port, '0.0.0.0');
        $webServer = new IoServer(
            new HttpServer(
                new WsServer(
                    new WampServer(
                        $pusher
                    )
                )
            ),
            $webSock
        );

        $this->info('Run handle with port ' . $port);
        $loop->run();
    }
}
