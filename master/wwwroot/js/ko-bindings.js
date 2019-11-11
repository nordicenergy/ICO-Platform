
﻿ko.bindingHandlers.modal = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        $(element).modal({
            onOpenStart: function (modal, trigger) {
                value(true);
            },
            onCloseEnd: function () {
                value(false);
            }
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).modal("destroy");
        });
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.unwrap(value)) {
            $(element).modal('open');
        } else {
            $(element).modal('close');
        }
    }
}