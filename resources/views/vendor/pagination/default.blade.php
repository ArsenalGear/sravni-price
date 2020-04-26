@if ($paginator->hasPages())

    <div class="pagination">
        <span style="display: none" id="hiddenStartUrl"></span>

        <ul>
            {{-- Previous Page Link --}}
            @if ($paginator->onFirstPage())
                <li class="pagination__arrow-left">
                    <a class="" id="prev" href="#" title="назад"><</a>
                </li>
            @else
                <li class="pagination__arrow-left">
                    <a class="" id="prev" href="{{ $paginator->previousPageUrl() }}" title="назад"><</a>
                </li>
            @endif

            {{-- Pagination Elements --}}
            @foreach ($elements as $element)
                {{-- "Three Dots" Separator --}}
                @if (is_string($element))
                    <li class="disabled" aria-disabled="true"><span>{{ $element }}</span></li>
                @endif

                {{-- Array Of Links --}}
                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        <li class="pagination__item @if ($page == $paginator->currentPage()) active @endif">
                            <a class="pagination__link" href="{{ $url }}" title="{{ $page }}">
                                <span>{{ $page }}</span>
                            </a>
                        </li>
                    @endforeach
                @endif
            @endforeach

            {{-- Next Page Link --}}
            @if ($paginator->hasMorePages())
                <li class="pagination__arrow-right">
                    <a class="" id="next" href="{{ $paginator->nextPageUrl() }}" title="вперед">></a>
                </li>
            @else
                <li class="pagination__arrow-right disabled">
                    <a class="" id="next" href="#" title="вперед">></a>
                </li>
            @endif
        </ul>
    </div>
   {{-- <ul class="pagination" role="navigation">
        --}}{{-- Previous Page Link --}}{{--
        @if ($paginator->onFirstPage())
            <li class="disabled" aria-disabled="true" aria-label="@lang('pagination.previous')">
                <span aria-hidden="true">&lsaquo;</span>
            </li>
        @else
            <li>
                <a href="{{ $paginator->previousPageUrl() }}" rel="prev" aria-label="@lang('pagination.previous')">&lsaquo;</a>
            </li>
        @endif

        --}}{{-- Pagination Elements --}}{{--
        @foreach ($elements as $element)
            --}}{{-- "Three Dots" Separator --}}{{--
            @if (is_string($element))
                <li class="disabled" aria-disabled="true"><span>{{ $element }}</span></li>
            @endif

            --}}{{-- Array Of Links --}}{{--
            @if (is_array($element))
                @foreach ($element as $page => $url)
                    @if ($page == $paginator->currentPage())
                        <li class="active" aria-current="page"><span>{{ $page }}</span></li>
                    @else
                        <li><a href="{{ $url }}">{{ $page }}</a></li>
                    @endif
                @endforeach
            @endif
        @endforeach

        --}}{{-- Next Page Link --}}{{--
        @if ($paginator->hasMorePages())
            <li>
                <a href="{{ $paginator->nextPageUrl() }}" rel="next" aria-label="@lang('pagination.next')">&rsaquo;</a>
            </li>
        @else
            <li class="disabled" aria-disabled="true" aria-label="@lang('pagination.next')">
                <span aria-hidden="true">&rsaquo;</span>
            </li>
        @endif
    </ul>--}}
@endif


