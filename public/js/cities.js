function getCitiesByRegionId(regionId) {
    
    $.ajax({
        type: "POST",
        url: '/get-cities-by-region-id/' + regionId,
        success: data => {
            
            for (i = 0; i < data.length; i++) {
                
                let transferInput = '<a class="add-shop__region" data-slug="'+data[i].slug+'" href="#" title="#">' + data[i].name_first_form + '</a>';
                
                $('.add-shop__regions-block').append(transferInput);
            }
        }
    });
}

function getRegions() {
    
    $.ajax({
        type: "POST",
        url: '/get-regions',
        success: data => {
            
            $('#countrySelect').select2();
            // $('#countrySelect').val('');
            
            let options = $('#countrySelect');
            
            for (let i = 0; i < data.length; i++) {
                
                options.append($("<option />").val(data[i].id).text(data[i].name));
            }
            
            $('.add-shop__regions-block').html('');
            
            getCitiesByRegionId($('#countrySelect').val());
        }
    });
}

function changeRegion() {
    
    $.ajax({
        type: "POST",
        url: '/get-regions',
        success: data => {
            
            $('.add-shop__regions-block').html('');
            
            getCitiesByRegionId($('#countrySelect').val());
        }
    });
}

