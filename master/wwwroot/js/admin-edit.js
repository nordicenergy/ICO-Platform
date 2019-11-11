var dateFormat = 'YYYY/MM/DD HH:mm';

function Model() {
    var self = this;
    console.log("Model()");
    self.periods = ko.observableArray();
    self.stratisExtPubKeyEnabled = data.stratisExtPubKeyEnabled;
    self.bitcoinExtPubKeyEnabled = data.bitcoinExtPubKeyEnabled;
    self.kycSelectedId = ko.observable(data.kycSelectedId);
    self.startDate = ko.observable(new Date(data.startDate));
    self.offset = function () { return moment().utcOffset(); };
    self.setMinStartDate = function (m, e) {
        var date = self.startDate() < new Date() ? self.startDate() : new Date();
        self.setMinDate(e.currentTarget, date);
    };

    self.setMinDate = function (element, date) {
        console.log("set min date");
        $(element).bootstrapMaterialDatePicker('setMinDate', moment(date));
    };
    self.init = function () {
        console.log("Model init with existing periods");
        _.each(data.periods, function (p) { self.addPeriod(new BonusPeriod(new Date(p.endDate), p.bfnAmount, p.btcAmount)); });

        if (data.periods.length == 0) {
            var date = moment().add(1, 'days').toDate();
            self.addPeriod(new BonusPeriod(date, 0, 0));
        }
    }

    self.format = function (date) {
        date = ko.unwrap(date);
        return moment(date).format(dateFormat);
    };

    function BonusPeriod(endDate, bfnAmount, btcAmount) {
        var period = this;
        console.log("bonus period, endDAte " + endDate);
        period.beginDate = ko.computed(function () {
            //Get previous period's endDate
            var periods = self.periods();
            var index = periods.indexOf(period);
            while (true) {
                var prev = periods[--index];
                if (prev == null)
                    return self.startDate();
                if (prev.endDate())
                    return prev.endDate();
            }
        });
        period.endDate = ko.observable(endDate);
        period.stratAmount = stratAmount;
        period.btcAmount = btcAmount;
        period.valid = ko.computed(function () { return period.beginDate() <= period.endDate(); });
        console.log("is period valid " + period.valid());
        period.setMinDate = function (period, e) {
            self.setMinDate(e.currentTarget, period.beginDate());
        }
    }

    self.hasInvalidPeriod = ko.computed(function () {
        return self.periods().some(function (p) {
            console.log("begin date " + p.beginDate());
            console.log("end date " + p.endDate());
            return !p.valid();
        });
    });

    self.submitAttempted = ko.observable(false);
    self.save = function () {
        self.submitAttempted(true);
        if (!self.hasInvalidPeriod() && self.disclaimerValid())
            return true;
    }

    self.disclaimerRead = ko.observable(data.disclaimerAgreement);
    self.disclaimerAgreement = ko.observable(data.disclaimerAgreement);
    self.disclaimerValid = ko.computed(function () {
        return self.disclaimerAgreement() || self.disclaimerRead();
    });
    self.scrollDisclaimer = function (m, e) {
        var el = $(e.currentTarget);
        if (el.scrollTop() + el.innerHeight() + 1 >= e.currentTarget.scrollHeight) {
            self.disclaimerRead(true);
        }
    }
    self.add = function () {
        console.log("Add NULL Period");
        var prevPeriod = _.last(self.periods());
        var date = prevPeriod == null ? new Date() : moment(prevPeriod.endDate()).add(1, 'days').toDate();
        self.addPeriod(new BonusPeriod(date, 0, 0));
    }

    self.addPeriod = function (period) {
        console.log("Add Period to Periods");
        self.periods.push(period);
        var startDate = period.beginDate();
        if (startDate < new Date()) startDate = new Date();
        // IG: A bit of a hack but seem to work
        $("#sales-table tr:last .date").bootstrapMaterialDatePicker('setMinDate', moment(startDate));
    }

    self.remove = function (period, e) {
        self.periods.remove(period);
    }

    function getPeriodElement(period) {
        var index = self.periods.indexOf(period) + 1;
        return $('.bonus-periods tbody tr:nth-child(' + index + ') input.date');
    }
}

ko.bindingHandlers.dateTimePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        console.log("datetimepicker init");
        //initialize datepicker with some optional options
        //Todo : MaterialDatePicker plugin is different plugin so these settings should to be updated according to this plugin.
        var options = $.extend({
            showTodayButton: true,
            showClose: true,
            format: dateFormat,
            useCurrent: false,
        }, allBindingsAccessor().dateTimePickerOptions || {});
        $(element).bootstrapMaterialDatePicker(options);

        //when a user changes the date, update the view model
        ko.utils.registerEventHandler(element, "change", function (event) {
            console.log("datetimepicker register");
            var value = valueAccessor();
            if (ko.isObservable(value)) {
                var val = $(element).val();
                value(new Date(val));
            }
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            console.log("datetimepicker addDisposeCallback");
            $(element).bootstrapMaterialDatePicker('destroy');
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        console.log("datetimepicker update");
        //when the view model is updated, update the widget
        var date = ko.unwrap(valueAccessor());

        $(element).bootstrapMaterialDatePicker('setDate', moment(date));
    }
};
var model = new Model();
ko.applyBindings(model);
model.init();
