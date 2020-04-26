@extends('layouts.wrapper')

@section('content')
<main>
    <section class="overview overview-inside">
        <div class="container">
            <div class="row">
                <h1>Обзоры товаров</h1>
            </div>
            @if (isset($mainProductArticle) && !empty($mainProductArticle))
                <div class="row">
                        <div class="col-12 col-sm-12 col-md-12 col-lg-5">
                            <div class="overview__big-feed">
                                <a class="overview__img-big-block" href="#" title="#">
                                    <img class="overview__img-big" src="/storage/{{$mainProductArticle->preview_image}}" alt="#" title="" />
                                </a>
                            </div>
                        </div>
                        <div class="col-12 col-sm-12 col-md-12 col-lg-7">
                            <h3 class="overview__big-title">{{$mainProductArticle->name}}</h3>
                            <p class="overview__par">{{$mainProductArticle->preview_description}}</p><a class="overview__show-btn button button-blue" href="/obzory-tovarov/{{$mainProductArticle->slug}}" title="#">читать подробнее</a>
                        </div>
                    @if (isset($productArticlesList) && !empty($productArticlesList))
                        <div class="col-12">
                            <div class="row">
                                @foreach ($productArticlesList as $productArticle)
                                    <div class="col-6 col-sm-4 col-md-4 col-lg-3">
                                        <a class="overview__small-card" href="/obzory-tovarov/{{$productArticle->slug}}" title="#">
                                            <div class="overview__img-small-block">
                                                <img class="overview__img-small" src="{{\Voyager::image($productArticle->thumbnail('preview', 'preview_image'))}}" alt="#" title="" />
                                            </div>
                                            <span class="overview__desc-small">{{mb_strimwidth($productArticle->preview_description, 0, 110, "...")}}</span>
                                        </a>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </div>
            @endif
        </div>
    </section>
    {{ $productArticlesList->links('vendor/pagination/default') }}
@endsection
