<!DOCTYPE html>
<html lang="RU-ru">
<head>
    <meta charset="utf-8">
    <title>@if(isset($meta) && !empty($meta['title'])){{$meta['title']}}@else{{setting('site.home_title')}}@endif</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="@if(isset($meta) && !empty($meta['description'])){{$meta['description']}}@else{{setting('site.home_description')}}@endif">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- Twitter Card data-->
    <meta name="twitter:title" content="@if(isset($meta) && !empty($meta['title'])){{$meta['title']}}@else{{setting('site.home_title')}}@endif">
    <meta name="twitter:description" content="@if(isset($meta) && !empty($meta['description'])){{$meta['description']}}@else{{setting('site.home_description')}}@endif">
    <meta name="twitter:image" content="/img/content/shares/twitter.jpg">
    <!-- Open Graph data-->
    <meta property="og:type" content="article">
    <meta property="og:title" content="@if(isset($meta) && !empty($meta['title'])){{$meta['title']}}@else{{setting('site.home_title')}}@endif">
    <meta property="og:description" content="@if(isset($meta) && !empty($meta['description'])){{$meta['description']}}@else{{setting('site.home_description')}}@endif">
    <meta property="og:image" content="/img/content/shares/facebook.jpg">
    <!-- Vkontakte data-->
    <link rel="image_src" href="/img/content/shares/vkontakte.jpg">
    <!-- Favicons-->
    <link rel="icon" href="/img/content/favicons/favicon.png" sizes="32x32">
    <link rel="image_src" href="/img/content/shares/vkontakte.jpg"><!-- Favicons-->
    
    @if (\Request::route()->getName() == 'home')
        @if (env('APP_ENV') == 'production')
            <meta name="cmsmagazine" content="db6af57f07f6b599af6c552a260d9994" />
        @endif
        <link href="/css/libs-index.min.css" type="text/css" rel="stylesheet" media="screen">
    @elseif (\Request::route()->getName() == 'product')
        <link href="/css/libs-index.min.css" type="text/css" rel="stylesheet" media="screen">
    @elseif (\Request::route()->getName() == 'obzory-tovarov')
        <link href="/css/libs-inside.min.css" type="text/css" rel="stylesheet" media="screen">
    @elseif (\Request::route()->getName() == 'obzor')
        <link href="/css/libs-inside.min.css" type="text/css" rel="stylesheet" media="screen">
    @else
        <link href="/css/libs-inside.min.css" type="text/css" rel="stylesheet" media="screen">
        <link href="/css/jq-ui-slider/jquery-ui.min.css" type="text/css" rel="stylesheet" media="screen">
    @endif
    
    <link href="/css/main.css" type="text/css" rel="stylesheet" media="screen">
    
</head>
<body>
<div class="overlay" id="overlay"></div>
<div class="overlay-filter" id="overlay-filter"></div>
<header class="header" id="header">
    <div class="container">
        <div class="row">
            <div class="header__wrapper">
                <a class="header__logo" href="/" title="На главную">
                    <span class="header__sravni">Sravni</span>
                    <span class="header__price">Price</span>
                </a>
                <a class="header__menu-btn button-yellow" id="menuBtn" href="#" title="Товары">
                        <span class="menu-btn">
                            <span></span>
                        </span>
                    <div>товары</div>
                </a>
                <a class="header__sale" href="/sales" title="Скидки">Скидки</a>
                <form class="header__search input-default">
                    <input maxlength="100" id="search-input" placeholder="Поиск товара" type="text" />
                    <button class="header__button-search" type="submit"></button>
                </form>
                <a class="header__select-block" href="#chooseRegion" title="Выбрать регион">
                    @if (!empty($city))
                        <span class="header__select">{{$city->name_first_form}}</span>
                    @else
                        <span class="header__select">Москва</span>
                    @endif
                </a>
            </div>
        </div>
    </div>
</header>
<nav class="drop-down">
    <div class="container">
        <ul id="drop-down">
            <div class="modal__close-modal"></div>
            @if(!empty($menu) && isset($menu))
                @foreach ($menu as $i => $item)
                    <li>
                        <a class="drop-down__link" href="/{{$item->url}}" title="{{$item->name}}">
                            <div class="drop-down__img-block">
                                <img class="drop-down__img" src="/storage/{{$item->icon}}" alt="{{$item->name}}" role="presentation" />
                            </div>
                            <span class="drop-down__desc">{{$item->name}}</span>
                        </a>
                    </li>
                    @if($i > 10)
                        @break
                    @endif
                @endforeach
            @endif
        </ul>
    </div>
</nav>
