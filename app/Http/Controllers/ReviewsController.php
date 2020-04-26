<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Review;

class ReviewsController extends Controller
{
    public function createReview(Request $request, $productId)
    {
        $this->validate(request(), [
            'name' => 'max:150',
            'advantages' => 'required|string|max:1000',
            'limitations' =>  'required|string|max:1000',
            'comment' => 'max:2000',
            'experience_of_using' => 'max:1000',
            'rate' => 'required|numeric',
            'recommended' => 'required',
        ]);

        $secret = '6LfinKkUAAAAABejAGsuNSw-7NG_1v_JcZJPQWQD';

        $recaptcha = new \ReCaptcha\ReCaptcha($secret);

        $resp = $recaptcha->setExpectedHostname(\Request::getHost())
            ->verify($request->get('g-recaptcha-response'), \Request::getHost());

        if ($resp->isSuccess()) {
            return Review::create([
                    'name' => $request->get('name'),
                    'advantages' => $request->get('advantages'),
                    'limitations' => $request->get('limitations'),
                    'comment' => $request->get('comment'),
                    'experience_of_using' => $request->get('experience_of_using'),
                    'rate' => $request->get('rate'),
                    'recommended' => $request->get('recommended'),
                    'product_id' => intval($productId)
                ]
            );
        } else {
            throw new \Exception(json_encode($resp->getErrorCodes()));
        }
    }
}
