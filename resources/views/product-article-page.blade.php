@extends('layouts.wrapper')

@section('content')
    <main>
        <div class="breadcrumbs">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="breadcrumbs__wrapper">
                            <a class="breadcrumbs__link" href="/obzory-tovarov/">Обзоры</a>
                            <span class="breadcrumbs__divider">/</span>
                            <span class="breadcrumbs__link breadcrumbs__link-last">{{$productArticle->name}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <section class="title-goods">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="title-goods__title">{{$productArticle->name}}</h1>
                    </div>
                </div>
            </div>
        </section>
        <section class="title-goods">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        {!! $productArticle->content !!}
                    </div>
                </div>
            </div>
        </section>
        @if (isset($productArticle->video) && !empty($productArticle->video))
            <section>
                <div class="container">
                    <div class="row">
                        <iframe width="560" height="315" src="{{$productArticle->video}}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </section>
        @endif
@endsection
