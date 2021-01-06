$(document).ready(function () {

    // Dropdown
    //-------------------------------------------------
    $(this).on('click', '.dropdown', '[data-popup-id]', function () {
        $(this).toggleClass('active');

        if ($(this).is('[data-popup-id]')) {
            let id = $('#' + $(this).data('popup-id'));
            let i = 0, j = 0;

            id.attr('class').split(/\s+/).map(function (cls) {
                i++;
                switch (cls) {
                    case 'show':
                        id.removeClass('show');
                        break;
                    default:
                        j++;
                        break;
                }
            });
            if (i == j) id.addClass('show');
        }
    });

    // Modal / Drawer
    //-------------------------------------------------
    $(this).on('click', '[data-modal-id]', function () {
        let id = $('#' + $(this).data('modal-id'));
        let i = 0, j = 0;

        id.attr('class').split(/\s+/).map(function (cls) {
            i++;
            switch (cls) {
                case 'show':
                    id.removeClass('show');
                    $(body).removeClass('noscroll');
                    break;
                default:
                    j++;
                    break;
            }
        });
        if (i == j) {
            id.addClass('show');
            $(body).addClass('noscroll');
        }
    });

    // Accordeon
    //-------------------------------------------------
    $(this).on('click', '.accordeon-item', function () {

        if ($(this).hasClass('show')) $(this).removeClass('show');
        else
            $(this)
                .not('.show')
                .addClass('show')
                .parent('.accordeon')
                .parent()
                .find('.accordeon-item.show')
                .not(this)
                .removeClass('show');
    });

    // Smooth Scroll
    //-------------------------------------------------
    $($('a[href*="#"]:not([href="#"])')).click(function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: $(this.hash).offset().top}, 500);
        location.hash = $(this).attr('href');
    });

    // Menu Active Hash
    //-------------------------------------------------
    $(window).scroll(function () {
        $('[data-hash]').each(function () {
            if ($(this).children().visible(true, 'both')) {
                let hash = $(this).data('hash');
                let menu = $('#header').find('.body > menu');
                menu.children('a[href*="#"]').removeClass('active');
                menu.children('a[href="#' + hash + '"]').addClass('active');
            }
        });
    });
});