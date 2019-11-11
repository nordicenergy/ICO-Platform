///site.js file is for global configuration.


(function ($) {
    M.AutoInit();

    //$('.tooltipped').tooltip();
    //$('.sidenav').sidenav();
    //$(".dropdown-trigger").dropdown();

    //Prevent double form submit for only registration
    $('.register-form').submit(function (e) {
        var el = $(this);
        if (el.valid() && !el.data('submitted')) {
            el.data('submitted', true);
            return;
        }
        e.preventDefault();
    });

    var defaultOptions = {
        errorClass: "has-error",
        validClass: "has-success",
        highlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group')
                .addClass(errorClass)
                .removeClass(validClass)
                .addClass("has-feedback")
                .end()
                .next('.form-control-feedback')
                .remove();
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).next('.form-control-feedback')
                .remove();

            $(element).closest(".form-group")
                .removeClass(errorClass)
                .addClass(validClass)
                .addClass("has-feedback");

        }
    };

    $.validator.setDefaults(defaultOptions);

    $.validator.unobtrusive.options = {
        errorClass: defaultOptions.errorClass,
        validClass: defaultOptions.validClass
    };
    $.validator.setDefaults({ ignore: "[data-val!=true], :hidden" });

    $('.validation-summary-errors:not(:has(li:visible))')
        .addClass('validation-summary-valid')
        .removeClass('validation-summary-errors');
})(jQuery);
