<input @if($row->required == 1) required @endif type="text" class="form-control" name="{{ $row->field }}"
        placeholder="{{ isset($options->placeholder)? old($row->field, $options->placeholder): $row->display_name }}"
       @if ( isset($options->max)) maxlength="{{$options->max}}" @endif
       {!! isBreadSlugAutoGenerator($options) !!}
       value="{{ $dataTypeContent->{$row->field} ?? old($row->field) ?? $options->default ?? '' }}">
