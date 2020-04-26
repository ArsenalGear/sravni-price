<?php
/**
 * Created by PhpStorm.
 * User: dmitry
 * Date: 20.05.19
 * Time: 13:55
 */
namespace App;

use Illuminate\Http\Request;

Class Paginator
{
    //Создаём кастомную пагинацию для админ панели (в стандартном функционале перед разделением на пагинацию подгружаются сразу все строки модели, а не только для одной страницы
    static function createAdminPaginationHtml($countOfItems, $perPage, $active, $prefix = "")
    {
        //Добавляем префикс для опций пагинации
        if (!empty($prefix)) {
            $optionsPrefix = $prefix . "_";
        } else {
            $optionsPrefix = "";
        }

        //Вычисляем общее кол-во страниц
        $countOfPages = ceil($countOfItems / $perPage);

        if ($countOfPages > 1) {
            $left = $active - 1;
            //$right = $countOfPages - $active;
            if ($left < floor($perPage / 2)) {
                $start = 1;
            } else {
                $start = $active - floor($perPage / 2);
            }
            $end = $start + $perPage - 1;
            if ($end > $countOfPages) {
                $start -= ($end - $countOfPages);
                $end = $countOfPages;
                if ($start < 1) $start = 1;
            }
        } else {
            $start = 1;
            $end = 1;
        }

        //Генерируем вёрстку
        $urlPage = "?prefix=" . $prefix . "&" . $optionsPrefix . "per_page=" . $perPage . "&" . $optionsPrefix . "page=";
        $url = $urlPage . "1";


        $from = $perPage * $active - $perPage + 1;
        if ($active == $countOfPages) {
            $to = $countOfItems;
        } else {
            $to = $perPage * $active;
        }

        $html = '<span>Показано от ' . $from. '  до ' . $to . ' из ' . $countOfItems . ' записей</span>';

        if ($active != 1) {
            $html = $html . '<a href="' . $url . '" title="Первая страница">&lt;&lt;&lt;</a>';
            if( $active == 2 ) {
                $html = $html . '<a href="' . $url . '" title="Предыдущая страница">&lt;</a>';
            } else {
                $html = $html . '<a href="' . $urlPage . ($active - 1) . '" title="Предыдущая страница">&lt;</a>';
            }
        }

        for ($i = $start; $i <= $end; $i++) {
            if ($i == $active) {
                $html = $html . '<span class="active">' . $i . '</span>';
            } else {
                if ($i == 1) {
                    $html = $html . '<a href="' . $url . '">' . $i . '</a>';
                } else {
                    $html = $html . '<a href="' . $urlPage . $i . '">' . $i . '</a>';
                }
            }
        }

        if ($active != $countOfPages) {
            $html = $html . '<a href = ' . $urlPage . ($active + 1) . ' title="Следующая страница" >></a>';
        }
        if ($countOfPages > 1) {
            $html = $html . '<a href = ' . $urlPage . $countOfPages . ' title="Последняя страница" >>>></a>';
        } else {
            $html = "";
        }

        $styles = '<style>
                    .pagen * {
                        padding: 10px;
                    }
                    .pagen .active {
                        color:red;
                    }
                    .ajax-pagen * {
                        padding: 10px;
                    }
                    .ajax-pagen .active {
                        color:red;
                    }
                   .dataTables_wrapper .dataTables_filter, .dataTables_wrapper .dataTables_info, .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_paginate, .dataTables_wrapper .dataTables_processing {
                        display: none !important;
                    }
                </style>';


        switch ($prefix) {
            case "options":
            case "products":
            case "categories":
                $pagenClass = 'ajax-pagen';
            break;
            default:
                $pagenClass = 'pagen';
            break;
        }

        return $styles . "<div class='" . $pagenClass . "'>" . $html . "</div>";
    }
}
